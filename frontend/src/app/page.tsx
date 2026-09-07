"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Circle, Command, LockKeyhole, Network, Send, ShieldCheck, Terminal, Wifi, X, Zap } from "lucide-react";
import TransferWidget from "@/components/TransferWidget";

gsap.registerPlugin(ScrollTrigger);

const specs = [["PROTOCOL", "WEBRTC"], ["NETWORK", "LOCAL / P2P"], ["TRANSFER", "DIRECT"], ["CHUNK SIZE", "16 KB"]];
const steps = [{ number: "01", title: "Choose", body: "Drop a file. Nothing gets uploaded.", tag: "INPUT" }, { number: "02", title: "Connect", body: "Pair another device on the same network.", tag: "HANDSHAKE" }, { number: "03", title: "Transfer", body: "The file moves directly between peers.", tag: "PAYLOAD" }];
const logs = ["PEER DISCOVERED", "ICE CONNECTION ESTABLISHED", "DATA CHANNEL OPEN", "TRANSFER INITIALIZED"];
const history = [{ name: "design.fig", size: "84 MB", route: "MacBook Pro → Pixel" }, { name: "assets.zip", size: "412 MB", route: "Pixel → MacBook Pro" }, { name: "presentation.pdf", size: "11 MB", route: "MacBook Pro → iPad" }];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro.from(".nav-line", { scaleX: 0, transformOrigin: "left center", duration: .8 })
        .from(".nav-item", { opacity: 0, y: -10, duration: .5, stagger: .05 }, "-=.45")
        .from(".eyebrow", { opacity: 0, x: -14, duration: .55 }, "-=.2")
        .from(".hero-line", { yPercent: 115, duration: 1, stagger: .1 }, "-=.3")
        .from(".hero-copy", { opacity: 0, y: 18, duration: .65 }, "-=.5")
        .from(widgetRef.current, { opacity: 0, x: 55, rotate: 1.5, duration: .9 }, "-=.65")
        .from(".spec-cell", { opacity: 0, y: 12, duration: .45, stagger: .06 }, "-=.4");

      gsap.to(progressRef.current, { scaleX: 1, transformOrigin: "left center", ease: "none", scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: true } });
      gsap.to(widgetRef.current, { y: -7, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.4 });
      gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((el) => gsap.from(el, { opacity: 0, y: 42, duration: .85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%", once: true } }));
      gsap.utils.toArray<HTMLElement>(".step-row").forEach((el, i) => gsap.from(el, { opacity: 0, x: i % 2 ? 28 : -28, duration: .65, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 86%", once: true } }));
      gsap.utils.toArray<HTMLElement>(".tech-card").forEach((el) => gsap.from(el, { opacity: 0, y: 22, duration: .6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
      gsap.to(".scan-line", { y: "+=180", duration: 3.8, repeat: -1, ease: "none" });
      gsap.from(".network-node", { scale: 0, opacity: 0, duration: .6, stagger: .15, ease: "back.out(1.7)", scrollTrigger: { trigger: ".network-diagram", start: "top 78%", once: true } });
      gsap.from(".network-link", { scaleX: 0, transformOrigin: "left center", duration: .8, stagger: .18, ease: "power3.out", scrollTrigger: { trigger: ".network-diagram", start: "top 78%", once: true } });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setLogIndex((i) => (i + 1) % logs.length), 2400);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (e.key === "Escape") setPaletteOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") { e.preventDefault(); document.querySelector<HTMLElement>("#transfer")?.scrollIntoView({ behavior: "smooth" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden bg-[#f3f2ed] text-[#111318]">
      <div ref={progressRef} className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left scale-x-0 bg-[#d8ff45]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50" style={{ backgroundImage: "linear-gradient(to right, rgba(17,19,24,.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,19,24,.055) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />

      <nav className="relative z-20 mx-auto grid w-full max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-5 py-5 sm:px-8 lg:px-10">
        <div className="nav-line absolute bottom-0 left-0 h-px w-full bg-black/10" />
        <a href="#top" className="nav-item group flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#111318] text-[#f3f2ed] transition-transform duration-300 group-hover:rotate-3"><Send className="h-4 w-4" strokeWidth={2.3} /></span><span className="text-[15px] font-bold tracking-[-0.02em]">FLUID</span></a>
        <div className="hidden items-center gap-7 font-mono-fluid text-[10px] uppercase tracking-[0.12em] text-black/45 md:flex"><a href="#how" className="nav-item transition-colors hover:text-black">How it works</a><a href="#security" className="nav-item transition-colors hover:text-black">Security</a><a href="#technology" className="nav-item transition-colors hover:text-black">Technology</a></div>
        <button type="button" onClick={() => setPaletteOpen(true)} className="nav-item flex items-center gap-2 justify-self-end border border-black bg-[#111318] px-3 py-2 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-[#f3f2ed] transition-all hover:bg-[#d8ff45] hover:text-[#111318]"><Command className="h-3 w-3" /> K</button>
      </nav>

      <main id="top" className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-10">
        <section id="transfer" className="grid min-h-[calc(100vh-72px)] grid-cols-12 items-center border-b border-black/10 py-14 lg:py-10">
          <div className="col-span-12 lg:col-span-7 lg:pr-16 xl:pr-24">
            <div className="eyebrow mb-8 flex items-center gap-3 font-mono-fluid text-[10px] uppercase tracking-[0.13em] text-black/45"><span className="inline-flex items-center gap-2 border border-black/15 bg-[#e9ff72] px-2.5 py-1 text-[#111318]"><Circle className="h-2 w-2 fill-current" /> Local transfer</span><span>System / 001</span><span className="hidden sm:inline">Online / Ready</span></div>
            <h1 className="mb-9 max-w-[900px] text-[clamp(4rem,10vw,9.2rem)] font-bold leading-[0.82] tracking-[-0.075em]"><div className="overflow-hidden py-1"><div className="hero-line">FILES.</div></div><div className="overflow-hidden py-1"><div className="hero-line text-black/30">MOVING.</div></div><div className="overflow-hidden py-1"><div className="hero-line">INSTANTLY.</div></div></h1>
            <div className="grid max-w-3xl grid-cols-12 gap-5"><p className="hero-copy col-span-12 max-w-xl text-base leading-7 text-black/55 sm:text-lg lg:col-span-8">Move files directly between your devices. No cloud upload. No account. No unnecessary steps.</p><div className="hero-copy col-span-12 hidden border-l border-black/15 pl-4 font-mono-fluid text-[9px] leading-5 uppercase tracking-[0.12em] text-black/40 sm:block lg:col-span-4">Local network<br />Peer-to-peer<br />No cloud storage</div></div>
            <div className="hero-copy mt-10 flex flex-wrap items-center gap-5"><a href="#how" className="inline-flex items-center gap-3 font-mono-fluid text-[9px] uppercase tracking-[0.13em] text-black/50 transition-colors hover:text-black">Scroll to inspect <ArrowDownRight className="h-3.5 w-3.5" /></a><span className="font-mono-fluid text-[8px] uppercase tracking-[0.1em] text-black/25">Ctrl / ⌘ + O · Open transfer</span></div>
          </div>
          <div ref={widgetRef} className="col-span-12 mt-14 lg:col-span-5 lg:mt-0 lg:pl-5 xl:pl-12"><TransferWidget /></div>
        </section>

        <section className="grid grid-cols-12 border-b border-black/10 py-7 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/45">{specs.map(([label, value]) => <div key={label} className="spec-cell col-span-6 border-l border-black/10 px-4 py-2 first:border-l-0 md:col-span-3"><span className="block text-black/30">{label}</span><span className="mt-1 block text-black/75">{value}</span></div>)}</section>

        <section id="how" className="scroll-reveal border-b border-black/10 py-24 lg:py-32"><div className="grid grid-cols-12 gap-10"><div className="col-span-12 lg:col-span-4"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 002 — Process</p><h2 className="mt-5 text-4xl font-bold leading-none tracking-[-0.055em] sm:text-6xl">Three steps.<br /><span className="text-black/30">That&apos;s it.</span></h2><p className="mt-7 max-w-sm text-sm leading-6 text-black/45">The interface stays simple because the network does the heavy lifting.</p></div><div className="col-span-12 lg:col-span-8"><div className="divide-y divide-black/10 border-y border-black/10">{steps.map((step) => <div key={step.number} className="step-row group grid grid-cols-[54px_1fr] gap-5 py-8 transition-colors hover:bg-black/[0.025] sm:grid-cols-[90px_1fr_1fr] sm:items-center"><span className="font-mono-fluid text-[10px] text-black/30">{step.number}</span><div><span className="font-mono-fluid text-[8px] uppercase tracking-[0.13em] text-black/30">{step.tag}</span><h3 className="mt-2 text-2xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1">{step.title}</h3></div><p className="col-start-2 max-w-sm text-sm leading-6 text-black/45 sm:col-start-auto">{step.body}</p></div>)}</div></div></div></section>

        <section id="security" className="scroll-reveal grid grid-cols-12 gap-10 border-b border-black/10 py-24 lg:py-32"><div className="col-span-12 lg:col-span-7"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 003 — Security</p><h2 className="mt-5 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.055em] sm:text-6xl">Your files shouldn&apos;t need a detour through someone else&apos;s server.</h2><div className="mt-10 flex items-center gap-3 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/40"><span className="h-2 w-2 bg-[#d8ff45]" /> Local-first architecture</div></div><div className="col-span-12 grid grid-cols-2 gap-px self-end border border-black/10 bg-black/10 lg:col-span-5"><div className="tech-card bg-[#f3f2ed] p-5 transition-colors hover:bg-white"><LockKeyhole className="h-5 w-5" /><p className="mt-12 text-xs font-semibold">Direct connection</p><p className="mt-2 text-xs leading-5 text-black/45">Designed around peer-to-peer transport rather than cloud storage.</p></div><div className="tech-card bg-[#f3f2ed] p-5 transition-colors hover:bg-white"><ShieldCheck className="h-5 w-5" /><p className="mt-12 text-xs font-semibold">Minimal exposure</p><p className="mt-2 text-xs leading-5 text-black/45">The signaling service helps devices meet, then gets out of the way.</p></div></div></section>

        <section className="scroll-reveal border-b border-black/10 py-24 lg:py-28"><div className="grid grid-cols-12 gap-10"><div className="col-span-12 lg:col-span-5"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 004 — Network monitor</p><h2 className="mt-5 text-4xl font-bold leading-none tracking-[-0.055em] sm:text-6xl">Know what&apos;s<br /><span className="text-black/30">happening.</span></h2><p className="mt-7 max-w-sm text-sm leading-6 text-black/45">A compact view of the connection. Values are ready to become live WebRTC telemetry.</p></div><div className="col-span-12 border border-black bg-white lg:col-span-7"><div className="border-b border-black px-5 py-4 font-mono-fluid text-[9px] uppercase tracking-[0.12em]">Connection</div><div className="grid grid-cols-2 md:grid-cols-3">{[["STATUS","CONNECTED"],["PROTOCOL","WEBRTC"],["ROUTE","DIRECT"],["LATENCY","8 MS"],["THROUGHPUT","64.8 MB/S"],["ENCRYPTION","DTLS"]].map(([a,b]) => <div key={a} className="border-b border-r border-black/10 p-5"><span className="block font-mono-fluid text-[8px] text-black/30">{a}</span><span className="mt-3 block text-sm font-semibold">{b}</span></div>)}</div><div className="flex items-center gap-2 px-5 py-4 font-mono-fluid text-[8px] uppercase text-black/35"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9dcc00]" /> Live telemetry interface / awaiting peer</div></div></div></section>

        <section className="scroll-reveal border-b border-black/10 py-24 lg:py-28"><div className="grid grid-cols-12 gap-10"><div className="col-span-12 lg:col-span-4"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 005 — System log</p><h2 className="mt-5 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Quietly<br />working.</h2></div><div className="col-span-12 lg:col-span-8"><div className="border border-black bg-[#111318] text-[#f3f2ed]"><div className="flex items-center justify-between border-b border-white/15 px-5 py-4 font-mono-fluid text-[9px] uppercase tracking-[0.12em]"><span className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5" /> Fluid system log</span><span className="text-[#d8ff45]">● LIVE</span></div><div className="divide-y divide-white/10">{logs.map((log, i) => <div key={log} className={`flex gap-5 px-5 py-4 font-mono-fluid text-[9px] transition-opacity duration-500 ${i === logIndex ? "text-[#d8ff45]" : "text-white/45"}`}><span className="w-16 shrink-0 text-white/25">00:00:0{i + 1}</span><span>{log}</span></div>)}</div></div></div></div></section>

        <section className="scroll-reveal border-b border-black/10 py-24 lg:py-28"><div className="mb-12"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 006 — Architecture</p><h2 className="mt-5 text-4xl font-bold tracking-[-0.055em] sm:text-6xl">The server<br /><span className="text-black/30">gets out of the way.</span></h2></div><div className="network-diagram relative border border-black bg-white p-7 sm:p-10"><div className="grid grid-cols-5 items-center gap-2 sm:gap-5"><div className="network-node col-span-1 flex h-20 flex-col items-center justify-center border border-black bg-[#f3f2ed] text-center"><Network className="h-5 w-5" /><span className="mt-2 font-mono-fluid text-[8px] uppercase">Device A</span></div><div className="network-link h-px bg-black/30" /><div className="network-node col-span-1 flex h-16 flex-col items-center justify-center border border-black/30 bg-[#f3f2ed] text-center opacity-55"><span className="font-mono-fluid text-[8px] uppercase">Signaling</span><span className="mt-1 text-[8px] text-black/40">SDP / ICE</span></div><div className="network-link h-px bg-black/30" /><div className="network-node col-span-1 flex h-20 flex-col items-center justify-center border-2 border-black bg-[#e9ff72] text-center"><Network className="h-5 w-5" /><span className="mt-2 font-mono-fluid text-[8px] uppercase">Device B</span></div></div><div className="mt-8 border-t border-dashed border-black/25 pt-5 text-center font-mono-fluid text-[8px] uppercase tracking-[0.12em] text-black/40">Signaling introduces peers → direct data channel carries the payload</div></div></section>

        <section id="technology" className="scroll-reveal border-b border-black/10 py-24 lg:py-28"><div className="grid grid-cols-12 gap-10"><div className="col-span-12 lg:col-span-5"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 007 — Technology</p><h2 className="mt-5 text-4xl font-bold leading-none tracking-[-0.055em] sm:text-6xl">Simple on the surface.<br /><span className="text-black/30">Serious underneath.</span></h2></div><div className="col-span-12 grid grid-cols-1 border-t border-black/10 sm:grid-cols-3 lg:col-span-7 lg:mt-10"><div className="tech-card group border-b border-black/10 p-5 sm:border-r"><Network className="h-5 w-5 transition-transform group-hover:rotate-6" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">WebRTC</p><span className="mt-2 block font-mono-fluid text-[8px] text-black/30">TRANSPORT / 01</span></div><div className="tech-card group border-b border-black/10 p-5 sm:border-r"><Zap className="h-5 w-5 transition-transform group-hover:scale-110" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">Chunked transfer</p><span className="mt-2 block font-mono-fluid text-[8px] text-black/30">PAYLOAD / 16 KB</span></div><div className="tech-card group border-b border-black/10 p-5"><ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">Direct peer</p><span className="mt-2 block font-mono-fluid text-[8px] text-black/30">ROUTE / LOCAL</span></div></div></div><div className="relative mt-16 h-24 overflow-hidden border-y border-black/10 bg-[#111318] text-[#f3f2ed]"><div className="scan-line absolute left-0 top-0 h-px w-full bg-[#d8ff45] opacity-80" /><div className="flex h-full items-center justify-between px-5 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-white/55 sm:px-8"><span>FLUID NETWORK STATUS</span><span className="text-[#d8ff45]">● ALL SYSTEMS NOMINAL</span><span className="hidden sm:inline">LOCAL / P2P / READY</span></div></div></section>

        <section className="scroll-reveal grid grid-cols-12 gap-10 py-24 lg:py-28"><div className="col-span-12 lg:col-span-4"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 008 — Recent transfers</p><h2 className="mt-5 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Your<br />activity.</h2></div><div className="col-span-12 lg:col-span-8"><div className="border-y border-black/10">{history.map((item, i) => <div key={item.name} className="group grid grid-cols-[28px_1fr_auto] items-center gap-4 border-b border-black/10 py-5 last:border-b-0"><span className="font-mono-fluid text-[9px] text-black/25">0{i + 1}</span><div><p className="text-sm font-semibold transition-transform group-hover:translate-x-1">{item.name}</p><p className="mt-1 font-mono-fluid text-[8px] uppercase text-black/35">{item.route}</p></div><span className="font-mono-fluid text-[9px] text-black/40">{item.size}</span></div>)}</div></div></section>
      </main>

      <footer className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-2 gap-4 border-t border-black/10 px-5 py-7 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/40 sm:px-8 lg:px-10"><span>FLUID / LOCAL FILE TRANSFER</span><span className="text-right">BUILD 001 — YOUR FILES, YOUR DEVICES</span></footer>

      {paletteOpen && <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/35 px-5 pt-[15vh] backdrop-blur-sm" onClick={() => setPaletteOpen(false)}><div className="w-full max-w-lg border border-black bg-[#f8f7f2] shadow-[10px_10px_0_#111318]" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-3 border-b border-black px-5 py-4"><Command className="h-4 w-4" /><input autoFocus placeholder="Search Fluid" className="min-w-0 flex-1 bg-transparent font-mono-fluid text-xs outline-none placeholder:text-black/30" /><button type="button" onClick={() => setPaletteOpen(false)}><X className="h-4 w-4 text-black/40" /></button></div><div className="divide-y divide-black/10 font-mono-fluid text-[10px] uppercase tracking-[0.08em]"><button type="button" onClick={() => { setPaletteOpen(false); document.querySelector<HTMLElement>("#transfer")?.scrollIntoView({ behavior: "smooth" }); }} className="flex w-full justify-between px-5 py-4 text-left hover:bg-[#e9ff72]">Send file <span>↗</span></button><button type="button" onClick={() => { setPaletteOpen(false); document.querySelector<HTMLElement>("#transfer")?.scrollIntoView({ behavior: "smooth" }); }} className="flex w-full justify-between px-5 py-4 text-left hover:bg-[#e9ff72]">Connect device <span>↗</span></button><button type="button" onClick={() => { setPaletteOpen(false); document.querySelector<HTMLElement>("#security")?.scrollIntoView({ behavior: "smooth" }); }} className="flex w-full justify-between px-5 py-4 text-left hover:bg-[#e9ff72]">Network diagnostics <span>↗</span></button></div><div className="flex justify-between border-t border-black/10 px-5 py-3 font-mono-fluid text-[8px] uppercase text-black/30"><span>ESC to close</span><span>FLUID COMMAND</span></div></div></div>}
    </div>
  );
}
