export const CHUNK_SIZE = 16 * 1024;

type SignalMessage = Record<string, unknown> & { type: string };
export type PeerInfo = {
  peer_id: string;
  device_name: string;
  device_type: string;
  browser: string;
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
  incoming: (session: TransferMeta) => void;
  connected: (peerId: string) => void;
  progress: (sent: number, total: number) => void;
  received: (file: File) => void;
  error: (message: string) => void;
};

const signalingUrl = () => {
  if (process.env.NEXT_PUBLIC_SIGNALING_URL) return process.env.NEXT_PUBLIC_SIGNALING_URL;
  if (typeof window === "undefined") return "ws://localhost:8000/ws";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:8000/ws`;
};

export class FluidWebRTC {
  private ws: WebSocket | null = null;
  private readonly peerId = crypto.randomUUID();
  private readonly pcs = new Map<string, RTCPeerConnection>();
  private readonly channels = new Map<string, RTCDataChannel>();
  private readonly callbacks: Callbacks;
  private receive: { name: string; type: string; size: number; chunks: ArrayBuffer[]; bytes: number } | null = null;

  constructor(callbacks: Callbacks) {
    this.callbacks = callbacks;
  }

  get id() {
    return this.peerId;
  }

  connect() {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) return;
    this.ws = new WebSocket(signalingUrl());
    this.ws.onopen = () => {
      this.send({
        type: "hello",
        peer_id: this.peerId,
        device_name: this.deviceName(),
        device_type: this.deviceType(),
        browser: navigator.userAgent,
      });
    };
    this.ws.onmessage = (event) => this.handleSignal(JSON.parse(event.data) as SignalMessage);
    this.ws.onerror = () => this.callbacks.error("Signaling server is unreachable.");
    this.ws.onclose = () => {
      this.ws = null;
      for (const pc of this.pcs.values()) pc.close();
      this.pcs.clear();
      this.channels.clear();
    };
  }

  close() {
    for (const pc of this.pcs.values()) pc.close();
    this.pcs.clear();
    this.channels.clear();
    this.ws?.close();
    this.ws = null;
  }

  createTransfer(receiverId: string, file: File) {
    this.send({
      type: "transfer_create",
      receiver_id: receiverId,
      file_name: file.name,
      file_size: file.size,
    });
  }

  private async handleSignal(message: SignalMessage) {
    switch (message.type) {
      case "peers":
        this.callbacks.peers((message.peers ?? []) as PeerInfo[]);
        break;
      case "transfer_invite":
        this.callbacks.incoming(message.session as TransferMeta);
        break;
      case "transfer_accepted": {
        const session = message.session as TransferMeta;
        const receiverId = session.receiver_id;
        if (receiverId) await this.startOffer(receiverId);
        break;
      }
      case "offer":
        await this.handleOffer(String(message.source_peer_id), message.offer as RTCSessionDescriptionInit);
        break;
      case "answer":
        await this.pcs.get(String(message.source_peer_id))?.setRemoteDescription(message.answer as RTCSessionDescriptionInit);
        break;
      case "ice_candidate": {
        const pc = this.pcs.get(String(message.source_peer_id));
        if (pc && message.candidate) await pc.addIceCandidate(message.candidate as RTCIceCandidateInit);
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
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.send({ type: "answer", target_peer_id: peerId, answer: pc.localDescription });
  }

  private ensurePeer(peerId: string, _initiator: boolean) {
    const existing = this.pcs.get(peerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.send({
          type: "ice_candidate",
          target_peer_id: peerId,
          candidate: event.candidate.toJSON(),
        });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") this.callbacks.connected(peerId);
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        this.callbacks.error(`Peer connection ${pc.connectionState}.`);
      }
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

    channel.send(
      JSON.stringify({
        type: "file-start",
        name: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
      }),
    );

    let offset = 0;
    while (offset < file.size) {
      while (channel.bufferedAmount > CHUNK_SIZE * 32) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
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
        this.receive = {
          name: String(message.name),
          type: String(message.mime ?? "application/octet-stream"),
          size: Number(message.size),
          chunks: [],
          bytes: 0,
        };
      } else if (message.type === "file-end" && this.receive) {
        const file = new File(this.receive.chunks, this.receive.name, { type: this.receive.type });
        this.callbacks.progress(this.receive.size, this.receive.size);
        this.callbacks.received(file);
        this.receive = null;
      }
      return;
    }

    if (!this.receive) return;
    const chunk = data instanceof ArrayBuffer ? data : null;
    if (chunk) {
      this.receive.chunks.push(chunk);
      this.receive.bytes += chunk.byteLength;
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
