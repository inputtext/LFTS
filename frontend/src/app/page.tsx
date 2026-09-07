"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, LockKeyhole, Network, Send, ShieldCheck, Zap } from "lucide-react";
import TransferWidget from "@/components/TransferWidget";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { number: "01", title: "Choose", body: "Drop a file into Fluid. Nothing gets uploaded." },
  { number: "02", title: "Connect", body: "Pair another device on the same local network." },
  { number: "03", title: "Transfer", body: "The file travels directly from one device to the other." },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-text", { y: "120%", ease: "power4.out", duration: 1.15, stagger: 0.12, delay: 0.15 });
      gsap.from(".fade-element", { opacity: 0, y: 18, duration: 0.9, ease: "power2.out", delay: 0.55, stagger: 0.08 });
      gsap.from(widgetRef.current, {
        scale: 0.94,
        opacity: 0,
        y: 35,
        duration: 1.25,
        ease: "back.out(1.15)",
        delay: 0.4,
        onComplete: () => {
          gsap.to(widgetRef.current, { y: "-=10", duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        },
      });
      gsap.to(".blob-1", { y: 120, ease: "none", scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".blob-2", { y: -170, ease: "none", scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 1.5 } });
      gsap.utils.toArray<HTMLElement>(".section-reveal").forEach((element) => {
        gsap.from(element, { opacity: 0, y: 35, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 82%" } });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#fafafa] text-gray-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="blob-1 absolute -left-[12%] -top-[12%] h-[52vw] w-[52vw] rounded-full bg-rose-100/60 mix-blend-multiply blur-[110px]" />
        <div className="blob-2 absolute -right-[12%] top-[16%] h-[48vw] w-[48vw] rounded-full bg-teal-50/90 mix-blend-multiply blur-[105px]" />
        <div className="absolute -bottom-[25%] left-[22%] h-[58vw] w-[58vw] rounded-full bg-indigo-50/60 mix-blend-multiply blur-[125px]" />
      </div>

      <nav className="fade-element relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gray-900 text-white shadow-sm">
            <Send className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">Fluid</span>
        </a>
        <div className="hidden items-center gap-8 text-[13px] font-medium text-gray-400 md:flex">
          <a href="#how" className="transition hover:text-gray-900">How it works</a>
          <a href="#security" className="transition hover:text-gray-900">Security</a>
          <a href="#technology" className="transition hover:text-gray-900">Technology</a>
        </div>
        <a href="#transfer" className="rounded-full border border-black/[0.06] bg-white/60 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur transition hover:bg-white">
          Open app
        </a>
      </nav>

      <main id="top" className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <section id="transfer" className="grid min-h-[calc(100vh-88px)] items-center gap-16 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <div className="max-w-2xl">
            <div className="fade-element mb-7 flex items-center gap-2.5">
              <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Private by default</span>
              <span className="text-xs font-medium text-gray-400">Peer-to-peer file transfer</span>
            </div>

            <h1 className="mb-7 text-[clamp(3.5rem,7vw,6.8rem)] font-bold leading-[0.94] tracking-[-0.065em]">
              <div className="overflow-hidden py-1"><div className="reveal-text">Files.</div></div>
              <div className="overflow-hidden py-1"><div className="reveal-text text-gray-400">Moving.</div></div>
              <div className="overflow-hidden py-1"><div className="reveal-text">Instantly.</div></div>
            </h1>

            <p className="fade-element max-w-lg text-base leading-7 text-gray-500 sm:text-lg">
              Move files directly between your devices. No cloud upload, no account, no unnecessary steps.
            </p>

            <div className="fade-element mt-9 flex flex-wrap items-center gap-3">
              <a href="#transfer" className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-gray-800">
                Start transferring
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/50 px-5 py-3 text-sm font-semibold text-gray-600 backdrop-blur transition hover:bg-white">
                See how it works
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div ref={widgetRef} className="flex justify-center lg:justify-end">
            <TransferWidget />
          </div>
        </section>

        <section id="how" className="section-reveal border-t border-black/[0.05] py-28 lg:py-36">
          <div className="mb-16 max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">How it works</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Three steps.<br /><span className="text-gray-400">That&apos;s it.</span></h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-black/[0.05] bg-black/[0.05] md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="bg-white/65 p-8 backdrop-blur-xl transition hover:bg-white/85 lg:p-10">
                <span className="text-xs font-bold text-gray-300">{step.number}</span>
                <h3 className="mt-16 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-gray-400">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="section-reveal grid gap-12 border-t border-black/[0.05] py-28 lg:grid-cols-2 lg:items-center lg:py-36">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Security</p>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Your files shouldn&apos;t need a detour through someone else&apos;s server.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.05] bg-white/60 p-6 backdrop-blur-xl">
              <LockKeyhole className="h-5 w-5 text-gray-500" />
              <h3 className="mt-8 text-sm font-semibold">Direct connection</h3>
              <p className="mt-2 text-xs leading-5 text-gray-400">Fluid is designed around peer-to-peer transport rather than cloud storage.</p>
            </div>
            <div className="rounded-2xl border border-black/[0.05] bg-white/60 p-6 backdrop-blur-xl">
              <ShieldCheck className="h-5 w-5 text-gray-500" />
              <h3 className="mt-8 text-sm font-semibold">Minimal exposure</h3>
              <p className="mt-2 text-xs leading-5 text-gray-400">The signaling service helps devices meet, then gets out of the way.</p>
            </div>
          </div>
        </section>

        <section id="technology" className="section-reveal border-t border-black/[0.05] py-28 lg:py-36">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Under the hood</p>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Simple on the surface.<br /><span className="text-gray-400">Serious underneath.</span></h2>
            </div>
            <div className="flex gap-3">
              {[{ icon: Network, label: "WebRTC" }, { icon: Zap, label: "16 KB chunks" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/60 px-4 py-2.5 text-xs font-semibold text-gray-500 backdrop-blur">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-t border-black/[0.05] px-6 py-8 text-xs font-medium text-gray-400 lg:px-8">
        <span>Fluid — local file transfer</span>
        <span>Built for your devices.</span>
      </footer>
    </div>
  );
}
