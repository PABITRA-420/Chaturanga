export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated chess piece spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-[#D4AF7C] text-3xl select-none animate-bounce" style={{ animationDuration: '1.5s' }}>
            ♞
          </div>
        </div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <div className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5] tracking-wide">
            Loading...
          </div>
          <div className="text-[11px] text-[#A0A6B0] font-['Inter',sans-serif]">
            Preparing the board
          </div>
        </div>

        {/* Gold progress bar */}
        <div className="w-40 h-1 rounded-full bg-white/10 mx-auto overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#D4AF7C] to-[#F3E2B8]"
            style={{
              animation: 'loading-bar 1.5s ease-in-out infinite',
            }}
          />
        </div>

        <style>{`
          @keyframes loading-bar {
            0% { width: 0%; margin-left: 0; }
            50% { width: 70%; margin-left: 15%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
