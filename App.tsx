
import React from 'react';
import ShadowModeWorkflow from './components/ShadowModeWorkflow';

const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 py-6 sticky top-0 z-50 px-6 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <i className="fas fa-microchip text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-1 uppercase">Human AI</h1>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Mentorship AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 text-[10px] font-black uppercase tracking-widest items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                System Live
             </div>
             <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
                <i className="fas fa-gear"></i>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="bg-slate-50/50 min-h-[calc(100vh-80px)]">
        <ShadowModeWorkflow />
      </main>

      {/* Subtle Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <i className="fas fa-shield-halved text-blue-500"></i>
            Protecting Clinical Expertise
          </div>
          <div className="flex gap-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-slate-600">Protocol</a>
            <a href="#" className="hover:text-slate-600">Pedagogy</a>
            <a href="#" className="hover:text-slate-600">Ethics</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
