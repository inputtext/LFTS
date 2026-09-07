"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDownRight, ArrowUpRight, Circle, LockKeyhole, Network, Send, ShieldCheck, Zap } from "lucide-react";
import TransferWidget from "@/components/TransferWidget";

gsap.registerPlugin(ScrollTrigger);

const specs = [
  ["PROTOCOL", "WEBRTC"],
  ["NETWORK", "LOCAL / P2P"],
  ["TRANSFER", "DIRECT"],
  ["CHUNK SIZE", "16 KB"],
];

const steps = [
  { number: "01", title: "Choose", body: "Drop a file. Nothing gets uploaded.", tag: "INPUT" },
  { number: "02", title: "Connect", body: "Pair another device on the same network.", tag: "HANDSHAKE" },
  { number: "03", title: "Transfer", body: "The file moves directly between peers.", tag: "PAYLOAD" },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });

      intro
        .from(".nav-line", { scaleX: 0, transformOrigin: "left center", duration: 0.8 })
        .from(".nav-item", { opacity: 0, y: -10, duration: 0.55, stagger: 0.06 }, "-=0.45")
        .from(".eyebrow", { opacity: 0, x: -14, duration: 0.6 }, "-=0.25")
        .from(".hero-line", { yPercent: 115, duration: 1.05, stagger: 0.11 }, "-=0.35")
        .from(".hero-copy", { opacity: 0, y: 18, duration: 0.7 }, "-=0.55")
        .from(widgetRef.current, { opacity: 0, x: 55, rotate: 1.5, duration: 1, ease: "power3.out" }, "-=0.7")
        .from(".spec-cell", { opacity: 0, y: 15, duration: 0.5, stagger: 0.07 }, "-=0.45");

      gsap.to(progressRef.current, {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom bottom", scrub: true },
      });

      gsap.to(widgetRef.current, {
        y: -8,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 45,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 78%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".step-row").forEach((row, index) => {
        gsap.from(row, {
          opacity: 0,
          x: index % 2 ? 28 : -28,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 84%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".tech-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 25,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 86%", once: true },
        });
      });

      gsap.to(".scan-line", {
        y: "+=180",
        duration: 3.8,
        repeat: -1,
        ease: "none",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden bg-[#f3f2ed] text-[#111318]">
      <div ref={progressRef} className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left scale-x-0 bg-[#d8ff45]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50" style={{ backgroundImage: "linear-gradient(to right, rgba(17,19,24,.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,19,24,.055) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />

      <nav className="relative z-20 mx-auto grid w-full max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-5 py-5 sm:px-8 lg:px-10">
        <div className="nav-line absolute bottom-0 left-0 h-px w-full bg-black/10" />
        <a href="#top" className="nav-item group flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#111318] text-[#f3f2ed] transition-transform duration-300 group-hover:rotate-3"><Send className="h-4 w-4" strokeWidth={2.3} /></span>
          <span className="text-[15px] font-bold tracking-[-0.02em]">FLUID</span>
        </a>
        <div className="hidden items-center gap-7 font-mono-fluid text-[10px] uppercase tracking-[0.12em] text-black/45 md:flex">
          <a href="#how" className="nav-item relative py-2 transition-colors hover:text-black">How it works</a>
          <a href="#security" className="nav-item relative py-2 transition-colors hover:text-black">Security</a>
          <a href="#technology" className="nav-item relative py-2 transition-colors hover:text-black">Technology</a>
        </div>
        <a href="#transfer" className="nav-item justify-self-end border border-black bg-[#111318] px-4 py-2 font-mono-fluid text-[10px] uppercase tracking-[0.12em] text-[#f3f2ed] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d8ff45] hover:text-[#111318]">Open app ↗</a>
      </nav>

      <main id="top" className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-10">
        <section id="transfer" className="grid min-h-[calc(100vh-72px)] grid-cols-12 items-center border-b border-black/10 py-14 lg:py-10">
          <div className="col-span-12 lg:col-span-7 lg:pr-16 xl:pr-24">
            <div className="eyebrow mb-8 flex items-center gap-3 font-mono-fluid text-[10px] uppercase tracking-[0.13em] text-black/45">
              <span className="inline-flex items-center gap-2 border border-black/15 bg-[#e9ff72] px-2.5 py-1 text-[#111318]"><Circle className="h-2 w-2 fill-current" /> Local transfer</span>
              <span>System / 001</span>
              <span className="hidden sm:inline">Online / Ready</span>
            </div>

            <h1 className="mb-9 max-w-[900px] text-[clamp(4rem,10vw,9.2rem)] font-bold leading-[0.82] tracking-[-0.075em]">
              <div className="overflow-hidden py-1"><div className="hero-line">FILES.</div></div>
              <div className="overflow-hidden py-1"><div className="hero-line text-black/30">MOVING.</div></div>
              <div className="overflow-hidden py-1"><div className="hero-line">INSTANTLY.</div></div>
            </h1>

            <div className="grid max-w-3xl grid-cols-12 gap-5">
              <p className="hero-copy col-span-12 max-w-xl text-base leading-7 text-black/55 sm:text-lg lg:col-span-8">Move files directly between your devices. No cloud upload. No account. No unnecessary steps.</p>
              <div className="hero-copy col-span-12 hidden border-l border-black/15 pl-4 font-mono-fluid text-[9px] leading-5 uppercase tracking-[0.12em] text-black/40 sm:block lg:col-span-4">
                Local network<br />Peer-to-peer<br />No cloud storage
              </div>
            </div>

            <a href="#how" className="hero-copy mt-10 inline-flex items-center gap-3 font-mono-fluid text-[9px] uppercase tracking-[0.13em] text-black/50 transition-colors hover:text-black">
              Scroll to inspect <ArrowDownRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div ref={widgetRef} className="col-span-12 mt-14 lg:col-span-5 lg:mt-0 lg:pl-5 xl:pl-12">
            <TransferWidget />
          </div>
        </section>

        <section className="grid grid-cols-12 border-b border-black/10 py-7 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/45">
          {specs.map(([label, value]) => <div key={label} className="spec-cell col-span-6 border-l border-black/10 px-4 py-2 first:border-l-0 md:col-span-3"><span className="block text-black/30">{label}</span><span className="mt-1 block text-black/75">{value}</span></div>)}
        </section>

        <section id="how" className="scroll-reveal border-b border-black/10 py-24 lg:py-32">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-4">
              <p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 002 — Process</p>
              <h2 className="mt-5 text-4xl font-bold leading-none tracking-[-0.055em] sm:text-6xl">Three steps.<br /><span className="text-black/30">That&apos;s it.</span></h2>
              <p className="mt-7 max-w-sm text-sm leading-6 text-black/45">The interface stays simple because the network does the heavy lifting.</p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="divide-y divide-black/10 border-y border-black/10">
                {steps.map((step) => (
                  <div key={step.number} className="step-row group grid grid-cols-[54px_1fr] gap-5 py-8 transition-colors hover:bg-black/[0.025] sm:grid-cols-[90px_1fr_1fr] sm:items-center">
                    <span className="font-mono-fluid text-[10px] text-black/30">{step.number}</span>
                    <div><span className="font-mono-fluid text-[8px] uppercase tracking-[0.13em] text-black/30">{step.tag}</span><h3 className="mt-2 text-2xl font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-1">{step.title}</h3></div>
                    <p className="col-start-2 max-w-sm text-sm leading-6 text-black/45 sm:col-start-auto">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="scroll-reveal grid grid-cols-12 gap-10 border-b border-black/10 py-24 lg:py-32">
          <div className="col-span-12 lg:col-span-7">
            <p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 003 — Security</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.055em] sm:text-6xl">Your files shouldn&apos;t need a detour through someone else&apos;s server.</h2>
            <div className="mt-10 flex items-center gap-3 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/40"><span className="h-2 w-2 bg-[#d8ff45]" /> Local-first architecture</div>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-px self-end border border-black/10 bg-black/10 lg:col-span-5">
            <div className="tech-card bg-[#f3f2ed] p-5 transition-colors hover:bg-white"><LockKeyhole className="h-5 w-5" /><p className="mt-12 text-xs font-semibold">Direct connection</p><p className="mt-2 text-xs leading-5 text-black/45">Designed around peer-to-peer transport rather than cloud storage.</p></div>
            <div className="tech-card bg-[#f3f2ed] p-5 transition-colors hover:bg-white"><ShieldCheck className="h-5 w-5" /><p className="mt-12 text-xs font-semibold">Minimal exposure</p><p className="mt-2 text-xs leading-5 text-black/45">The signaling service helps devices meet, then gets out of the way.</p></div>
          </div>
        </section>

        <section id="technology" className="scroll-reveal border-b border-black/10 py-24 lg:py-32">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-5"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 004 — Technology</p><h2 className="mt-5 text-4xl font-bold leading-none tracking-[-0.055em] sm:text-6xl">Simple on the surface.<br /><span className="text-black/30">Serious underneath.</span></h2></div>
            <div className="col-span-12 grid grid-cols-1 border-t border-black/10 sm:grid-cols-3 lg:col-span-7 lg:mt-10">
              <div className="tech-card group relative overflow-hidden border-b border-black/10 p-5 sm:border-r"><Network className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">WebRTC</p><span className="mt-2 block font-mono-fluid text-[8px] text-black/30">TRANSPORT / 01</span></div>
              <div className="tech-card group relative overflow-hidden border-b border-black/10 p-5 sm:border-r"><Zap className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">Chunked transfer</p><span className="mt-2 block font-mono-fluid text-[8px] text-black/30">PAYLOAD / 16 KB</span></div>
              <div className="tech-card group relative overflow-hidden border-b border-black/10 p-5"><ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">Direct peer</p><span className="mt-2 block font-mono-fluid text-[8px] text-black/30">ROUTE / LOCAL</span></div>
            </div>
          </div>
          <div className="relative mt-16 h-24 overflow-hidden border-y border-black/10 bg-[#111318] text-[#f3f2ed]">
            <div className="scan-line absolute left-0 top-0 h-px w-full bg-[#d8ff45] opacity-80" />
            <div className="flex h-full items-center justify-between px-5 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-white/55 sm:px-8"><span>FLUID NETWORK STATUS</span><span className="text-[#d8ff45]">● ALL SYSTEMS NOMINAL</span><span className="hidden sm:inline">LOCAL / P2P / READY</span></div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-2 gap-4 px-5 py-7 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/40 sm:px-8 lg:px-10"><span>FLUID / LOCAL FILE TRANSFER</span><span className="text-right">BUILD 001 — YOUR FILES, YOUR DEVICES</span></footer>
    </div>
  );
}
