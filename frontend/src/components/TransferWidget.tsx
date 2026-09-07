"use client";

import { useRef, useState } from "react";
import { FileDown, FileText, Image as ImageIcon, X } from "lucide-react";

type SelectedFile = {
  file: File;
  name: string;
  size: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function FileIcon({ file }: { file: File }) {
  if (file.type.startsWith("image/")) return <ImageIcon className="h-5 w-5" strokeWidth={1.6} />;
  return <FileText className="h-5 w-5" strokeWidth={1.6} />;
}

export default function TransferWidget() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files).map((file) => ({
      file,
      name: file.name,
      size: formatSize(file.size),
    }));
    setSelected((current) => [...current, ...incoming].slice(0, 5));
  };

  return (
    <div className="relative w-full max-w-[430px]">
      <div className="absolute -inset-8 rounded-[3rem] bg-white/70 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-[0_35px_90px_-30px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-black/[0.045] px-6 py-5">
          <div>
            <p className="text-sm font-semibold tracking-tight text-gray-900">Send files</p>
            <p className="mt-0.5 text-[11px] font-medium text-gray-400">Peer-to-peer · local network</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ready
          </div>
        </div>

        <div className="p-5">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <button
            type="button"
            className={`group/drop flex min-h-[220px] w-full flex-col items-center justify-center rounded-[1.35rem] border border-dashed px-6 text-center transition-all duration-300 ${
              dragging
                ? "scale-[0.99] border-gray-400 bg-gray-100/80"
                : "border-gray-300/80 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50/90"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 shadow-[0_8px_25px_-12px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover/drop:-translate-y-1 group-hover/drop:shadow-md">
              <FileDown className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span className="text-sm font-semibold text-gray-700">Drop files here</span>
            <span className="mt-1.5 text-xs font-medium text-gray-400">or click to browse your device</span>
          </button>

          {selected.length > 0 && (
            <div className="mt-4 space-y-2">
              {selected.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-xl border border-black/[0.045] bg-white/70 px-3.5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <FileIcon file={item.file} />
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-xs font-semibold text-gray-800">{item.name}</p>
                      <p className="mt-0.5 text-[10px] font-medium text-gray-400">{item.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    className="ml-3 rounded-lg p-1.5 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
                    onClick={() => setSelected((current) => current.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-gray-800 active:translate-y-0"
              >
                Connect a device
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-black/[0.045] px-6 py-4 text-[10px] font-medium text-gray-400">
          <span>No uploads</span><span className="text-gray-200">·</span><span>No account</span><span className="text-gray-200">·</span><span>Direct transfer</span>
        </div>
      </div>
    </div>
  );
}
