import React, { useState } from 'react';

export default function Header() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <div className="relative w-full">
        <button 
          onClick={() => setIsAboutOpen(true)} 
          className="absolute right-0 top-0 mt-4 mr-4 text-orange-700 hover:text-orange-800 font-medium underline"
        >
          About
        </button>
      </div>

      <div className="flex justify-center items-center mb-2 flex-col mt-4 md:mt-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="DharmaPragya Logo" className="w-20 h-20 md:w-24 md:h-24 mb-4 rounded-full shadow-sm" />
        <h1 className="text-3xl md:text-4xl font-bold text-orange-800 text-center">DharmaPragya</h1>
      </div>
      <p className="text-center text-sm md:text-base text-gray-600 mb-6 px-4">Explore the wisdom of Sanatan Dharma.</p>

      {isAboutOpen && (
        <div className="fixed inset-0 bg-orange-50 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-16 sm:px-6 lg:px-8 max-w-3xl mx-auto relative">
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-8 right-4 sm:right-8 text-orange-600 hover:text-orange-800 text-4xl leading-none font-light"
            >
              &times;
            </button>
            <h2 className="text-4xl font-bold text-orange-800 mb-8 mt-12 border-b border-orange-200 pb-4">About DharmaPragya</h2>
            
            <p className="text-xl text-gray-800 mb-10 leading-relaxed">
              DharmaPragya is a platform that allows users to explore the wisdom of Sanatan Dharma by asking questions.
            </p>
            
            <div className="space-y-10">
              <div>
                <a 
                  href="https://github.com/Dhruvil-8/DharmaPragya" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-lg font-medium text-orange-700 hover:text-orange-900 bg-white px-6 py-3 rounded-lg shadow-sm border border-orange-100 transition-all hover:shadow-md"
                >
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub Repository
                </a>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-orange-800 mb-4">Our Other Related Sites</h3>
                <div className="flex flex-col space-y-3">
                  <a 
                    href="https://vedic-jyotish.vercel.app" 
                    target="_blank" 
                    rel="noreferrer"
                    className="block text-lg text-orange-700 hover:text-orange-900 bg-white px-6 py-4 rounded-lg shadow-sm border border-orange-100 transition-all hover:shadow-md"
                  >
                    <span className="font-medium">Vedic Jyotish Portal</span>
                    <span className="block text-sm text-gray-500 mt-1">Explore authentic Vedic Astrology</span>
                  </a>
                  <a 
                    href="https://dhruvil-8.github.io/SanatanDharmaDirectory/site/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="block text-lg text-orange-700 hover:text-orange-900 bg-white px-6 py-4 rounded-lg shadow-sm border border-orange-100 transition-all hover:shadow-md"
                  >
                    <span className="font-medium">Sanatan Dharma Directory</span>
                    <span className="block text-sm text-gray-500 mt-1">A curated directory of Sanatan Dharma resources</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
