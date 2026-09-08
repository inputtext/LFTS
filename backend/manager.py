from __future__ import annotations

import asyncio
import uuid
from typing import Any

from fastapi import WebSocket

from .models import Peer, TransferSession


class ConnectionManager:
    """In-memory registry for connected peers and short-lived transfer sessions."""

    def __init__(self) -> None:
        self.peers: dict[str, Peer] = {}
        self.sessions: dict[str, TransferSession] = {}
        self._lock = asyncio.Lock()

    async def register_peer(
        self,
        websocket: WebSocket,
        *,
        peer_id: str | None = None,
        device_name: str = "Unknown device",
        device_type: str = "unknown",
        browser: str = "Unknown browser",
    ) -> Peer:
        async with self._lock:
            resolved_id = peer_id or uuid.uuid4().hex
            while resolved_id in self.peers:
                resolved_id = uuid.uuid4().hex
            peer = Peer(
                peer_id=resolved_id,
                websocket=websocket,
                device_name=device_name,
                device_type=device_type,
                browser=browser,
            )
            self.peers[resolved_id] = peer
            return peer

    async def remove_peer(self, peer_id: str) -> None:
        async with self._lock:
            self.peers.pop(peer_id, None)
            stale = [
                session_id
                for session_id, session in self.sessions.items()
                if session.sender_id == peer_id or session.receiver_id == peer_id
            ]
            for session_id in stale:
                self.sessions.pop(session_id, None)

    async def set_mode(self, peer_id: str, mode: str | None) -> Peer | None:
        async with self._lock:
            peer = self.peers.get(peer_id)
            if peer is not None:
                peer.mode = mode
            return peer

    def list_peers(self, *, exclude: str | None = None, mode: str | None = None) -> list[Peer]:
        return [
            peer
            for peer in self.peers.values()
            if peer.peer_id != exclude and (mode is None or peer.mode == mode)
        ]

    async def send(self, peer_id: str, payload: dict[str, Any]) -> bool:
        peer = self.peers.get(peer_id)
        if peer is None:
            return False
        try:
            await peer.websocket.send_json(payload)
            return True
        except Exception:
            await self.remove_peer(peer_id)
            return False

    async def create_session(
        self,
        sender_id: str,
        *,
        receiver_id: str | None = None,
        file_name: str | None = None,
        file_size: int | None = None,
    ) -> TransferSession:
        async with self._lock:
            session = TransferSession(
                session_id=uuid.uuid4().hex,
                sender_id=sender_id,
                receiver_id=receiver_id,
                file_name=file_name,
                file_size=file_size,
            )
            self.sessions[session.session_id] = session
            return session

    def get_session(self, session_id: str) -> TransferSession | None:
        return self.sessions.get(session_id)

    async def update_session(self, session_id: str, **changes: Any) -> TransferSession | None:
        async with self._lock:
            session = self.sessions.get(session_id)
            if session is None:
                return None
            for key, value in changes.items():
                if hasattr(session, key):
                    setattr(session, key, value)
            return session


manager = ConnectionManager()
