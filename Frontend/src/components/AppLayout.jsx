import React, { useEffect } from 'react';
import Navigation from './Navigation';
import TickerTape from './TickerTape';
import BackgroundEffects from './BackgroundEffects';
import { useTheme } from '../context/ThemeContext';
import ChatWidget from '../chatbot/ChatWidget';

const AppLayout = ({ children }) => {
  const { theme } = useTheme();
  const bgColor = theme === 'black' ? '#000000' : '#030014';

  useEffect(() => {
    // Force background color on mount and theme change
    if (theme === 'black') {
      document.body.style.backgroundColor = '#000000';
      document.documentElement.style.backgroundColor = '#000000';
    }
  }, [theme]);


  return (
    <div
      className="min-h-screen transition-colors duration-500 relative overflow-x-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Dynamic Background - Hidden in black mode */}
      {theme !== 'black' && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className={`absolute inset-0 transition-opacity duration-1000 bg-surreal-gradient-dark opacity-100`} />
          {/* Animated Orbs/Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-surreal-purple/30 rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-surreal-cyan/20 rounded-full blur-[120px] animate-float-slow" style={{ animationDelay: '-3s' }} />
        </div>
      )}


      {/* Black mode - pure black background with animated effects */}
      {theme === 'black' && (
        <>
          <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: '#000000' }} />
          <BackgroundEffects />
        </>
      )}

      <div className="relative z-10">
        <Navigation />
        <TickerTape />
        <main className="pb-20 max-w-[1600px] mx-auto px-4 md:px-8 pt-6">{children}</main>
      </div>

      <ChatWidget />
    </div>
  );
};

export default AppLayout;

