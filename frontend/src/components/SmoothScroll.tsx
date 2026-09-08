"use client";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Native scrolling is intentionally used for the transfer console.
  // It keeps browser touch/pointer handling fully native on mobile devices.
  return <>{children}</>;
}
