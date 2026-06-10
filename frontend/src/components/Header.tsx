import React, { useState } from 'react';
import { Info, X, ExternalLink, Globe } from 'lucide-react';

export default function Header() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="relative w-full flex flex-col items-center mb-10 pt-4">
        {/* Top-Right Info Button */}
        <div className="absolute right-0 top-0 mt-2">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wider text-saffron-700 bg-cream-400/30 hover:bg-cream-400/60 border border-cream-500/20 rounded-full cursor-pointer hover:text-saffron-600 transition-all duration-300 hover:shadow-sm"
          >
            <Info className="w-3.5 h-3.5" />
            ABOUT
          </button>
        </div>

        {/* Main Logo & Title */}
        <div className="flex flex-col items-center mt-8 md:mt-4">
          <div className="relative p-1 rounded-full border-2 border-dashed border-saffron-500/30 mb-4 hover:border-saffron-500/60 transition-all duration-500 hover:rotate-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="DharmaPragya Logo" 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-md object-cover bg-white" 
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 to-terracotta-700 font-cinzel text-center">
            DharmaPragya
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-saffron-400 to-transparent mt-2 mb-3" />
          <p className="text-center text-xs md:text-sm text-saffron-700/70 font-medium tracking-wide uppercase max-w-md px-4">
            Explore the profound wisdom of Sanatan Dharma
          </p>
        </div>
      </header>

      {/* Modern Slide-over Drawer for About */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-500" 
            onClick={() => setIsAboutOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md transform transition-all duration-500 ease-out">
              <div className="h-full flex flex-col bg-cream-100 border-l border-cream-400 shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-6 bg-gradient-to-r from-cream-300 to-cream-200 border-b border-cream-400/40 flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-cinzel text-saffron-700">About DharmaPragya</h2>
                  <button
                    onClick={() => setIsAboutOpen(false)}
                    className="p-1 rounded-full text-stone-500 hover:text-saffron-600 hover:bg-cream-400/40 transition-all cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-8 space-y-8">
                  <p className="text-sm text-stone-700 leading-relaxed font-serif">
                    DharmaPragya is an AI-guided sanctuary for exploring the wisdom of Sanatan Dharma. 
                    Unlike simple search engines, it utilizes LLMs to analyze queries and retrieve 
                    verbatim verses directly from a fast, local SQLite database containing authentic translations 
                    and commentaries.
                  </p>

                  {/* GitHub Link Button */}
                  <div>
                    <a
                      href="https://github.com/Dhruvil-8/DharmaPragya"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-saffron-600 to-terracotta-700 rounded-xl hover:from-saffron-50 hover:to-terracotta-600 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub Repository
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  </div>

                  {/* Related Sites */}
                  <div className="space-y-4 pt-4 border-t border-cream-400/40">
                    <h3 className="text-xs font-bold tracking-wider text-saffron-700 uppercase">Our Related Sites</h3>
                    
                    <div className="space-y-3">
                      {/* Vedic Jyotish */}
                      <a
                        href="https://vedic-jyotish.vercel.app"
                        target="_blank"
                        rel="noreferrer"
                        className="group block p-4 bg-white hover:bg-cream-200 border border-cream-400/30 hover:border-saffron-500/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-saffron-700 group-hover:text-saffron-600">Vedic Jyotish Portal</span>
                          <Globe className="w-4 h-4 text-saffron-600/70 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="block text-xs text-stone-500">Ancient Calculations. AI‑Assisted Interpretation</span>
                      </a>

                      {/* Directory */}
                      <a
                        href="https://dhruvil-8.github.io/SanatanDharmaDirectory/site/"
                        target="_blank"
                        rel="noreferrer"
                        className="group block p-4 bg-white hover:bg-cream-200 border border-cream-400/30 hover:border-saffron-500/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-saffron-700 group-hover:text-saffron-600">Sanatan Dharma Directory</span>
                          <Globe className="w-4 h-4 text-saffron-600/70 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="block text-xs text-stone-500">A curated directory of Sanatan Dharma resources</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer inside Drawer */}
                <div className="px-6 py-6 bg-cream-200/50 border-t border-cream-400/30 text-center text-[10px] text-stone-500 font-medium">
                  DharmaPragya Platform &copy; {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
