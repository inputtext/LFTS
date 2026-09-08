from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class Peer:
    peer_id: str
    websocket: Any
    device_name: str = "Unknown device"
    device_type: str = "unknown"
    browser: str = "Unknown browser"
    mode: str | None = None


@dataclass(slots=True)
class TransferSession:
    session_id: str
    sender_id: str
    receiver_id: str | None = None
    file_name: str | None = None
    file_size: int | None = None

    def metadata(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "file_name": self.file_name,
            "file_size": self.file_size,
        }
