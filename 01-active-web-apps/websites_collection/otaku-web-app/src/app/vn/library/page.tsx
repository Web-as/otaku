'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const ParallaxCanvas = dynamic(
  () => import('@/components/vn/ParallaxCanvas').then(mod => mod.ParallaxCanvas),
  { ssr: false }
);
import { VNDialogueBox } from '@/components/vn/VNDialogueBox';

export default function LibrarianArchivePage() {
  const [step, setStep] = useState(0);

  const dialogueScript = [
    {
      speaker: 'The Archivist',
      text: 'Welcome back to the Grand Archives. I see you\'ve been busy. Have you finished reading "Frieren: Beyond Journey\'s End"?',
      mood: 'happy' as const,
      choices: [
        { id: '1', label: 'Mark as Completed (Earn 50 EXP)', isAction: true, onClick: () => setStep(1) },
        { id: '2', label: 'Search for a new series', onClick: () => setStep(2) },
      ]
    },
    {
      speaker: 'The Archivist',
      text: 'Splendid! I have filed it under your completed records. You\'ve been awarded 50 EXP. You are close to leveling up!',
      mood: 'surprised' as const,
      choices: [
        { id: '3', label: 'View my full tracking list', onClick: () => setStep(0) }
      ]
    },
    {
      speaker: 'The Archivist',
      text: 'Accessing the database. Please select a category you wish to explore today.',
      mood: 'neutral' as const,
      choices: [
        { id: '4', label: 'Browse Isekai Manga', onClick: () => setStep(0) },
        { id: '5', label: 'Return to Hub', href: '/' }
      ]
    }
  ];

  const currentLine = dialogueScript[step];

  return (
    <div className="w-full h-full relative">
      <ParallaxCanvas 
        backgroundImageUrl="/assets/bg/library_back.jpg"
      />

      <div className="absolute bottom-0 right-[25%] w-[450px] h-[750px] pointer-events-none">
        <img 
          src="https://placehold.co/450x750/0a0a0c/ff00ff?text=Librarian+Sprite" 
          alt="Librarian Sprite" 
          className="w-full h-full object-contain"
        />
      </div>

      <VNDialogueBox 
        speakerName={currentLine.speaker}
        text={currentLine.text}
        choices={currentLine.choices}
        mood={currentLine.mood}
      />
    </div>
  );
}
