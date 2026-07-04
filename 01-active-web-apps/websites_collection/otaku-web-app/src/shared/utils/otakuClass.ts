export type AnimeGenre = 'Action' | 'Adventure' | 'Fantasy' | 'Isekai' | 'Slice of Life' | 'Comedy' | 'Mecha' | 'Sci-Fi' | 'Psychological' | 'Mystery' | 'Romance';

export interface UserAnimeProfile {
  total_anime_count: number;
  genre_counts: Record<AnimeGenre | string, number>;
}

export interface OtakuClassInfo {
  className: string;
  tier: number;
  tierName: string;
  rankName: string;
}

const GLOBAL_RANKS = [
  { max: 10, name: 'Casual Viewer' },
  { max: 50, name: 'Seasonal Enthusiast' },
  { max: 150, name: 'Dedicated Otaku' },
  { max: 500, name: 'Hardcore Weeb' },
  { max: Infinity, name: 'Anime Sage' },
];

const CLASS_TIERS = {
  ShonenProtagonist: ['Academy Student', 'Rookie Hero', 'Tournament Champion', 'Awakened Legend'],
  IsekaiTraveler: ['Reincarnated Peasant', 'Guild Adventurer', 'Demon Lord Slayer', 'Transcendent Being'],
  SliceOfLifeConnoisseur: ['Transfer Student', 'Club President', 'Festival Organizer', 'Local Legend'],
  MechaAce: ['Trainee Cadet', 'Ace Pilot', 'Squadron Leader', 'Galactic Savior'],
  SeinenScholar: ['Curious Detective', 'Cynical Investigator', 'Mastermind', 'Truth Seeker'],
  RomComLead: ['Flustered Crush', 'Confession Planner', 'Harem Protagonist', 'True Matchmaker'],
  GenericAdventurer: ['Beginner', 'Veteran', 'Elite', 'Legendary'],
};

export function calculateOtakuClass(profile: UserAnimeProfile): OtakuClassInfo {
  const { total_anime_count, genre_counts } = profile;

  // Determine global rank
  const rank = GLOBAL_RANKS.find(r => total_anime_count <= r.max) || GLOBAL_RANKS[GLOBAL_RANKS.length - 1];

  // Determine dominant class based on genres
  let maxCount = -1;
  let dominantClass = 'GenericAdventurer';

  const checkAndSet = (genres: string[], className: string) => {
    const count = genres.reduce((sum, g) => sum + (genre_counts[g] || 0), 0);
    if (count > maxCount && count > 0) {
      maxCount = count;
      dominantClass = className;
    }
  };

  checkAndSet(['Action', 'Adventure'], 'ShonenProtagonist');
  checkAndSet(['Fantasy', 'Isekai'], 'IsekaiTraveler');
  checkAndSet(['Slice of Life', 'Comedy'], 'SliceOfLifeConnoisseur');
  checkAndSet(['Mecha', 'Sci-Fi'], 'MechaAce');
  checkAndSet(['Psychological', 'Mystery'], 'SeinenScholar');
  checkAndSet(['Romance'], 'RomComLead');

  // Determine tier (e.g. 0-5 = tier 1, 6-20 = tier 2, 21-50 = tier 3, 51+ = tier 4)
  let tierIndex = 0;
  if (maxCount > 5) tierIndex = 1;
  if (maxCount > 20) tierIndex = 2;
  if (maxCount > 50) tierIndex = 3;

  // Ensure index is within bounds
  const classTiers = CLASS_TIERS[dominantClass as keyof typeof CLASS_TIERS] || CLASS_TIERS.GenericAdventurer;
  const actualTierIndex = Math.min(tierIndex, classTiers.length - 1);

  // Map to friendly class name
  const friendlyNames: Record<string, string> = {
    ShonenProtagonist: 'The Shonen Protagonist',
    IsekaiTraveler: 'The Isekai Traveler',
    SliceOfLifeConnoisseur: 'The Slice-of-Life Connoisseur',
    MechaAce: 'The Mecha Ace',
    SeinenScholar: 'The Seinen Scholar',
    RomComLead: 'The Rom-Com Lead',
    GenericAdventurer: 'The Generic Adventurer',
  };

  return {
    className: friendlyNames[dominantClass] || 'Unknown Class',
    tier: actualTierIndex + 1,
    tierName: classTiers[actualTierIndex],
    rankName: rank.name,
  };
}
