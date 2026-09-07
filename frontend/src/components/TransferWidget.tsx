"use client";

import { useRef, useState } from "react";
import { FileDown, FileText, Image as ImageIcon, X } from "lucide-react";

type SelectedFile = { file: File; name: string; size: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function FileIcon({ file }: { file: File }) {
  return file.type.startsWith("image/") ? <ImageIcon className="h-4 w-4" strokeWidth={1.7} /> : <FileText className="h-4 w-4" strokeWidth={1.7} />;
}

export default function TransferWidget() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files).map((file) => ({ file, name: file.name, size: formatSize(file.size) }));
    setSelected((current) => [...current, ...incoming].slice(0, 5));
  };

  return (
    <div className="w-full max-w-[500px] border border-black bg-[#f8f7f2] shadow-[10px_10px_0_#111318]">
      <div className="flex items-stretch justify-between border-b border-black">
        <div className="px-5 py-4"><p className="font-mono-fluid text-[10px] font-semibold uppercase tracking-[0.12em]">Transfer console</p><p className="mt-1 text-xs text-black/45">Direct peer connection</p></div>
        <div className="flex items-center border-l border-black px-4 font-mono-fluid text-[9px] uppercase tracking-[0.12em]"><span className="mr-2 h-2 w-2 rounded-full bg-[#9dcc00]" /> Ready</div>
      </div>

      <div className="p-5">
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
        <button type="button" className={`group/drop relative flex min-h-[285px] w-full flex-col items-center justify-center border border-black/25 bg-white text-center transition-colors ${dragging ? "bg-[#e9ff72]" : "hover:bg-[#eeeee8]"}`} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}>
          <span className="absolute left-3 top-3 font-mono-fluid text-[8px] uppercase tracking-[0.12em] text-black/30">INPUT / FILE</span>
          <span className="mb-5 flex h-16 w-16 items-center justify-center border border-black bg-[#f3f2ed] transition-transform group-hover/drop:-translate-y-1"><FileDown className="h-7 w-7" strokeWidth={1.4} /></span>
          <span className="text-lg font-semibold tracking-tight">Drop files here</span>
          <span className="mt-2 font-mono-fluid text-[9px] uppercase tracking-[0.1em] text-black/40">or click to browse</span>
          <span className="absolute bottom-3 left-3 font-mono-fluid text-[8px] uppercase tracking-[0.12em] text-black/25">MAX 500 MB</span>
          <span className="absolute bottom-3 right-3 font-mono-fluid text-[8px] uppercase tracking-[0.12em] text-black/25">P2P / LOCAL</span>
        </button>

        {selected.length > 0 && <div className="mt-4 border-t border-black/10 pt-3">
          {selected.map((item, index) => <div key={`${item.name}-${index}`} className="flex items-center justify-between border-b border-black/10 py-3">
            <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center border border-black/10 bg-white"><FileIcon file={item.file} /></span><div className="min-w-0 text-left"><p className="truncate text-xs font-semibold">{item.name}</p><p className="mt-0.5 font-mono-fluid text-[9px] text-black/40">{item.size}</p></div></div>
            <button type="button" aria-label={`Remove ${item.name}`} className="ml-3 p-1 text-black/30 transition hover:text-red-600" onClick={() => setSelected((current) => current.filter((_, i) => i !== index))}><X className="h-4 w-4" /></button>
          </div>)}
          <button type="button" className="mt-4 w-full border border-black bg-[#111318] px-4 py-3 text-left font-mono-fluid text-[10px] uppercase tracking-[0.12em] text-[#f3f2ed] transition hover:bg-[#e9ff72] hover:text-[#111318]">Connect device <span className="float-right">↗</span></button>
        </div>}
      </div>

      <div className="grid grid-cols-3 border-t border-black font-mono-fluid text-[8px] uppercase tracking-[0.1em] text-black/40"><span className="border-r border-black px-4 py-3">No uploads</span><span className="border-r border-black px-4 py-3">No account</span><span className="px-4 py-3">Direct transfer</span></div>
    </div>
  );
}
