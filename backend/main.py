from __future__ import annotations

from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .manager import manager

app = FastAPI(title="Fluid Signaling Server", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "fluid-signaling",
        "peers": len(manager.peers),
    }


def public_peer(peer: Any) -> dict[str, str | None]:
    return {
        "peer_id": peer.peer_id,
        "device_name": peer.device_name,
        "device_type": peer.device_type,
        "browser": peer.browser,
        "mode": peer.mode,
    }


async def broadcast_peers() -> None:
    peers = [public_peer(peer) for peer in manager.peers.values()]
    for peer in list(manager.peers.values()):
        visible = [item for item in peers if item["peer_id"] != peer.peer_id and item["mode"] is not None]
        await manager.send(peer.peer_id, {"type": "peers", "peers": visible})


async def handle_message(peer_id: str, message: dict[str, Any]) -> None:
    message_type = message.get("type")

    if message_type == "hello":
        await manager.send(
            peer_id,
            {"type": "registered", "peer": public_peer(manager.peers[peer_id])},
        )
        await broadcast_peers()
        return

    if message_type == "set_mode":
        requested = message.get("mode")
        mode = requested if requested in {"send", "receive"} else None
        await manager.set_mode(peer_id, mode)
        await manager.send(peer_id, {"type": "mode_set", "mode": mode})
        await broadcast_peers()
        return

    if message_type == "list_peers":
        await manager.send(
            peer_id,
            {
                "type": "peers",
                "peers": [
                    public_peer(peer)
                    for peer in manager.list_peers(exclude=peer_id)
                    if peer.mode is not None
                ],
            },
        )
        return

    if message_type == "transfer_create":
        sender = manager.peers.get(peer_id)
        if sender is None or sender.mode != "send":
            await manager.send(peer_id, {"type": "error", "code": "SENDER_MODE_REQUIRED"})
            return

        receiver_id = message.get("receiver_id")
        receiver = manager.peers.get(receiver_id) if isinstance(receiver_id, str) else None
        if receiver is None or receiver.mode != "receive":
            await manager.send(peer_id, {"type": "error", "code": "RECEIVER_NOT_READY"})
            return

        session = await manager.create_session(
            peer_id,
            receiver_id=receiver_id,
            file_name=message.get("file_name"),
            file_size=message.get("file_size"),
        )
        await manager.send(peer_id, {"type": "transfer_created", "session": session.metadata()})
        await manager.send(
            receiver_id,
            {"type": "transfer_invite", "session": session.metadata()},
        )
        return

    if message_type == "transfer_accept":
        session_id = message.get("session_id")
        session = manager.get_session(session_id)
        if session is None:
            await manager.send(peer_id, {"type": "error", "code": "SESSION_NOT_FOUND"})
            return
        receiver = manager.peers.get(peer_id)
        if receiver is None or receiver.mode != "receive":
            await manager.send(peer_id, {"type": "error", "code": "RECEIVER_MODE_REQUIRED"})
            return
        if session.receiver_id not in (None, peer_id):
            await manager.send(peer_id, {"type": "error", "code": "SESSION_ALREADY_ASSIGNED"})
            return
        session = await manager.update_session(session_id, receiver_id=peer_id)
        if session is None:
            await manager.send(peer_id, {"type": "error", "code": "SESSION_NOT_FOUND"})
            return
        await manager.send(session.sender_id, {"type": "transfer_accepted", "session": session.metadata()})
        return

    if message_type in {"offer", "answer", "ice_candidate"}:
        target_peer_id = message.get("target_peer_id")
        if not isinstance(target_peer_id, str):
            await manager.send(peer_id, {"type": "error", "code": "TARGET_REQUIRED"})
            return

        payload = dict(message)
        payload["source_peer_id"] = peer_id
        if not await manager.send(target_peer_id, payload):
            await manager.send(peer_id, {"type": "error", "code": "PEER_NOT_FOUND"})
        return

    if message_type == "ping":
        await manager.send(peer_id, {"type": "pong"})
        return

    await manager.send(peer_id, {"type": "error", "code": "UNKNOWN_MESSAGE_TYPE"})


@app.websocket("/ws")
async def signaling_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()

    peer_id: str | None = None
    try:
        hello = await websocket.receive_json()
        if hello.get("type") != "hello":
            await websocket.send_json({"type": "error", "code": "HELLO_REQUIRED"})
            await websocket.close(code=1008)
            return

        peer = await manager.register_peer(
            websocket,
            peer_id=hello.get("peer_id"),
            device_name=str(hello.get("device_name") or "Unknown device"),
            device_type=str(hello.get("device_type") or "unknown"),
            browser=str(hello.get("browser") or "Unknown browser"),
        )
        peer_id = peer.peer_id
        await handle_message(peer_id, hello)

        while True:
            message = await websocket.receive_json()
            if peer_id not in manager.peers:
                break
            await handle_message(peer_id, message)

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        if peer_id and peer_id in manager.peers:
            await manager.send(peer_id, {"type": "error", "code": "SERVER_ERROR", "detail": str(exc)})
    finally:
        if peer_id:
            await manager.remove_peer(peer_id)
            await broadcast_peers()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
