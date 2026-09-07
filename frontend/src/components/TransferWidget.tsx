"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, Check, FileDown, FileText, Image as ImageIcon, Monitor, Smartphone, Tablet, Wifi, X } from "lucide-react";

type SelectedFile = { file: File; name: string; size: string };
type Device = { name: string; browser: string; icon: "desktop" | "phone" | "tablet" };
type Stage = "ready" | "selected" | "searching" | "devices" | "connecting" | "transferring" | "complete" | "error";

const devices: Device[] = [
  { name: "MacBook Pro", browser: "Chrome · This network", icon: "desktop" },
  { name: "Pixel 10", browser: "Chrome · This network", icon: "phone" },
  { name: "iPad Pro", browser: "Safari · This network", icon: "tablet" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function FileIcon({ file }: { file: File }) {
  return file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" strokeWidth={1.7} /> : <FileText className="h-4 w-4" strokeWidth={1.7} />;
}

function DeviceIcon({ type }: { type: Device["icon"] }) {
  if (type === "phone") return <Smartphone className="h-4 w-4" strokeWidth={1.5} />;
  if (type === "tablet") return <Tablet className="h-4 w-4" strokeWidth={1.5} />;
  return <Monitor className="h-4 w-4" strokeWidth={1.5} />;
}

const labels: Record<Stage, string> = { ready: "READY", selected: "FILE SELECTED", searching: "SEARCHING", devices: "DEVICE FOUND", connecting: "CONNECTING", transferring: "TRANSFERRING", complete: "COMPLETE", error: "INTERRUPTED" };

export default function TransferWidget() {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const packetsRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("ready");
  const [device, setDevice] = useState<Device | null>(null);
  const [progress, setProgress] = useState(0);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files).map((file) => ({ file, name: file.name, size: formatSize(file.size) }));
    setSelected((current) => [...current, ...incoming].slice(0, 5));
    if (incoming.length) setStage("selected");
  };

  const openDevices = () => {
    setStage("searching");
    window.setTimeout(() => setStage("devices"), 850);
  };

  const connect = (nextDevice: Device) => {
    setDevice(nextDevice);
    setStage("connecting");
    window.setTimeout(() => setStage("transferring"), 1100);
  };

  const reset = () => {
    setStage("ready");
    setSelected([]);
    setDevice(null);
    setProgress(0);
  };

  useEffect(() => {
    if (stage !== "transferring") return;
    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(value + 4, 100);
        if (next === 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setStage("complete"), 450);
        }
        return next;
      });
    }, 90);
    return () => window.clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== "transferring" || !packetsRef.current) return;
    const packets = gsap.utils.toArray<HTMLElement>(".transfer-packet", packetsRef.current);
    const tween = gsap.fromTo(packets, { x: -20, opacity: 0 }, { x: 125, opacity: 1, duration: 0.85, stagger: 0.16, repeat: -1, ease: "none" });
    return () => tween.kill();
  }, [stage]);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current, { scale: 0.985, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 0.32, ease: "power2.out" });
  }, [stage]);

  return (
    <div ref={panelRef} className="w-full max-w-[500px] border border-black bg-[#f8f7f2] shadow-[10px_10px_0_#111318] transition-shadow duration-300 hover:shadow-[13px_13px_0_#111318]">
      <div className="flex items-stretch justify-between border-b border-black">
        <div className="px-5 py-4"><p className="font-mono-fluid text-[10px] font-semibold uppercase tracking-[0.12em]">Transfer console</p><p className="mt-1 text-xs text-black/45">Direct peer connection</p></div>
        <div className="flex items-center border-l border-black px-4 font-mono-fluid text-[9px] uppercase tracking-[0.12em]"><span className={`mr-2 h-2 w-2 rounded-full ${stage === "complete" ? "bg-black" : stage === "error" ? "bg-red-500" : "bg-[#9dcc00]"} ${(stage === "searching" || stage === "connecting" || stage === "transferring") ? "animate-pulse" : ""}`} /> {labels[stage]}</div>
      </div>

      <div className="p-5">
        {stage === "ready" || stage === "selected" ? (
          <>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
            <button type="button" onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setPointer({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }); }} onMouseLeave={() => setPointer({ x: 50, y: 50 })} className={`group/drop relative flex min-h-[285px] w-full flex-col items-center justify-center overflow-hidden border-2 text-center transition-all duration-300 ${dragging ? "scale-[1.015] border-black bg-[#e9ff72] shadow-[7px_7px_0_#111318]" : "border-black/25 bg-white hover:border-black hover:bg-[#eeeee8]"}`} style={{ backgroundImage: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(233,255,114,${dragging ? 0.8 : 0.16}), transparent 32%)` }} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}>
              <span className="absolute left-3 top-3 font-mono-fluid text-[8px] uppercase tracking-[0.12em] text-black/30">{dragging ? "DROP / READY" : "INPUT / FILE"}</span>
              <span className={`mb-5 flex h-16 w-16 items-center justify-center border border-black bg-[#f3f2ed] transition-transform duration-300 ${dragging ? "-translate-y-2 rotate-[-3deg]" : "group-hover/drop:-translate-y-1"}`}><FileDown className="h-7 w-7" strokeWidth={1.4} /></span>
              <span className="text-lg font-semibold tracking-tight">{dragging ? "Release to send" : "Drop files here"}</span>
              <span className="mt-2 font-mono-fluid text-[9px] uppercase tracking-[0.1em] text-black/40">{dragging ? "Local transfer armed" : "or click to browse"}</span>
              <span className="absolute bottom-3 left-3 font-mono-fluid text-[8px] uppercase tracking-[0.12em] text-black/25">MAX 500 MB</span><span className="absolute bottom-3 right-3 font-mono-fluid text-[8px] uppercase tracking-[0.12em] text-black/25">P2P / LOCAL</span>
            </button>
            {selected.length > 0 && <div className="mt-4 border-t border-black/10 pt-3">{selected.map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center justify-between border-b border-black/10 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center border border-black/10 bg-white"><FileIcon file={item.file} /></span><div className="min-w-0 text-left"><p className="truncate text-xs font-semibold">{item.name}</p><p className="mt-0.5 font-mono-fluid text-[9px] text-black/40">{item.size}</p></div></div><button type="button" aria-label={`Remove ${item.name}`} className="ml-3 p-1 text-black/30 transition hover:text-red-600" onClick={() => { const next = selected.filter((_, i) => i !== index); setSelected(next); if (!next.length) setStage("ready"); }}><X className="h-4 w-4" /></button></div>)}<button type="button" onClick={openDevices} className="mt-4 w-full border border-black bg-[#111318] px-4 py-3 text-left font-mono-fluid text-[10px] uppercase tracking-[0.12em] text-[#f3f2ed] transition hover:bg-[#e9ff72] hover:text-[#111318]"><span>Find nearby devices</span><span className="float-right">↗</span></button></div>}
          </>
        ) : stage === "searching" ? (
          <div className="flex min-h-[365px] flex-col justify-between border border-black bg-white p-5"><div className="flex items-center justify-between font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/45"><span>DEVICE DISCOVERY</span><Wifi className="h-4 w-4 animate-pulse" /></div><div className="flex flex-col items-center justify-center"><div className="relative flex h-28 w-28 items-center justify-center border border-black"><div className="absolute inset-3 animate-ping border border-black/20" /><Wifi className="relative h-7 w-7" strokeWidth={1.3} /></div><p className="mt-7 text-lg font-semibold">Searching nearby</p><p className="mt-2 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/40">Scanning local network</p></div><div className="font-mono-fluid text-[8px] uppercase tracking-[0.1em] text-black/30">Broadcast / discovery / waiting</div></div>
        ) : stage === "devices" ? (
          <div className="border border-black bg-white"><div className="flex items-center justify-between border-b border-black px-4 py-3"><span className="font-mono-fluid text-[9px] uppercase tracking-[0.12em]">Nearby devices</span><span className="font-mono-fluid text-[8px] text-black/35">{devices.length} FOUND</span></div><div className="divide-y divide-black/10">{devices.map((item) => <button key={item.name} type="button" onClick={() => connect(item)} className="group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[#e9ff72]"><span className="relative flex h-9 w-9 items-center justify-center border border-black/20 bg-[#f3f2ed]"><span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-[#9dcc00]" /><DeviceIcon type={item.icon} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{item.name}</span><span className="mt-1 block font-mono-fluid text-[8px] uppercase tracking-[0.08em] text-black/40">{item.browser}</span></span><ArrowRight className="h-4 w-4 text-black/30 transition group-hover:translate-x-1 group-hover:text-black" /></button>)}</div><button type="button" onClick={() => setStage("searching")} className="w-full border-t border-black/10 px-4 py-3 text-left font-mono-fluid text-[8px] uppercase tracking-[0.1em] text-black/35 transition hover:text-black">↻ Scan again</button></div>
        ) : stage === "connecting" ? (
          <div className="min-h-[365px] border border-black bg-white p-5"><div className="font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/45">CONNECTION HANDSHAKE</div><div className="mt-20 flex items-center justify-center gap-6"><div className="flex h-16 w-16 items-center justify-center border border-black bg-[#f3f2ed]"><Monitor className="h-6 w-6" strokeWidth={1.4} /></div><div className="h-px w-20 overflow-hidden bg-black/15"><div className="h-full w-1/2 animate-pulse bg-black" /></div><div className="flex h-16 w-16 items-center justify-center border border-black bg-[#e9ff72]"><DeviceIcon type={device?.icon ?? "desktop"} /></div></div><div className="mt-10 text-center"><p className="text-lg font-semibold">Connecting to {device?.name}</p><p className="mt-2 font-mono-fluid text-[9px] uppercase tracking-[0.1em] text-black/40">SDP · ICE · DATA CHANNEL</p></div></div>
        ) : stage === "transferring" ? (
          <div className="min-h-[365px] border border-black bg-white p-5"><div className="flex justify-between font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/45"><span>ACTIVE TRANSFER</span><span>{progress}%</span></div><div className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center gap-4"><div className="min-w-0"><div className="flex h-12 w-12 items-center justify-center border border-black bg-[#f3f2ed]"><FileText className="h-5 w-5" /></div><p className="mt-3 truncate text-xs font-semibold">{selected[0]?.name ?? "File"}</p><p className="mt-1 font-mono-fluid text-[8px] text-black/40">{selected[0]?.size ?? "—"}</p></div><div ref={packetsRef} className="relative h-16 w-36 overflow-hidden border-y border-black/10"><div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/10" />{[0,1,2].map((item) => <span key={item} className="transfer-packet absolute left-1/2 h-1.5 w-8 bg-[#111318]" style={{ top: `${28 + item * 22}%` }} />)}</div><div className="min-w-0 text-right"><div className="ml-auto flex h-12 w-12 items-center justify-center border border-black bg-[#e9ff72]"><DeviceIcon type={device?.icon ?? "desktop"} /></div><p className="mt-3 truncate text-xs font-semibold">{device?.name ?? "Device"}</p></div></div><div className="mt-10"><div className="h-2 border border-black/15 bg-[#f3f2ed]"><div className="h-full bg-[#111318] transition-[width] duration-100" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex justify-between font-mono-fluid text-[8px] uppercase tracking-[0.1em] text-black/40"><span>DIRECT / WEBRTC</span><span>64.8 MB/S</span></div></div></div>
        ) : stage === "complete" ? (
          <div className="flex min-h-[365px] flex-col items-center justify-center border border-black bg-[#e9ff72] text-center"><div className="flex h-16 w-16 items-center justify-center border border-black bg-[#f3f2ed]"><Check className="h-7 w-7" strokeWidth={1.5} /></div><p className="mt-6 text-2xl font-bold tracking-tight">Transfer complete.</p><p className="mt-2 font-mono-fluid text-[9px] uppercase tracking-[0.1em] text-black/50">Delivered directly to {device?.name}</p><p className="mt-1 font-mono-fluid text-[8px] uppercase text-black/35">{selected[0]?.name} · {selected[0]?.size}</p><button type="button" onClick={reset} className="mt-8 border border-black bg-[#111318] px-5 py-3 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black">Send another ↗</button></div>
        ) : (
          <div className="flex min-h-[365px] flex-col items-center justify-center border border-red-500/40 bg-white p-6 text-center"><div className="flex h-14 w-14 items-center justify-center border border-red-500/40 text-red-600">×</div><p className="mt-6 text-xl font-bold">Connection interrupted.</p><p className="mt-2 max-w-xs font-mono-fluid text-[9px] uppercase leading-5 text-black/40">The receiving device stopped responding.</p><button type="button" onClick={openDevices} className="mt-7 border border-black bg-[#111318] px-5 py-3 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-white">Reconnect ↗</button></div>
        )}
      </div>
      <div className="grid grid-cols-3 border-t border-black font-mono-fluid text-[8px] uppercase tracking-[0.1em] text-black/40"><span className="border-r border-black px-4 py-3">No uploads</span><span className="border-r border-black px-4 py-3">No account</span><span className="px-4 py-3">Direct transfer</span></div>
    </div>
  );
}
