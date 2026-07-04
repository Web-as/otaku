'use client';

import React, { useState } from 'react';
import { ParallaxCanvas } from './ParallaxCanvas';
import { VNDialogueBox, DialogueChoice } from './VNDialogueBox';

interface AgentVNScreenProps {
  initialSceneId?: string;
}

export function AgentVNScreen({ initialSceneId = 'intro' }: AgentVNScreenProps) {
  const [currentSpeaker, setCurrentSpeaker] = useState<'librarian' | 'dm'>('librarian');
  const [dialogueText, setDialogueText] = useState("Welcome to the nexus. I am the Anime Librarian. My associate and I will guide your next campaign.");
  const [choices, setChoices] = useState<DialogueChoice[]>([
    { id: '1', label: 'Speak to the DM', onClick: () => handleChoice('dm') },
    { id: '2', label: 'Ask about Lore', onClick: () => handleChoice('lore') }
  ]);

  const handleChoice = (action: string) => {
    if (action === 'dm') {
      setCurrentSpeaker('dm');
      setDialogueText("Heh. Ready to roll the dice, player? Let's see if your stats can handle this quest.");
      setChoices([
        { id: '3', label: 'Roll Initiative', onClick: () => handleChoice('roll') },
        { id: '4', label: 'Wait, I need to prepare!', onClick: () => handleChoice('librarian') }
      ]);
    } else if (action === 'librarian') {
      setCurrentSpeaker('librarian');
      setDialogueText("Knowledge is power. What do you need to know before we begin?");
      setChoices([
        { id: '1', label: 'Speak to the DM', onClick: () => handleChoice('dm') }
      ]);
    } else if (action === 'lore') {
      setDialogueText("The world is vast. I have compiled the sacred texts from the visual novel databases. We are ready when you are.");
      setChoices([
        { id: '1', label: 'Speak to the DM', onClick: () => handleChoice('dm') }
      ]);
    } else if (action === 'roll') {
      setDialogueText("Critical hit! The adventure begins...");
      setChoices([]);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background and Live2D Characters Layer */}
      <div className="absolute inset-0 opacity-80">
        <ParallaxCanvas 
          backgroundImageUrl="/assets/bg/tavern_back.jpg" 
          live2dModels={[
            {
              url: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json',
              xOffset: -400,
              yOffset: 100,
              scale: 0.3
            },
            {
              url: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/koharu/koharu.model.json',
              xOffset: 400,
              yOffset: 100,
              scale: 0.3
            }
          ]}
        />
      </div>

      {/* UI Layer */}
      <VNDialogueBox 
        speakerName={currentSpeaker === 'librarian' ? 'The Librarian' : 'DM Friend'}
        text={dialogueText}
        choices={choices}
        mood={currentSpeaker === 'dm' ? 'happy' : 'neutral'}
      />
    </div>
  );
}
