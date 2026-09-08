export const CHUNK_SIZE = 16 * 1024;

type SignalMessage = Record<string, unknown> & { type: string };
export type TransferMode = "send" | "receive";

export type PeerInfo = {
  peer_id: string;
  device_name: string;
  device_type: string;
  browser: string;
  mode: TransferMode | null;
};

export type TransferMeta = {
  session_id: string;
  sender_id: string;
  receiver_id: string | null;
  file_name: string | null;
  file_size: number | null;
};

type Callbacks = {
  peers: (peers: PeerInfo[]) => void;
  modeSet: (mode: TransferMode | null) => void;
  incoming: (session: TransferMeta) => void;
  connected: (peerId: string) => void;
  progress: (sent: number, total: number) => void;
  received: (file: File) => void;
  error: (message: string) => void;
};

const createPeerId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `peer-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const signalingUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SIGNALING_URL?.trim();
  if (typeof window === "undefined") return configured || "ws://localhost:8000/ws";

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const hostname = window.location.hostname;
  const isLocalPage = hostname === "localhost" || hostname === "127.0.0.1";
  const configuredIsLocalhost = !!configured && /^wss?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configured);

  if (!configured || (configuredIsLocalhost && !isLocalPage)) {
    return `${protocol}//${hostname}:8000/ws`;
  }
  return configured;
};

export class FluidWebRTC {
  private ws: WebSocket | null = null;
  private readonly peerId = createPeerId();
  private readonly pcs = new Map<string, RTCPeerConnection>();
  private readonly channels = new Map<string, RTCDataChannel>();
  private readonly pendingIce = new Map<string, RTCIceCandidateInit[]>();
  private readonly callbacks: Callbacks;
  private receive: { name: string; type: string; size: number; chunks: ArrayBuffer[]; bytes: number } | null = null;

  constructor(callbacks: Callbacks) {
    this.callbacks = callbacks;
  }

  get id() {
    return this.peerId;
  }

  connect() {
    if (typeof window === "undefined" || typeof WebSocket === "undefined") {
      this.callbacks.error("WebSocket is unavailable in this browser.");
      return;
    }
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) return;

    const url = signalingUrl();
    try {
      this.ws = new WebSocket(url);
    } catch {
      this.callbacks.error(`Unable to open signaling connection to ${url}.`);
      return;
    }
    this.ws.onopen = () => {
      this.send({
        type: "hello",
        peer_id: this.peerId,
        device_name: this.deviceName(),
        device_type: this.deviceType(),
        browser: navigator.userAgent,
      });
    };
    this.ws.onmessage = (event) => {
      try {
        void this.handleSignal(JSON.parse(event.data) as SignalMessage);
      } catch {
        this.callbacks.error("Invalid signaling message received.");
      }
    };
    this.ws.onerror = () => this.callbacks.error(`Signaling server unreachable at ${url}.`);
    this.ws.onclose = () => {
      this.ws = null;
      for (const pc of this.pcs.values()) pc.close();
      this.pcs.clear();
      this.channels.clear();
      this.pendingIce.clear();
    };
  }

  close() {
    for (const pc of this.pcs.values()) pc.close();
    this.pcs.clear();
    this.channels.clear();
    this.pendingIce.clear();
    this.ws?.close();
    this.ws = null;
  }

  setMode(mode: TransferMode | null) {
    this.send({ type: "set_mode", mode });
  }

  createTransfer(receiverId: string, file: File) {
    this.send({ type: "transfer_create", receiver_id: receiverId, file_name: file.name, file_size: file.size });
  }

  private async handleSignal(message: SignalMessage) {
    switch (message.type) {
      case "peers":
        this.callbacks.peers((message.peers ?? []) as PeerInfo[]);
        break;
      case "mode_set":
        this.callbacks.modeSet((message.mode as TransferMode | null) ?? null);
        break;
      case "transfer_invite":
        this.callbacks.incoming(message.session as TransferMeta);
        break;
      case "transfer_accepted": {
        const session = message.session as TransferMeta;
        if (session.receiver_id) await this.startOffer(session.receiver_id);
        break;
      }
      case "offer":
        await this.handleOffer(String(message.source_peer_id), message.offer as RTCSessionDescriptionInit);
        break;
      case "answer": {
        const peerId = String(message.source_peer_id);
        const pc = this.pcs.get(peerId);
        if (pc) {
          await pc.setRemoteDescription(message.answer as RTCSessionDescriptionInit);
          await this.flushIce(peerId);
        }
        break;
      }
      case "ice_candidate": {
        const peerId = String(message.source_peer_id);
        const candidate = message.candidate as RTCIceCandidateInit | undefined;
        if (candidate) await this.addIceCandidate(peerId, candidate);
        break;
      }
      case "error":
        this.callbacks.error(String(message.code ?? "Unknown server error"));
        break;
    }
  }

  acceptTransfer(session: TransferMeta) {
    this.ensurePeer(session.sender_id, false);
    this.send({ type: "transfer_accept", session_id: session.session_id });
  }

  private async startOffer(peerId: string) {
    const pc = this.ensurePeer(peerId, true);
    const channel = pc.createDataChannel("fluid-file", { ordered: true });
    this.attachChannel(peerId, channel);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.send({ type: "offer", target_peer_id: peerId, offer: pc.localDescription });
  }

  private async handleOffer(peerId: string, offer: RTCSessionDescriptionInit) {
    const pc = this.ensurePeer(peerId, false);
    await pc.setRemoteDescription(offer);
    await this.flushIce(peerId);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.send({ type: "answer", target_peer_id: peerId, answer: pc.localDescription });
  }

  private async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
    const pc = this.pcs.get(peerId);
    if (!pc || !pc.remoteDescription) {
      const queued = this.pendingIce.get(peerId) ?? [];
      queued.push(candidate);
      this.pendingIce.set(peerId, queued);
      return;
    }
    try {
      await pc.addIceCandidate(candidate);
    } catch {
      this.callbacks.error("Unable to add ICE candidate.");
    }
  }

  private async flushIce(peerId: string) {
    const pc = this.pcs.get(peerId);
    const queued = this.pendingIce.get(peerId) ?? [];
    if (!pc || !pc.remoteDescription || !queued.length) return;
    this.pendingIce.delete(peerId);
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        this.callbacks.error("Unable to add queued ICE candidate.");
      }
    }
  }

  private ensurePeer(peerId: string, _initiator: boolean) {
    const existing = this.pcs.get(peerId);
    if (existing) return existing;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.onicecandidate = (event) => {
      if (event.candidate) this.send({ type: "ice_candidate", target_peer_id: peerId, candidate: event.candidate.toJSON() });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") this.callbacks.connected(peerId);
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) this.callbacks.error(`Peer connection ${pc.connectionState}.`);
    };
    pc.ondatachannel = (event) => this.attachChannel(peerId, event.channel);
    this.pcs.set(peerId, pc);
    return pc;
  }

  private attachChannel(peerId: string, channel: RTCDataChannel) {
    this.channels.set(peerId, channel);
    channel.binaryType = "arraybuffer";
    channel.onmessage = (event) => this.handleData(event.data);
    channel.onerror = () => this.callbacks.error("Data channel error.");
  }

  async sendFile(peerId: string, file: File) {
    const channel = this.channels.get(peerId);
    if (!channel || channel.readyState !== "open") throw new Error("WebRTC data channel is not open.");
    channel.send(JSON.stringify({ type: "file-start", name: file.name, mime: file.type || "application/octet-stream", size: file.size }));
    let offset = 0;
    while (offset < file.size) {
      while (channel.bufferedAmount > CHUNK_SIZE * 32) await new Promise((resolve) => setTimeout(resolve, 10));
      const chunk = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
      channel.send(chunk);
      offset += chunk.byteLength;
      this.callbacks.progress(offset, file.size);
    }
    channel.send(JSON.stringify({ type: "file-end" }));
  }

  private handleData(data: unknown) {
    if (typeof data === "string") {
      const message = JSON.parse(data) as Record<string, unknown>;
      if (message.type === "file-start") {
        this.receive = { name: String(message.name), type: String(message.mime ?? "application/octet-stream"), size: Number(message.size), chunks: [], bytes: 0 };
      } else if (message.type === "file-end" && this.receive) {
        const file = new File(this.receive.chunks, this.receive.name, { type: this.receive.type });
        this.callbacks.progress(this.receive.size, this.receive.size);
        this.callbacks.received(file);
        this.receive = null;
      }
      return;
    }
    if (!this.receive) return;
    if (data instanceof ArrayBuffer) {
      this.receive.chunks.push(data);
      this.receive.bytes += data.byteLength;
      this.callbacks.progress(this.receive.bytes, this.receive.size);
    }
  }

  private send(message: SignalMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(message));
  }

  private deviceName() {
    return /Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobile device" : "Laptop / Desktop";
  }

  private deviceType() {
    return /iPad/i.test(navigator.userAgent) ? "tablet" : /Android|iPhone/i.test(navigator.userAgent) ? "phone" : "desktop";
  }
}
