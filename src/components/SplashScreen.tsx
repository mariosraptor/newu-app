import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
    setTimeout(() => onComplete(), 3000);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#001F3F] flex items-center justify-center z-50">
      <div
        className={`text-center px-8 transition-opacity duration-2000 ${
          fadeIn ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h1 className="text-white text-4xl md:text-5xl font-light tracking-wide mb-4">
          NewU
        </h1>
        <p className="text-white/90 text-xl md:text-2xl font-light leading-relaxed">
          Become someone new.
          <br />
          Break free.
        </p>
      </div>
    </div>
  );
}
