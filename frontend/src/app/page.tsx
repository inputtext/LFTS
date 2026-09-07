"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Send, FileDown, Image as ImageIcon, FileText, Link, Eye, Download, Settings, Lock, Edit3, Trash2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. AE-Style Masked Text Reveal
      // The text elements slide up from behind their overflow-hidden wrappers
      gsap.from(".reveal-text", {
        y: "120%",
        ease: "power4.out",
        duration: 1.2,
        stagger: 0.15,
        delay: 0.2
      });

      gsap.from(".fade-element", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power2.out",
        delay: 0.8
      });

      // 2. Spring-loaded Widget Entrance
      gsap.from(widgetRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 40,
        duration: 1.4,
        ease: "back.out(1.2)",
        delay: 0.6,
        onComplete: () => {
          // 3. Continuous "Weightless" Floating Animation
          gsap.to(widgetRef.current, {
            y: "-=15",
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      });

      // 4. Subtle Parallax for the Pastel Background Blobs
      gsap.to(".blob-1", {
        y: 100,
        ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 1 }
      });
      gsap.to(".blob-2", {
        y: -150,
        ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom top", scrub: 1.5 }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-[150vh] flex flex-col items-center overflow-hidden bg-[#fafafa]">

      {/* Abstract Pastel Background Blobs (Simulating AE Gradient Meshes) */}
      <div className="blob-1 absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-100/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="blob-2 absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-teal-50/80 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-50/50 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>

      {/* Navigation */}
      <nav className="fade-element w-full max-w-7xl flex items-center justify-between px-8 py-8 z-20">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
          <span className="font-semibold text-gray-800 tracking-tight text-lg">Fluid</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Security</a>
          <a href="#" className="hover:text-gray-900 transition-colors">API</a>
        </div>
        <button className="text-sm font-semibold text-gray-900 bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-200/50 shadow-sm hover:bg-white transition-all">
          Open App
        </button>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-7xl px-8 pt-16 pb-32 flex flex-col lg:flex-row items-center justify-between z-20 flex-1 gap-16">

        {/* Left Typography */}
        <div className="flex flex-col max-w-xl">
          <div className="flex gap-2 items-center mb-6 fade-element">
            <span className="px-3 py-1 text-xs font-semibold tracking-wide text-teal-700 bg-teal-50 rounded-full border border-teal-100">NEW</span>
            <span className="text-sm font-medium text-gray-500">Up to 500MB chunked local transfers</span>
          </div>

          <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter text-gray-900 leading-[1.1] mb-6">
            <div className="overflow-hidden py-1"><div className="reveal-text">Transfer files.</div></div>
            <div className="overflow-hidden py-1"><div className="reveal-text text-gray-400">Without the</div></div>
            <div className="overflow-hidden py-1"><div className="reveal-text text-gray-400">friction.</div></div>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-md fade-element">
            A minimalist approach to local network sharing. Secure, peer-to-peer, and seamlessly integrated into your workflow.
          </p>
        </div>

        {/* Right Widget (The Glassmorphism UI) */}
        <div ref={widgetRef} className="w-full max-w-md relative group">
          {/* Subtle glow behind the widget */}
          <div className="absolute inset-0 bg-white/40 blur-3xl rounded-[3rem] -z-10 transition-opacity duration-500 group-hover:opacity-100 opacity-50"></div>

          <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/60">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
                <span className="font-semibold text-gray-800 tracking-tight">Fluid</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="border-[1.5px] border-dashed border-gray-300/80 rounded-2xl bg-gray-50/50 hover:bg-gray-50/80 transition-colors cursor-pointer flex flex-col items-center justify-center py-12 group/drop">
                <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 mb-4 group-hover/drop:scale-110 group-hover/drop:shadow-md transition-all duration-300">
                  <FileDown className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-gray-500">Drag files here</span>
              </div>
            </div>

            <div className="flex flex-col pb-2">
              {[
                { name: "Image-001.jpg", size: "5 KB", icon: ImageIcon },
                { name: "Presentation.pdf", size: "11 MB", icon: FileText }
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group/file cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100/80 p-3 rounded-xl text-gray-600">
                      <file.icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">{file.name}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-medium">
                        <span>{file.size}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 3</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover/file:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2 text-gray-400">
                      <button className="hover:text-gray-700 transition-colors"><Lock className="w-4 h-4" strokeWidth={1.5} /></button>
                      <button className="hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
