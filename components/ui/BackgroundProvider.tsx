'use client';

import { useEffect, useState } from 'react';

const backgroundImages = [
  '/backgrounds/pexels-mo-eid-1268975-10079452.jpg',
  '/backgrounds/pexels-mo-eid-1268975-11592813.jpg',
  '/backgrounds/pexels-mo-eid-1268975-11917810.jpg',
  '/backgrounds/pexels-mo-eid-1268975-11968627.jpg',
  '/backgrounds/pexels-mo-eid-1268975-16000582.jpg',
  '/backgrounds/pexels-mo-eid-1268975-8657160.jpg',
  '/backgrounds/pexels-mo-eid-1268975-9454915.jpg',
];

export default function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const savedBg = localStorage.getItem('currentBackground');
    if (savedBg) {
      setCurrentBg(parseInt(savedBg));
    } else {
      const randomBg = Math.floor(Math.random() * backgroundImages.length);
      setCurrentBg(randomBg);
      localStorage.setItem('currentBackground', randomBg.toString());
    }
  }, []);

  const changeBackground = () => {
    const nextBg = (currentBg + 1) % backgroundImages.length;
    setCurrentBg(nextBg);
    localStorage.setItem('currentBackground', nextBg.toString());
  };

  return (
    <>
      <img 
        src={backgroundImages[currentBg]} 
        alt="Background" 
        className="bg-image"
      />
      <div className="bg-overlay" />
      {children}
    </>
  );
}