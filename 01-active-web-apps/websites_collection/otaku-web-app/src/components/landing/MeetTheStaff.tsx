"use client";
import React from 'react';
import { ShieldCheck, BookOpen, Crown } from 'lucide-react';

const MeetTheStaff: React.FC = () => {
  return (
    <section className="py-24 bg-[#0a0a0c] border-t border-gray-800/50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-900/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-violet-400 uppercase tracking-[0.3em] mb-4">Kas mes tokie?</h2>
          <h3 className="text-4xl md:text-5xl font-black uppercase text-white tracking-wider">
            Meet the <span className="text-[#00f0ff]">Staff</span>
          </h3>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Mūsų ekosistemą prižiūri ne tik administratoriai, bet ir unikalūs dirbtinio intelekto personažai. 
            Susipažinkite su jais žemiau.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* The Librarian */}
          <div className="glass-card rounded-2xl p-8 border border-brand-magenta-neon/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-magenta-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#13111c] border-2 border-brand-magenta-neon flex flex-shrink-0 items-center justify-center text-brand-magenta-neon shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-brand-magenta-neon uppercase tracking-wider mb-2">The Librarian</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Senovinė ir paslaptinga archyvų saugotoja. Ji stebi jūsų anime sąrašus ir saugo prieigą prie premium funkcijų. 
                  Jei neturite bibliotekos kortelės, ji mielai jums ją išduos (už atitinkamą kainą).
                </p>
                <div className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand-magenta-neon/70">
                  <span className="w-2 h-2 rounded-full bg-brand-magenta-neon mr-2 animate-pulse" />
                  Budėjimo Postas: Biblioteka
                </div>
              </div>
            </div>
          </div>

          {/* The DM Friend */}
          <div className="glass-card rounded-2xl p-8 border border-[#d8b56a]/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d8b56a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#1a1710] border-2 border-[#d8b56a] flex flex-shrink-0 items-center justify-center text-[#d8b56a] shadow-[0_0_15px_rgba(216,181,106,0.3)]">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-[#d8b56a] uppercase tracking-wider mb-2">DM Friend</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Jūsų asmeninis Game Master. Jis veda RPG sesijas VIP Tavernoje ir padeda kurti istorijas su Storybound varikliu.
                  Norite prisijungti prie jo stalo? Jums prireiks VIP Guild Master statuso!
                </p>
                <div className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#d8b56a]/70">
                  <span className="w-2 h-2 rounded-full bg-[#d8b56a] mr-2 animate-pulse" />
                  Budėjimo Postas: VIP Taverna
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MeetTheStaff;
