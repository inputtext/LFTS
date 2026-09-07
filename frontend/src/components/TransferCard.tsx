export default function TransferCard() {
  return (
    <div className="bg-[#2a2d3a] rounded-3xl p-8 w-full max-w-2xl shadow-xl border border-gray-700/50 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
      {/* This empty div will be the target for our GSAP floating icons next */}
      <div className="absolute inset-0 z-0 opacity-50" id="animation-container"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-md bg-[#1e2029]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-600/50">
        <div className="text-white mb-2 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <span className="font-semibold">Drag and drop files here</span>
        </div>
        <div className="text-xs text-gray-400 mb-6">- or -</div>

        <button className="w-full bg-teal-400 hover:bg-teal-300 text-gray-900 font-bold py-3 px-4 rounded-xl transition-colors mb-3">
          Select files to share
        </button>
        <button className="w-full bg-[#3f4254] hover:bg-[#4b4e63] text-gray-200 font-semibold py-3 px-4 rounded-xl transition-colors">
          Request files to share
        </button>
      </div>
    </div>
  );
}
