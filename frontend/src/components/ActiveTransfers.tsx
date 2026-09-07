export default function ActiveTransfers() {
  const mockTransfers = [
    { id: 1, user: "Device_04", file: "my_large_file.mp4", size: "500MB", status: "Transferring", progress: 45 },
    { id: 2, user: "Laptop_Pro", file: "project_build.zip", size: "120MB", status: "Waiting", progress: 0 },
  ];

  return (
    <div className="bg-[#2a2d3a] rounded-3xl p-6 w-full max-w-sm shadow-xl border border-gray-700/50">
      <h3 className="text-gray-200 font-semibold mb-4 text-lg">Active Transfers</h3>
      <div className="space-y-4">
        {mockTransfers.map((transfer) => (
          <div key={transfer.id} className="bg-[#1e2029] p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-200">{transfer.user}</p>
                <p className="text-xs text-gray-400 truncate w-32">{transfer.file}</p>
              </div>
              <span className="text-xs font-semibold text-teal-400">{transfer.size}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-3">
              <div
                className="bg-teal-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${transfer.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
