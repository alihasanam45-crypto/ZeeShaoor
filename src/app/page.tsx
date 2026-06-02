export default async function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500">
      {/* Navbar with Logo Branding */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10">
        <div className="text-3xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          ZeeShaoor.Pk
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Logo Section */}
        <div className="mb-10 animate-pulse">
           <div className="w-24 h-24 mx-auto rounded-full border-2 border-cyan-500/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">📖</div>
        </div>

        <h1 className="text-6xl font-black mb-6 leading-tight">
          Pakistan's No. 1 <span className="text-cyan-400">Automated</span> <br /> Educational Paper Generator
        </h1>
        
        {/* Cards using Logo Gradient */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { title: "Admin & Educator", color: "from-cyan-500 to-blue-500" },
            { title: "Student Launchpad", color: "from-blue-500 to-purple-500" },
            { title: "Parent Portal", color: "from-purple-500 to-pink-500" }
          ].map((card, i) => (
            <div key={i} className={`p-[2px] rounded-3xl bg-gradient-to-br ${card.color}`}>
              <div className="p-8 bg-[#0a0a0a] rounded-[22px] hover:bg-black transition-all">
                <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">Access Portal</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}