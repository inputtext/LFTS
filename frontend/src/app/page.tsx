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
  { number: "01", title: "Choose", body: "Drop a file. Nothing gets uploaded." },
  { number: "02", title: "Connect", body: "Pair another device on the same network." },
  { number: "03", title: "Transfer", body: "The file moves directly between peers." },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-text", { y: "110%", duration: 1.05, stagger: 0.1, ease: "power4.out", delay: 0.1 });
      gsap.from(".intro-fade", { opacity: 0, y: 14, duration: 0.8, stagger: 0.06, ease: "power2.out", delay: 0.45 });
      gsap.from(widgetRef.current, { opacity: 0, x: 30, duration: 1, ease: "power3.out", delay: 0.35 });
      gsap.to(widgetRef.current, { y: -7, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.3 });
      gsap.utils.toArray<HTMLElement>(".section-reveal").forEach((element) => {
        gsap.from(element, { opacity: 0, y: 28, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 82%" } });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden bg-[#f3f2ed] text-[#111318]">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60" style={{ backgroundImage: "linear-gradient(to right, rgba(17,19,24,.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,19,24,.055) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />

      <nav className="intro-fade relative z-20 mx-auto grid w-full max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center border-b border-black/10 px-5 py-5 sm:px-8 lg:px-10">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#111318] text-[#f3f2ed]"><Send className="h-4 w-4" strokeWidth={2.3} /></span>
          <span className="text-[15px] font-bold tracking-[-0.02em]">FLUID</span>
        </a>
        <div className="hidden items-center gap-7 font-mono-fluid text-[10px] uppercase tracking-[0.12em] text-black/45 md:flex">
          <a href="#how" className="transition-colors hover:text-black">How it works</a>
          <a href="#security" className="transition-colors hover:text-black">Security</a>
          <a href="#technology" className="transition-colors hover:text-black">Technology</a>
        </div>
        <a href="#transfer" className="justify-self-end border border-black bg-[#111318] px-4 py-2 font-mono-fluid text-[10px] uppercase tracking-[0.12em] text-[#f3f2ed] transition hover:bg-transparent hover:text-[#111318]">Open app ↗</a>
      </nav>

      <main id="top" className="relative z-10 mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-10">
        <section id="transfer" className="grid min-h-[calc(100vh-72px)] grid-cols-12 items-center border-b border-black/10 py-14 lg:py-10">
          <div className="col-span-12 lg:col-span-7 lg:pr-16 xl:pr-24">
            <div className="intro-fade mb-8 flex items-center gap-3 font-mono-fluid text-[10px] uppercase tracking-[0.13em] text-black/45">
              <span className="inline-flex items-center gap-2 border border-black/15 bg-[#e9ff72] px-2.5 py-1 text-[#111318]"><Circle className="h-2 w-2 fill-current" /> Local transfer</span>
              <span>System / 001</span>
            </div>

            <h1 className="mb-9 max-w-[900px] text-[clamp(4rem,10vw,9.2rem)] font-bold leading-[0.82] tracking-[-0.075em]">
              <div className="overflow-hidden py-1"><div className="reveal-text">FILES.</div></div>
              <div className="overflow-hidden py-1"><div className="reveal-text text-black/35">MOVING.</div></div>
              <div className="overflow-hidden py-1"><div className="reveal-text">INSTANTLY.</div></div>
            </h1>

            <div className="grid max-w-3xl grid-cols-12 gap-5">
              <p className="intro-fade col-span-12 max-w-xl text-base leading-7 text-black/55 sm:text-lg lg:col-span-8">Move files directly between your devices. No cloud upload. No account. No unnecessary steps.</p>
              <div className="intro-fade col-span-12 hidden border-l border-black/15 pl-4 font-mono-fluid text-[9px] leading-5 uppercase tracking-[0.12em] text-black/40 sm:block lg:col-span-4">
                Local network<br />Peer-to-peer<br />No cloud storage
              </div>
            </div>
          </div>

          <div ref={widgetRef} className="col-span-12 mt-14 lg:col-span-5 lg:mt-0 lg:pl-5 xl:pl-12">
            <TransferWidget />
          </div>
        </section>

        <section className="grid grid-cols-12 border-b border-black/10 py-7 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/45">
          {specs.map(([label, value]) => <div key={label} className="col-span-6 border-l border-black/10 px-4 py-2 first:border-l-0 md:col-span-3"><span className="block text-black/30">{label}</span><span className="mt-1 block text-black/75">{value}</span></div>)}
        </section>

        <section id="how" className="section-reveal border-b border-black/10 py-24 lg:py-32">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-4">
              <p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 002 — Process</p>
              <h2 className="mt-5 text-4xl font-bold leading-none tracking-[-0.055em] sm:text-6xl">Three steps.<br /><span className="text-black/35">That&apos;s it.</span></h2>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="divide-y divide-black/10 border-y border-black/10">
                {steps.map((step) => <div key={step.number} className="grid grid-cols-[64px_1fr] gap-5 py-7 sm:grid-cols-[90px_1fr_1fr] sm:items-center"><span className="font-mono-fluid text-[10px] text-black/30">{step.number}</span><h3 className="text-2xl font-semibold tracking-tight">{step.title}</h3><p className="col-start-2 max-w-sm text-sm leading-6 text-black/45 sm:col-start-auto">{step.body}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="section-reveal grid grid-cols-12 gap-10 border-b border-black/10 py-24 lg:py-32">
          <div className="col-span-12 lg:col-span-7">
            <p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 003 — Security</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.055em] sm:text-6xl">Your files shouldn&apos;t need a detour through someone else&apos;s server.</h2>
          </div>
          <div className="col-span-12 grid grid-cols-2 gap-px self-end border border-black/10 bg-black/10 lg:col-span-5">
            <div className="bg-[#f3f2ed] p-5"><LockKeyhole className="h-5 w-5" /><p className="mt-12 text-xs font-semibold">Direct connection</p><p className="mt-2 text-xs leading-5 text-black/45">Designed around peer-to-peer transport rather than cloud storage.</p></div>
            <div className="bg-[#f3f2ed] p-5"><ShieldCheck className="h-5 w-5" /><p className="mt-12 text-xs font-semibold">Minimal exposure</p><p className="mt-2 text-xs leading-5 text-black/45">The signaling service helps devices meet, then gets out of the way.</p></div>
          </div>
        </section>

        <section id="technology" className="section-reveal border-b border-black/10 py-24 lg:py-32">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-5"><p className="font-mono-fluid text-[10px] uppercase tracking-[0.14em] text-black/40">/ 004 — Technology</p><h2 className="mt-5 text-4xl font-bold leading-none tracking-[-0.055em] sm:text-6xl">Simple on the surface.<br /><span className="text-black/35">Serious underneath.</span></h2></div>
            <div className="col-span-12 grid grid-cols-1 border-t border-black/10 sm:grid-cols-3 lg:col-span-7 lg:mt-10"><div className="border-b border-black/10 p-5 sm:border-r"><Network className="h-5 w-5" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">WebRTC</p></div><div className="border-b border-black/10 p-5 sm:border-r"><Zap className="h-5 w-5" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">Chunked transfer</p></div><div className="border-b border-black/10 p-5"><ArrowUpRight className="h-5 w-5" /><p className="mt-12 font-mono-fluid text-[10px] uppercase">Direct peer</p></div></div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-2 gap-4 px-5 py-7 font-mono-fluid text-[9px] uppercase tracking-[0.12em] text-black/40 sm:px-8 lg:px-10"><span>FLUID / LOCAL FILE TRANSFER</span><span className="text-right">BUILD 001 — YOUR FILES, YOUR DEVICES</span></footer>
    </div>
  );
}
