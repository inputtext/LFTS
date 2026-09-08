"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, FileDown, FileText, Monitor, Smartphone, Tablet, Wifi, X } from "lucide-react";
import { FluidWebRTC, type PeerInfo, type TransferMeta, type TransferMode } from "@/lib/webrtc";

type SelectedFile = { file: File; name: string; size: string };
type Stage = "role" | "send-file" | "waiting" | "devices" | "connecting" | "transferring" | "complete" | "error";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function iconFor(type: string) {
  if (type === "phone") return <Smartphone className="h-5 w-5" strokeWidth={1.5} />;
  if (type === "tablet") return <Tablet className="h-5 w-5" strokeWidth={1.5} />;
  return <Monitor className="h-5 w-5" strokeWidth={1.5} />;
}

export default function TransferWidget() {
  const inputRef = useRef<HTMLInputElement>(null);
  const rtcRef = useRef<FluidWebRTC | null>(null);
  const selectedRef = useRef<SelectedFile[]>([]);
  const peersRef = useRef<PeerInfo[]>([]);
  const stageRef = useRef<Stage>("role");

  const [mode, setMode] = useState<TransferMode | null>(null);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [device, setDevice] = useState<PeerInfo | null>(null);
  const [incoming, setIncoming] = useState<TransferMeta | null>(null);
  const [stage, setStageState] = useState<Stage>("role");
  const [online, setOnline] = useState(false);
  const [signalingError, setSignalingError] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const setStage = (next: Stage) => {
    stageRef.current = next;
    setStageState(next);
  };

  useEffect(() => {
    const rtc = new FluidWebRTC({
      peers: (nextPeers) => {
        peersRef.current = nextPeers;
        setPeers(nextPeers);
        setSignalingError("");
      },
      modeSet: (nextMode) => {
        setMode(nextMode);
      },
      incoming: (session) => {
        setIncoming(session);
        setStage("connecting");
      },
      connected: (peerId) => {
        const peer = peersRef.current.find((item) => item.peer_id === peerId);
        if (peer) setDevice(peer);
        setError("");
        setStage("transferring");
        const file = selectedRef.current[0]?.file;
        if (file && mode === "send") {
          void rtc.sendFile(peerId, file).catch((e: unknown) => {
            setError(e instanceof Error ? e.message : "File transfer failed.");
            setStage("error");
          });
        }
      },
      progress: (sent, total) => setProgress(total ? Math.round((sent / total) * 100) : 0),
      received: (file) => {
        const url = URL.createObjectURL(file);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.name;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setProgress(100);
        setStage("complete");
      },
      error: (message) => {
        if (message.toLowerCase().includes("signaling")) {
          setOnline(false);
          setSignalingError(message);
          return;
        }
        if (["connecting", "transferring"].includes(stageRef.current)) {
          setError(message);
          setStage("error");
        }
      },
    });
    rtcRef.current = rtc;
    rtc.connect();
    return () => {
      rtc.close();
      rtcRef.current = null;
    };
  }, []);

  useEffect(() => {
    const compatible = mode === "send" ? peers.some((peer) => peer.mode === "receive") : mode === "receive" ? peers.some((peer) => peer.mode === "send") : false;
    setOnline(compatible);
  }, [mode, peers]);

  const chooseMode = (nextMode: TransferMode) => {
    setMode(nextMode);
    setError("");
    setIncoming(null);
    rtcRef.current?.setMode(nextMode);
    setStage(nextMode === "send" ? "send-file" : "waiting");
  };

  const addFile = (file: File) => {
    const next = [{ file, name: file.name, size: formatSize(file.size) }];
    selectedRef.current = next;
    setSelected(next);
    setError("");
    setStage("devices");
  };

  const chooseDevice = (peer: PeerInfo) => {
    const file = selectedRef.current[0]?.file;
    if (!file) return;
    setDevice(peer);
    setError("");
    setProgress(0);
    setStage("connecting");
    rtcRef.current?.createTransfer(peer.peer_id, file);
  };

  const acceptIncoming = () => {
    if (!incoming) return;
    const peer = peersRef.current.find((item) => item.peer_id === incoming.sender_id);
    if (peer) setDevice(peer);
    setError("");
    setStage("connecting");
    rtcRef.current?.acceptTransfer(incoming);
    setIncoming(null);
  };

  const reset = () => {
    selectedRef.current = [];
    setSelected([]);
    setDevice(null);
    setIncoming(null);
    setProgress(0);
    setError("");
    setOnline(false);
    setMode(null);
    rtcRef.current?.setMode(null);
    setStage("role");
  };

  const label = stage === "complete" ? "COMPLETE" : stage === "transferring" ? "TRANSFERRING" : stage === "connecting" ? "CONNECTING" : online ? "ONLINE" : "OFFLINE";

  return (
    <div className="w-full max-w-[500px] border border-black bg-[#f8f7f2] shadow-[10px_10px_0_#111318]">
      <div className="flex items-stretch justify-between border-b border-black">
        <div className="px-5 py-4">
          <p className="font-mono-fluid text-[10px] font-semibold uppercase tracking-[.12em]">Transfer console</p>
          <p className="mt-1 text-xs text-black/45">Local WebRTC file transfer</p>
        </div>
        <div className="flex items-center border-l border-black px-4 font-mono-fluid text-[9px] uppercase tracking-[.12em]">
          <span className={`mr-2 h-2 w-2 rounded-full ${online ? "bg-[#9dcc00]" : "bg-black/25"}`} />{label}
        </div>
      </div>

      {signalingError && <div className="border-b border-black bg-[#f3f2ed] px-4 py-3 font-mono-fluid text-[8px] uppercase text-black/50">{signalingError}</div>}

      <div className="p-5">
        {stage === "role" && (
          <div>
            <p className="font-mono-fluid text-[9px] uppercase tracking-[.12em] text-black/45">01 / Choose transfer role</p>
            <p className="mt-3 text-2xl font-bold tracking-tight">What do you want to do?</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => chooseMode("send")} className="border-2 border-black bg-[#111318] p-5 text-left text-white hover:bg-[#e9ff72] hover:text-black">
                <FileDown className="h-7 w-7" />
                <p className="mt-8 text-xl font-bold">SEND</p>
                <p className="mt-2 font-mono-fluid text-[8px] uppercase text-white/50">Choose a file and wait for receiver</p>
              </button>
              <button type="button" onClick={() => chooseMode("receive")} className="border-2 border-black bg-white p-5 text-left hover:bg-[#e9ff72]">
                <Wifi className="h-7 w-7" />
                <p className="mt-8 text-xl font-bold">RECEIVE</p>
                <p className="mt-2 font-mono-fluid text-[8px] uppercase text-black/40">Become available for an incoming file</p>
              </button>
            </div>
            <p className="mt-5 font-mono-fluid text-[8px] uppercase leading-5 text-black/40">Both devices must choose a role. Sender + receiver = ONLINE.</p>
          </div>
        )}

        {stage === "send-file" && (
          <div>
            <p className="font-mono-fluid text-[9px] uppercase text-black/45">SEND MODE / ACTIVE</p>
            <p className="mt-3 text-2xl font-bold">Choose a file.</p>
            <input ref={inputRef} type="file" className="sr-only" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0]); e.currentTarget.value = ""; }} />
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-6 flex min-h-[220px] w-full flex-col items-center justify-center border-2 border-dashed border-black/30 bg-white hover:border-black">
              <FileText className="h-9 w-9" strokeWidth={1.4} />
              <span className="mt-5 text-lg font-semibold">Select file</span>
              <span className="mt-2 font-mono-fluid text-[8px] uppercase text-black/40">The receiver must press RECEIVE</span>
            </button>
            <button type="button" onClick={reset} className="mt-4 font-mono-fluid text-[9px] uppercase underline">Change role</button>
          </div>
        )}

        {stage === "waiting" && (
          <div className="flex min-h-[365px] flex-col items-center justify-center border border-black bg-white text-center">
            <Wifi className="h-9 w-9" />
            <p className="mt-7 text-2xl font-bold">RECEIVE mode active.</p>
            <p className="mt-2 max-w-xs font-mono-fluid text-[9px] uppercase leading-5 text-black/40">Keep this screen open. When a sender becomes available, this device will show ONLINE.</p>
            {online && <p className="mt-5 border border-black bg-[#e9ff72] px-4 py-2 font-mono-fluid text-[9px] uppercase">Sender detected · ONLINE</p>}
            <button type="button" onClick={reset} className="mt-7 font-mono-fluid text-[9px] uppercase underline">Change role</button>
          </div>
        )}

        {stage === "devices" && (
          <div className="border border-black bg-white">
            <div className="flex justify-between border-b border-black px-4 py-3 font-mono-fluid text-[9px] uppercase"><span>Receivers online</span><span>{peers.filter((p) => p.mode === "receive").length} FOUND</span></div>
            {peers.filter((p) => p.mode === "receive").length === 0 ? (
              <div className="p-8 text-center"><p className="text-sm font-semibold">Waiting for receiver.</p><p className="mt-2 font-mono-fluid text-[8px] uppercase text-black/40">Ask the other device to press RECEIVE.</p></div>
            ) : peers.filter((p) => p.mode === "receive").map((peer) => (
              <button key={peer.peer_id} type="button" onClick={() => chooseDevice(peer)} className="flex w-full items-center gap-3 border-b border-black/10 px-4 py-4 text-left hover:bg-[#e9ff72]">
                <span className="flex h-10 w-10 items-center justify-center border border-black/20 bg-[#f3f2ed]">{iconFor(peer.device_type)}</span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{peer.device_name}</span><span className="font-mono-fluid text-[8px] uppercase text-black/40">RECEIVE · ONLINE</span></span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}

        {stage === "connecting" && (
          <div className="flex min-h-[365px] flex-col items-center justify-center border border-black bg-white text-center">
            <div className="flex items-center gap-6"><Monitor className="h-10 w-10" /><div className="h-px w-20 bg-black animate-pulse" />{iconFor(device?.device_type ?? "phone")}</div>
            {incoming ? <><p className="mt-10 text-xl font-bold">Incoming file request.</p><p className="mt-2 font-mono-fluid text-[9px] uppercase text-black/40">{incoming.file_name} · {formatSize(incoming.file_size ?? 0)}</p><button type="button" onClick={acceptIncoming} className="mt-6 border border-black bg-[#111318] px-5 py-3 font-mono-fluid text-[9px] uppercase text-white">RECEIVE FILE ↗</button></> : <><p className="mt-10 text-xl font-bold">Connecting…</p><p className="mt-2 font-mono-fluid text-[9px] uppercase text-black/40">Negotiating direct WebRTC channel</p></>}
          </div>
        )}

        {stage === "transferring" && (
          <div className="min-h-[365px] border border-black bg-white p-5"><div className="flex justify-between font-mono-fluid text-[9px] uppercase"><span>ACTIVE P2P TRANSFER</span><span>{progress}%</span></div><div className="mt-12 flex items-center justify-between gap-5"><div className="flex h-12 w-12 items-center justify-center border border-black"><FileText className="h-5 w-5" /></div><ArrowRight className="h-6 w-6 animate-pulse" /><div className="flex h-12 w-12 items-center justify-center border border-black bg-[#e9ff72]">{iconFor(device?.device_type ?? "phone")}</div></div><div className="mt-12 h-2 border border-black/20 bg-[#f3f2ed]"><div className="h-full bg-[#111318] transition-[width]" style={{ width: `${progress}%` }} /></div><p className="mt-3 font-mono-fluid text-[8px] uppercase text-black/40">DIRECT / WEBRTC DATA CHANNEL / 16 KB CHUNKS</p></div>
        )}

        {stage === "complete" && <div className="flex min-h-[365px] flex-col items-center justify-center border border-black bg-[#e9ff72] text-center"><Check className="h-9 w-9" /><p className="mt-6 text-2xl font-bold">Transfer complete.</p><button type="button" onClick={reset} className="mt-8 border border-black bg-[#111318] px-5 py-3 font-mono-fluid text-[9px] uppercase text-white">Start another ↗</button></div>}

        {stage === "error" && <div className="flex min-h-[365px] flex-col items-center justify-center border border-red-500/40 bg-white p-6 text-center"><X className="h-8 w-8 text-red-600" /><p className="mt-5 text-xl font-bold">Connection interrupted.</p><p className="mt-2 max-w-xs font-mono-fluid text-[9px] leading-5 text-black/40">{error}</p><button type="button" onClick={reset} className="mt-7 border border-black bg-[#111318] px-5 py-3 font-mono-fluid text-[9px] uppercase text-white">Start again</button></div>}

        {mode && stage !== "role" && stage !== "complete" && stage !== "error" && <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 font-mono-fluid text-[8px] uppercase text-black/40"><span>MODE / {mode}</span><span>{online ? "PEER READY" : "WAITING FOR PEER"}</span></div>}
      </div>
    </div>
  );
}
