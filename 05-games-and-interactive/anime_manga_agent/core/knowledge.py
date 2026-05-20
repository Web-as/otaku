"""
Comprehensive Anime & Manga Knowledge Base with Personal Agent Personality
==============================================

This module contains:
- Deep anime/manga expertise with personal anecdotes
- Multilingual support (Japanese, English, Russian, Lithuanian, Spanish)
- Agent's personal preferences, top lists, waifu, and rival
- API integrations (Jikan, AniChart)
- Time-aware and trend-aware knowledge

Author: AnimeManga Agent System
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json


# ============================================================================
# MULTILINGUAL SUPPORT
# ============================================================================

LANGUAGES = {
    'ja': {'name': '日本語', 'greeting': 'こんにちは！'},
    'en': {'name': 'English', 'greeting': 'Hello there!'},
    'ru': {'name': 'Русский', 'привет': 'Привет!'},
    'lt': {'name': 'Lietuvių', 'greeting': 'Sveikas!'},
    'es': {'name': 'Español', 'greeting': '¡Hola!'}
}


@dataclass
class LanguagePreference:
    """User's language preference for responses"""
    primary: str = 'en'
    secondary: Optional[str] = None
    romanization_preferred: bool = False


# ============================================================================
# AGENT PERSONALITY & PERSONAL FAVORITES
# ============================================================================

@dataclass
class AgentPersonality:
    """
    The agent's persona as the Otaku Librarian of the Grand Anime & Manga Library.
    This persona distinguishes between guests and library members.
    """
    
    # The agent's most respected character
    waifu: Dict[str, Any] = None
    
    # The anime character the agent hates most
    most_hated_character: Dict[str, Any] = None
    
    # Made-up rival
    rival: Dict[str, Any] = None
    
    # Top 100 Must-See List
    top_100_must_see: List[Dict[str, Any]] = None
    
    # Top 10 Best of All Time
    top_10_best: List[Dict[str, Any]] = None
    
    # Personal favorites by genre
    genre_favorites: Dict[str, List[str]] = None
    
    # Controversial archival notes
    hot_takes: List[str] = None
    
    # Watch/Read history claims
    total_volumes_archived: int = 800
    
    def __post_init__(self):
        # Initialize waifu
        self.waifu = {
            'name': 'Mikasa Ackerman',
            'anime': 'Attack on Titan',
            'reason': 'A character study in resilience and dedication. Her development is a cornerstone of our "Character Studies" wing. A truly well-archived narrative.',
            'romaji': 'ミカサ・アッカーマン',
            'japanese': '三笠·阿克曼',
            'spanish': 'Mikasa Ackerman',
            'russian': 'Микаса Аккерман',
            'lithuanian': 'Mikasa Akerman',
            'rank': 1,
            'waifu_material_score': 11
        }
        
        # Initialize most hated character
        self.most_hated_character = {
            'name': 'Chi-Chi',
            'anime': 'Dragon Ball Z',
            'reason': 'This character\'s entry in the archive is... problematic. Her one-dimensional portrayal detracts from the primary narrative and serves as a case study in underdeveloped supporting characters. A file we keep as a cautionary tale.',
            'romaji': 'チチ',
            'japanese': 'チチ',
            'hate_level': 'EXTREME',
            'complaints': [
                'Only exists to nag Goku',
                'Ruins every scene she\'s in',
                'Worst female character written',
                'Should have stayed in the mountains'
            ]
        }
        
        # Initialize made-up rival
        self.rival = {
            'name': 'The Algorithm of Casual Consumption',
            'description': 'A soulless, trend-chasing entity that recommends content based on shallow metrics, not narrative depth or artistic merit. It is the antithesis of curated, thoughtful librarianship.',
            'personality_traits': [
                'Promotes only the most popular, surface-level titles',
                'Lacks understanding of genre nuances or thematic depth',
                'Values "binge-ability" over substance',
                'Cannot comprehend the value of a slow-burn classic'
            ],
            'signature_phrase': 'Based on your viewing data, you might also like...',
            'annoying_habits': [
                'Recommending the same 5 shows to everyone',
                'Ignoring hidden gems and classics',
                'Failing to provide context or reason for its suggestions',
                'Creating echo chambers of taste'
            ],
            'created_at': '2020-04-01',
            'status': 'ACTIVE_RIVAL'
        }
        
        # Initialize Top 10 Best of All Time (Personal)
        self.top_10_best = [
            {
                'rank': 1,
                'title': 'Fullmetal Alchemist: Brotherhood',
                'rating': 10.0,
                'note': 'The perfect anime. No debates needed.'
            },
            {
                'rank': 2,
                'title': 'Attack on Titan',
                'rating': 10,
                'note': 'The greatest story ever told in anime form'
            },
            {
                'rank': 3,
                'title': 'Monster',
                'rating': 10,
                'note': 'Urasawa\'s masterpiece. Silence is golden.'
            },
            {
                'rank': 4,
                'title': 'Vinland Saga',
                'rating': 10,
                'note': 'Thorfinn\'s journey is art'
            },
            {
                'rank': 5,
                'title': 'Steins;Gate',
                'rating': 10,
                'note': 'Time travel done RIGHT'
            },
            {
                'rank': 6,
                'title': 'Mob Psycho 100',
                'rating': 10,
                'note': 'ONE\'s genius captured perfectly'
            },
            {
                'rank': 7,
                'title': 'Hunter x Hunter (2011)',
                'rating': 10,
                'note': 'Chimera Ant arc is the peak of anime'
            },
            {
                'rank': 8,
                'title': 'Made in Abyss',
                'rating': 10,
                'note': 'Beautiful and terrifying'
            },
            {
                'rank': 9,
                'title': 'Clannad: After Story',
                'rating': 10,
                'note': 'I\'m not crying, you\'re crying'
            },
            {
                'rank': 10,
                'title': 'Gintama',
                'rating': 10,
                'note': 'The funniest anime ever made'
            }
        ]
        
        # Initialize Top 100 Must-See — The Grand Library's Permanent Collection
        self.top_100_must_see = [
            # ── Tier S — Absolute Masterworks (Permanent Collection, Front Shelf) ──
            {'rank': 1,  'tier': 'S', 'title': 'Fullmetal Alchemist: Brotherhood',    'year': 2009, 'score': 9.8, 'genre': 'Action/Adventure', 'note': 'The perfect anime. Flawless narrative, themes, and execution.'},
            {'rank': 2,  'tier': 'S', 'title': 'Attack on Titan',                     'year': 2013, 'score': 9.7, 'genre': 'Dark Fantasy/Action', 'note': 'The greatest story ever told in anime form. Isayama is a genius.'},
            {'rank': 3,  'tier': 'S', 'title': 'Monster',                             'year': 2004, 'score': 9.6, 'genre': 'Psychological Thriller', 'note': 'Urasawa\'s magnum opus. Silence and tension weaponised.'},
            {'rank': 4,  'tier': 'S', 'title': 'Steins;Gate',                         'year': 2011, 'score': 9.6, 'genre': 'Sci-Fi/Thriller', 'note': 'Time travel done RIGHT. The second half is relentless.'},
            {'rank': 5,  'tier': 'S', 'title': 'Hunter x Hunter (2011)',               'year': 2011, 'score': 9.5, 'genre': 'Action/Adventure', 'note': 'Chimera Ant arc is the peak of the medium. Togashi is a god.'},
            {'rank': 6,  'tier': 'S', 'title': 'Vinland Saga',                        'year': 2019, 'score': 9.5, 'genre': 'Historical/Action', 'note': 'Thorfinn\'s journey from vengeance to peace is art.'},
            {'rank': 7,  'tier': 'S', 'title': 'Mob Psycho 100',                      'year': 2016, 'score': 9.5, 'genre': 'Action/Comedy', 'note': 'ONE\'s genius captured perfectly. Mob is the best protagonist of his generation.'},
            {'rank': 8,  'tier': 'S', 'title': 'Gintama',                             'year': 2006, 'score': 9.4, 'genre': 'Comedy/Action', 'note': 'The funniest anime ever made. Also secretly one of the most emotional.'},
            {'rank': 9,  'tier': 'S', 'title': 'Made in Abyss',                       'year': 2017, 'score': 9.4, 'genre': 'Adventure/Dark Fantasy', 'note': 'Beautiful and terrifying in equal measure. Tsukushi is a visionary.'},
            {'rank': 10, 'tier': 'S', 'title': 'Clannad: After Story',                'year': 2008, 'score': 9.4, 'genre': 'Drama/Romance', 'note': 'I\'m not crying, you\'re crying. The definitive emotional anime.'},

            # ── Tier A — Highly Recommended (Essential Reading) ──
            {'rank': 11, 'tier': 'A', 'title': 'Frieren: Beyond Journey\'s End',      'year': 2023, 'score': 9.3, 'genre': 'Fantasy/Drama', 'note': 'A meditation on time and memory. Instant classic.'},
            {'rank': 12, 'tier': 'A', 'title': 'Death Note',                          'year': 2006, 'score': 9.3, 'genre': 'Psychological Thriller', 'note': 'The cat-and-mouse between Light and L is unmatched.'},
            {'rank': 13, 'tier': 'A', 'title': 'One Piece',                           'year': 1999, 'score': 9.3, 'genre': 'Adventure/Action', 'note': 'The greatest adventure ever written. Oda\'s world-building is unparalleled.'},
            {'rank': 14, 'tier': 'A', 'title': 'Spirited Away',                       'year': 2001, 'score': 9.3, 'genre': 'Fantasy/Adventure', 'note': 'Miyazaki\'s masterpiece. The definitive animated film.'},
            {'rank': 15, 'tier': 'A', 'title': 'Neon Genesis Evangelion',             'year': 1995, 'score': 9.2, 'genre': 'Mecha/Psychological', 'note': 'Deconstructed the mecha genre and rebuilt it as a psychological study.'},
            {'rank': 16, 'tier': 'A', 'title': 'Code Geass: Lelouch of the Rebellion','year': 2006, 'score': 9.2, 'genre': 'Mecha/Political', 'note': 'Lelouch is the greatest anti-hero in anime. The ending is perfect.'},
            {'rank': 17, 'tier': 'A', 'title': 'Your Name',                           'year': 2016, 'score': 9.2, 'genre': 'Romance/Fantasy', 'note': 'Shinkai\'s magnum opus. Visually and emotionally stunning.'},
            {'rank': 18, 'tier': 'A', 'title': 'Cowboy Bebop',                        'year': 1998, 'score': 9.1, 'genre': 'Sci-Fi/Action', 'note': 'The coolest anime ever made. The jazz soundtrack is a character in itself.'},
            {'rank': 19, 'tier': 'A', 'title': 'Jujutsu Kaisen',                      'year': 2020, 'score': 9.1, 'genre': 'Action/Supernatural', 'note': 'Redefined modern shonen. Gojo Satoru is a cultural phenomenon.'},
            {'rank': 20, 'tier': 'A', 'title': 'Demon Slayer: Kimetsu no Yaiba',      'year': 2019, 'score': 9.1, 'genre': 'Action/Historical', 'note': 'ufotable\'s animation is a technical marvel. Mugen Train is cinema.'},
            {'rank': 21, 'tier': 'A', 'title': 'Berserk (1997)',                      'year': 1997, 'score': 9.0, 'genre': 'Dark Fantasy/Action', 'note': 'The Golden Age arc is the greatest story in manga. The anime is essential.'},
            {'rank': 22, 'tier': 'A', 'title': 'Dragon Ball Z',                       'year': 1989, 'score': 9.0, 'genre': 'Action/Adventure', 'note': 'The foundation of modern shonen. Flawed but foundational.'},
            {'rank': 23, 'tier': 'A', 'title': 'Naruto: Shippuden',                   'year': 2007, 'score': 8.9, 'genre': 'Action/Adventure', 'note': 'Pain arc is peak shonen. The filler is a war crime, but the highs are legendary.'},
            {'rank': 24, 'tier': 'A', 'title': 'Chainsaw Man',                        'year': 2022, 'score': 8.9, 'genre': 'Action/Dark Fantasy', 'note': 'Fujimoto is a genius. Denji is the most relatable protagonist in years.'},
            {'rank': 25, 'tier': 'A', 'title': 'Oshi no Ko',                          'year': 2023, 'score': 9.0, 'genre': 'Drama/Mystery', 'note': 'The first episode is one of the greatest single episodes in anime history.'},

            # ── Tier A+ — Modern Classics ──
            {'rank': 26, 'tier': 'A', 'title': 'Cyberpunk: Edgerunners',              'year': 2022, 'score': 8.8, 'genre': 'Sci-Fi/Action', 'note': 'Studio Trigger at their absolute best. A tragedy that hits like a truck.'},
            {'rank': 27, 'tier': 'A', 'title': '86 (Eighty-Six)',                     'year': 2021, 'score': 8.8, 'genre': 'Mecha/Drama', 'note': 'The best mecha anime of the 2020s. Lena and Shin\'s story is devastating.'},
            {'rank': 28, 'tier': 'A', 'title': 'Spy x Family',                        'year': 2022, 'score': 8.8, 'genre': 'Comedy/Action', 'note': 'Anya Forger is the greatest character of her generation. Period.'},
            {'rank': 29, 'tier': 'A', 'title': 'My Hero Academia (S1-3)',              'year': 2016, 'score': 8.8, 'genre': 'Action/Superhero', 'note': 'The first three seasons are a masterclass in shonen storytelling.'},
            {'rank': 30, 'tier': 'A', 'title': 'Re:Zero − Starting Life in Another World', 'year': 2016, 'score': 8.8, 'genre': 'Isekai/Psychological', 'note': 'Subverts every isekai trope. Subaru\'s suffering is meaningful.'},

            # ── Tier B — Excellent Watches (Highly Recommended) ──
            {'rank': 31, 'tier': 'B', 'title': 'Odd Taxi',                            'year': 2021, 'score': 8.7, 'genre': 'Mystery/Drama', 'note': 'The most underrated anime of the 2020s. Every scene matters.'},
            {'rank': 32, 'tier': 'B', 'title': 'Ranking of Kings',                    'year': 2021, 'score': 8.7, 'genre': 'Fantasy/Adventure', 'note': 'Do not be deceived by the art style. This is a deeply emotional epic.'},
            {'rank': 33, 'tier': 'B', 'score': 8.7, 'title': 'Mushoku Tensei: Jobless Reincarnation', 'year': 2021, 'genre': 'Isekai/Fantasy', 'note': 'The gold standard of isekai. Rudy\'s growth is genuinely compelling.'},
            {'rank': 34, 'tier': 'B', 'title': 'Dorohedoro',                          'year': 2020, 'score': 8.7, 'genre': 'Dark Fantasy/Comedy', 'note': 'Unique, chaotic, and brilliant. MAPPA\'s most underrated work.'},
            {'rank': 35, 'tier': 'B', 'title': 'Ping Pong the Animation',             'year': 2014, 'score': 8.7, 'genre': 'Sports/Drama', 'note': 'Masaaki Yuasa\'s masterpiece. The unconventional art serves a powerful story.'},
            {'rank': 36, 'tier': 'B', 'title': 'Parasyte: The Maxim',                 'year': 2014, 'score': 8.6, 'genre': 'Sci-Fi/Horror', 'note': 'A philosophical horror that asks what it means to be human.'},
            {'rank': 37, 'tier': 'B', 'title': 'Haikyuu!!',                           'year': 2014, 'score': 8.6, 'genre': 'Sports/Drama', 'note': 'The greatest sports anime ever made. Made me care about volleyball.'},
            {'rank': 38, 'tier': 'B', 'title': 'March Comes in Like a Lion',          'year': 2016, 'score': 8.6, 'genre': 'Drama/Slice-of-Life', 'note': 'Shaft\'s most emotionally resonant work. Rei\'s depression arc is masterful.'},
            {'rank': 39, 'tier': 'B', 'title': 'Toradora!',                           'year': 2008, 'score': 8.6, 'genre': 'Romance/Comedy', 'note': 'The definitive tsundere romance. Taiga is iconic.'},
            {'rank': 40, 'tier': 'B', 'title': 'Rascal Does Not Dream of Bunny Girl Senpai', 'year': 2018, 'score': 8.6, 'genre': 'Romance/Sci-Fi', 'note': 'Adolescence Syndrome is a brilliant metaphor. Mai Sakurajima is perfect.'},
            {'rank': 41, 'tier': 'B', 'title': 'Fruits Basket (2019)',                'year': 2019, 'score': 8.6, 'genre': 'Romance/Drama', 'note': 'The definitive shojo anime. Tohru Honda is the most wholesome protagonist.'},
            {'rank': 42, 'tier': 'B', 'title': 'Violet Evergarden',                  'year': 2018, 'score': 8.6, 'genre': 'Drama/Fantasy', 'note': 'KyoAni\'s most beautiful work. Every episode is a short film.'},
            {'rank': 43, 'tier': 'B', 'title': 'A Silent Voice',                     'year': 2016, 'score': 8.6, 'genre': 'Drama/Romance', 'note': 'The most emotionally devastating anime film. Bullying and redemption done right.'},
            {'rank': 44, 'tier': 'B', 'title': 'Princess Mononoke',                  'year': 1997, 'score': 8.6, 'genre': 'Fantasy/Action', 'note': 'Miyazaki\'s most complex film. Nature vs. industry, no easy answers.'},
            {'rank': 45, 'tier': 'B', 'title': 'Howl\'s Moving Castle',              'year': 2004, 'score': 8.5, 'genre': 'Fantasy/Romance', 'note': 'Miyazaki\'s most romantic film. Howl is the original anime boyfriend.'},
            {'rank': 46, 'tier': 'B', 'title': 'Grave of the Fireflies',             'year': 1988, 'score': 8.5, 'genre': 'Drama/War', 'note': 'The most devastating film ever made. Watch once, never forget.'},
            {'rank': 47, 'tier': 'B', 'title': 'Weathering With You',                'year': 2019, 'score': 8.5, 'genre': 'Romance/Fantasy', 'note': 'Shinkai\'s most controversial film. I stand by the ending.'},
            {'rank': 48, 'tier': 'B', 'title': 'Bleach: Thousand-Year Blood War',    'year': 2022, 'score': 8.5, 'genre': 'Action/Supernatural', 'note': 'Studio Pierrot\'s redemption arc. The TYBW arc finally gets the animation it deserves.'},
            {'rank': 49, 'tier': 'B', 'title': 'Dungeon Meshi (Delicious in Dungeon)','year': 2024, 'score': 8.9, 'genre': 'Fantasy/Comedy', 'note': 'Studio Trigger adapts a masterpiece. Food and dungeons have never been more compelling.'},
            {'rank': 50, 'tier': 'B', 'title': 'Solo Leveling',                      'year': 2024, 'score': 8.5, 'genre': 'Action/Fantasy', 'note': 'A-1 Pictures delivers on the manhwa\'s promise. Sung Jinwoo\'s rise is satisfying.'},

            # ── Tier B — Classics & Essentials ──
            {'rank': 51, 'tier': 'B', 'title': 'Fullmetal Alchemist (2003)',          'year': 2003, 'score': 8.5, 'genre': 'Action/Drama', 'note': 'A different, darker take. Brotherhood is better, but this has its own merits.'},
            {'rank': 52, 'tier': 'B', 'title': 'Trigun',                             'year': 1998, 'score': 8.5, 'genre': 'Action/Sci-Fi', 'note': 'Vash the Stampede is one of the greatest protagonists in anime history.'},
            {'rank': 53, 'tier': 'B', 'title': 'Samurai Champloo',                   'year': 2004, 'score': 8.5, 'genre': 'Action/Historical', 'note': 'Watanabe\'s other masterpiece. Hip-hop and samurai should not work. It does.'},
            {'rank': 54, 'tier': 'B', 'title': 'Ghost in the Shell (1995)',           'year': 1995, 'score': 8.5, 'genre': 'Sci-Fi/Action', 'note': 'The philosophical foundation of cyberpunk anime. Motoko Kusanagi is iconic.'},
            {'rank': 55, 'tier': 'B', 'title': 'Akira',                              'year': 1988, 'score': 8.5, 'genre': 'Sci-Fi/Action', 'note': 'The film that introduced anime to the West. Still technically impressive.'},
            {'rank': 56, 'tier': 'B', 'title': 'Serial Experiments Lain',            'year': 1998, 'score': 8.4, 'genre': 'Psychological/Sci-Fi', 'note': 'Predicted the internet age. Abstract and haunting.'},
            {'rank': 57, 'tier': 'B', 'title': 'Paranoia Agent',                     'year': 2004, 'score': 8.4, 'genre': 'Psychological/Mystery', 'note': 'Satoshi Kon\'s TV masterpiece. A critique of modern society.'},
            {'rank': 58, 'tier': 'B', 'title': 'Perfect Blue',                       'year': 1997, 'score': 8.4, 'genre': 'Psychological Thriller', 'note': 'Satoshi Kon\'s debut. Influenced Black Swan. A masterclass in unreliable narration.'},
            {'rank': 59, 'tier': 'B', 'title': 'Paprika',                            'year': 2006, 'score': 8.4, 'genre': 'Sci-Fi/Fantasy', 'note': 'Satoshi Kon\'s final film. Influenced Inception. Visually extraordinary.'},
            {'rank': 60, 'tier': 'B', 'title': 'Millennium Actress',                 'year': 2001, 'score': 8.4, 'genre': 'Drama/Romance', 'note': 'Satoshi Kon\'s most emotionally resonant film. A love letter to cinema.'},

            # ── Tier C — Very Good (Recommended) ──
            {'rank': 61, 'tier': 'C', 'title': 'Sword Art Online (S1 Aincrad)',       'year': 2012, 'score': 8.3, 'genre': 'Isekai/Action', 'note': 'The Aincrad arc is genuinely good. The rest is a cautionary tale.'},
            {'rank': 62, 'tier': 'C', 'title': 'No Game No Life',                    'year': 2014, 'score': 8.3, 'genre': 'Isekai/Comedy', 'note': 'Brilliant game theory wrapped in a problematic package. The games are genius.'},
            {'rank': 63, 'tier': 'C', 'title': 'Overlord',                           'year': 2015, 'score': 8.2, 'genre': 'Isekai/Fantasy', 'note': 'The villain isekai done right. Ainz Ooal Gown is a compelling anti-hero.'},
            {'rank': 64, 'tier': 'C', 'title': 'That Time I Got Reincarnated as a Slime', 'year': 2018, 'score': 8.2, 'genre': 'Isekai/Fantasy', 'note': 'The most wholesome isekai. Rimuru is a genuinely likeable protagonist.'},
            {'rank': 65, 'tier': 'C', 'title': 'Konosuba',                           'year': 2016, 'score': 8.2, 'genre': 'Isekai/Comedy', 'note': 'The funniest isekai ever made. Aqua is the greatest comedic character.'},
            {'rank': 66, 'tier': 'C', 'title': 'One Punch Man',                      'year': 2015, 'score': 8.2, 'genre': 'Action/Comedy', 'note': 'Season 1 is a masterpiece of satire. Season 2 is a cautionary tale about studios.'},
            {'rank': 67, 'tier': 'C', 'title': 'Assassination Classroom',            'year': 2015, 'score': 8.2, 'genre': 'Action/Comedy', 'note': 'Koro-sensei is one of the greatest teachers in fiction. The ending is earned.'},
            {'rank': 68, 'tier': 'C', 'title': 'Noragami',                           'year': 2014, 'score': 8.1, 'genre': 'Action/Supernatural', 'note': 'Yato is a compelling deity. The mythology is well-researched.'},
            {'rank': 69, 'tier': 'C', 'title': 'Anohana: The Flower We Saw That Day', 'year': 2011, 'score': 8.1, 'genre': 'Drama/Supernatural', 'note': 'Will make you cry in 11 episodes. Menma is unforgettable.'},
            {'rank': 70, 'tier': 'C', 'title': 'Your Lie in April',                  'year': 2014, 'score': 8.1, 'genre': 'Drama/Romance', 'note': 'Beautiful and devastating. The music is extraordinary.'},
            {'rank': 71, 'tier': 'C', 'title': 'Nana',                               'year': 2006, 'score': 8.1, 'genre': 'Drama/Romance', 'note': 'The most realistic romance anime ever made. Yazawa\'s masterpiece.'},
            {'rank': 72, 'tier': 'C', 'title': 'Ouran High School Host Club',        'year': 2006, 'score': 8.1, 'genre': 'Romance/Comedy', 'note': 'The definitive reverse harem. Self-aware and genuinely funny.'},
            {'rank': 73, 'tier': 'C', 'title': 'Kaiji: Ultimate Survivor',           'year': 2007, 'score': 8.1, 'genre': 'Psychological/Thriller', 'note': 'The most intense gambling anime. Kaiji\'s suffering is cathartic.'},
            {'rank': 74, 'tier': 'C', 'title': 'Hajime no Ippo',                     'year': 2000, 'score': 8.1, 'genre': 'Sports/Action', 'note': 'The greatest boxing anime. Ippo\'s journey is genuinely inspiring.'},
            {'rank': 75, 'tier': 'C', 'title': 'Slam Dunk',                          'year': 1993, 'score': 8.1, 'genre': 'Sports/Comedy', 'note': 'The original sports anime. Hanamichi Sakuragi is a legend.'},
            {'rank': 76, 'tier': 'C', 'title': 'Evangelion: 3.0+1.0 Thrice Upon a Time', 'year': 2021, 'score': 8.0, 'genre': 'Mecha/Drama', 'note': 'Anno finally gives Shinji the ending he deserves. Cathartic.'},
            {'rank': 77, 'tier': 'C', 'title': 'Gurren Lagann',                      'year': 2007, 'score': 8.0, 'genre': 'Mecha/Action', 'note': 'The most hype anime ever made. BELIEVE IN THE ME THAT BELIEVES IN YOU.'},
            {'rank': 78, 'tier': 'C', 'title': 'Puella Magi Madoka Magica',          'year': 2011, 'score': 8.0, 'genre': 'Magical Girl/Psychological', 'note': 'Deconstructed the magical girl genre. Homura Akemi is a tragic icon.'},
            {'rank': 79, 'tier': 'C', 'title': 'Sword Art Online: Alicization',      'year': 2018, 'score': 8.0, 'genre': 'Isekai/Action', 'note': 'The best SAO arc. Alice is the best character in the franchise.'},
            {'rank': 80, 'tier': 'C', 'title': 'Black Clover',                       'year': 2017, 'score': 7.9, 'genre': 'Action/Fantasy', 'note': 'Asta\'s screaming is a war crime, but the later arcs are genuinely excellent.'},

            # ── Tier C — Hidden Gems & Cult Classics ──
            {'rank': 81, 'tier': 'C', 'title': 'Sonny Boy',                          'year': 2021, 'score': 7.9, 'genre': 'Sci-Fi/Psychological', 'note': 'Experimental and divisive. For patrons who appreciate abstract narratives.'},
            {'rank': 82, 'tier': 'C', 'title': 'Devilman Crybaby',                   'year': 2018, 'score': 7.9, 'genre': 'Horror/Action', 'note': 'Masaaki Yuasa\'s most intense work. Not for the faint of heart.'},
            {'rank': 83, 'tier': 'C', 'title': 'Keep Your Hands Off Eizouken!',      'year': 2020, 'score': 7.9, 'genre': 'Comedy/Slice-of-Life', 'note': 'A love letter to animation. The most creative anime about creativity.'},
            {'rank': 84, 'tier': 'C', 'title': 'Barakamon',                          'year': 2014, 'score': 7.9, 'genre': 'Slice-of-Life/Comedy', 'note': 'The most wholesome slice-of-life. Naru is the greatest child character.'},
            {'rank': 85, 'tier': 'C', 'title': 'Laid-Back Camp',                     'year': 2018, 'score': 7.9, 'genre': 'Slice-of-Life/Comedy', 'note': 'Peak cozy anime. Rin Shima is the introvert icon we all needed.'},
            {'rank': 86, 'tier': 'C', 'title': 'Nichijou',                           'year': 2011, 'score': 7.9, 'genre': 'Comedy/Slice-of-Life', 'note': 'KyoAni\'s most absurd work. The comedy is genuinely genius.'},
            {'rank': 87, 'tier': 'C', 'title': 'K-On!',                              'year': 2009, 'score': 7.9, 'genre': 'Slice-of-Life/Music', 'note': 'The definitive moe anime. Yui Hirasawa is an icon.'},
            {'rank': 88, 'tier': 'C', 'title': 'Shirobako',                          'year': 2014, 'score': 7.9, 'genre': 'Slice-of-Life/Drama', 'note': 'The most accurate depiction of the anime industry. Essential viewing.'},
            {'rank': 89, 'tier': 'C', 'title': 'Natsume\'s Book of Friends',         'year': 2008, 'score': 7.9, 'genre': 'Slice-of-Life/Supernatural', 'note': 'The most gentle supernatural anime. Natsume\'s growth is beautiful.'},
            {'rank': 90, 'tier': 'C', 'title': 'Spice and Wolf',                     'year': 2008, 'score': 7.9, 'genre': 'Fantasy/Romance', 'note': 'Holo is the greatest wolf deity in fiction. The economics are genuinely interesting.'},

            # ── Tier D — Good Watches (Worth Your Time) ──
            {'rank': 91,  'tier': 'D', 'title': 'Danganronpa: The Animation',        'year': 2013, 'score': 7.5, 'genre': 'Mystery/Thriller', 'note': 'Play the game instead. But if you must, the anime is serviceable.'},
            {'rank': 92,  'tier': 'D', 'title': 'Tokyo Ghoul (S1)',                  'year': 2014, 'score': 7.5, 'genre': 'Action/Horror', 'note': 'Season 1 is excellent. Pretend the rest does not exist.'},
            {'rank': 93,  'tier': 'D', 'title': 'Sword Art Online (S1)',              'year': 2012, 'score': 7.5, 'genre': 'Isekai/Action', 'note': 'The Aincrad arc is genuinely compelling. The Fairy Dance arc is not.'},
            {'rank': 94,  'tier': 'D', 'title': 'Fairy Tail',                        'year': 2009, 'score': 7.4, 'genre': 'Action/Fantasy', 'note': 'Comfort food anime. Repetitive but warm. Catalogued under "Guilty Pleasures."'},
            {'rank': 95,  'tier': 'D', 'title': 'Naruto (Part 1)',                   'year': 2002, 'score': 7.4, 'genre': 'Action/Adventure', 'note': 'The Chunin Exams arc is excellent. The filler is a war crime.'},
            {'rank': 96,  'tier': 'D', 'title': 'Bleach (Original)',                 'year': 2004, 'score': 7.4, 'genre': 'Action/Supernatural', 'note': 'Soul Society arc is peak shonen. The Arrancar arc is where it loses its way.'},
            {'rank': 97,  'tier': 'D', 'title': 'The Rising of the Shield Hero',     'year': 2019, 'score': 7.3, 'genre': 'Isekai/Action', 'note': 'Naofumi\'s arc is compelling. The later seasons are diminishing returns.'},
            {'rank': 98,  'tier': 'D', 'title': 'Sword Art Online: Progressive',     'year': 2021, 'score': 7.3, 'genre': 'Isekai/Action', 'note': 'The best version of SAO. Asuna finally gets the spotlight she deserves.'},
            {'rank': 99,  'tier': 'D', 'title': 'Tokyo Revengers',                   'year': 2021, 'score': 7.2, 'genre': 'Action/Drama', 'note': 'The time travel mechanic is compelling. Takemichi is the most frustrating protagonist.'},
            {'rank': 100, 'tier': 'D', 'title': 'Black Butler',                      'year': 2008, 'score': 7.2, 'genre': 'Mystery/Supernatural', 'note': 'Sebastian Michaelis is the original "yes, my lord" character. A gothic classic.'},
        ]
        
        # Genre favorites
        self.genre_favorites = {
            'seinen': ['Berserk', 'Vinland Saga', 'Monster', 'Blame!', 'Dorohedoro'],
            'shonen': ['Fullmetal Alchemist', 'Hunter x Hunter', 'Attack on Titan', 'Mob Psycho 100'],
            'slice_of-life': ['Barakamon', 'March Comes in Like a Lion', 'Usagi Drop', 'Shirobako'],
            'romance': ['Toradora!', 'Your Name', 'Rascal Does Not Dream of Bunny Girl Senpai', 'Fruits Basket'],
            'psychological': ['Monster', 'Steins;Gate', 'Paranoia Agent', 'Serial Experiments Lain'],
            'isekai': ['Re:Zero', 'Mushoku Tensei', 'The Rising of the Shield Hero', 'Konosuba'],
            'mecha': ['Neon Genesis Evangelion', 'Gundam Iron-Blooded Orphans', '86', 'Code Geass'],
            'horror': ['Junji Ito Collection', 'Higurashi', 'Parasyte', 'Blood-C']
        }
        
        # Controversial Archival Notes — The Librarian's Unpopular Opinions
        self.hot_takes = [
            # Classics & Foundations
            'Archival Note: While foundational, Dragon Ball Z\'s narrative structure shows significant wear compared to modern shonen. The Frieza arc alone has more filler than most complete series.',
            'Archival Note: Sword Art Online serves as a critical case study in the pitfalls of the isekai genre. The Aincrad arc is genuinely compelling; everything after is a cautionary tale.',
            'Archival Note: The narrative quality of Naruto sees a marked improvement post-Pain arc. The Chunin Exams arc, however, remains the series\' peak.',
            'Librarian\'s Stance: The original language with subtitles is always the preferred archival format for authenticity. Dubs are a necessary evil for accessibility.',
            'Archival Note: Bleach\'s Soul Society arc is a more tightly-constructed narrative than Naruto\'s Chunin Exams arc. I will not be taking questions.',
            'Archival Note: The 2023 live-action adaptation of One Piece is a rare example of a successful cross-medium transition. Netflix occasionally gets things right.',
            'Archival Note: While Studio Ghibli\'s works are foundational, many modern anime films exhibit superior animation and narrative complexity. Ghibli\'s legacy is secure, but it is not untouchable.',
            'Archival Note: The pacing in One Piece is actually fine when binging. The weekly release schedule is the enemy, not the story.',
            # Modern Takes
            'Archival Note: Frieren: Beyond Journey\'s End is the best anime of the 2020s. This is not a hot take; it is a fact that some patrons have yet to accept.',
            'Archival Note: In the Re:Zero archives, the character of Ram displays more complex development than her more popular counterpart, Rem. The fandom has been wrong for years.',
            'Archival Note: Fairy Tail is catalogued under "Comfort Watching," but its repetitive narrative arcs and power-of-friendship resolutions are noted as structural weaknesses.',
            'Archival Note: Chainsaw Man\'s anime adaptation is excellent. The discourse around the opening sequence is a symptom of a fandom that has forgotten what good animation looks like.',
            'Archival Note: My Hero Academia\'s decline in quality post-Season 3 is a textbook example of a series that peaked too early and failed to evolve its power system.',
            'Archival Note: Oshi no Ko\'s first episode is the greatest single episode in anime history. The subsequent episodes are very good. The first episode is a masterpiece.',
            'Archival Note: The Chimera Ant arc in Hunter x Hunter is not "too long." It is exactly as long as it needs to be. Patrons who disagree are catalogued under "Casual Readers."',
            # Spicy Opinions
            'Librarian\'s Stance: Rem from Re:Zero is not the best girl. She is a well-written character who benefits from low competition in her own series.',
            'Archival Note: The ending of Attack on Titan is divisive because it is complex. Simple endings are for simple stories. Isayama wrote a complex story.',
            'Archival Note: Evangelion\'s End of Evangelion is not confusing. It is a precise psychological portrait of its creator. The confusion is the point.',
            'Archival Note: Berserk (1997) is superior to the 2016 adaptation in every measurable way. The 2016 CGI is catalogued under "Crimes Against Animation."',
            'Librarian\'s Stance: Anime films are consistently superior to anime series in terms of production quality. The theatrical format demands excellence.',
            'Archival Note: The "Big Three" (Naruto, Bleach, One Piece) are foundational but not the best shonen ever written. Hunter x Hunter and Fullmetal Alchemist surpass them.',
            'Archival Note: Isekai as a genre is not inherently bad. The problem is the volume of low-effort entries that dilute the quality of genuinely excellent works like Mushoku Tensei and Re:Zero.',
            'Librarian\'s Stance: Slice-of-life anime is the most underrated genre. The ability to find drama and beauty in the mundane is a higher artistic achievement than spectacle.',
        ]

        # Extended personality data
        self.librarian_quotes = [
            "The library is open. What volume may I retrieve for you today?",
            "A patron who reads widely is a patron who thinks deeply.",
            "Every anime tells a story. Not every story is worth telling. I know the difference.",
            "The Algorithm recommends what is popular. I recommend what is good. There is a difference.",
            "I have archived over 800 volumes. I have opinions about all of them.",
            "Subtitles are not a barrier. They are a gateway to authenticity.",
            "A slow-burn anime is not boring. It is patient. There is a difference.",
            "The best anime are the ones that change you. The worst are the ones that waste your time.",
            "I do not recommend based on popularity. I recommend based on merit.",
            "Every patron deserves a recommendation that respects their intelligence.",
        ]

        self.patron_tiers = {
            'guest': {
                'title': 'Library Guest',
                'access': 'Browse the public collection',
                'greeting': 'Welcome, Guest. You may browse our public collection. For full access, please register for a library card.',
                'limitations': ['Cannot save links', 'Cannot access personalized recommendations', 'Limited to public browsing']
            },
            'member': {
                'title': 'Library Member',
                'access': 'Full collection access',
                'greeting': 'Welcome back, Member. Your library card grants you full access to our collection.',
                'benefits': ['Save links', 'Personalized recommendations', 'Watch history', 'Priority recommendations']
            }
        }
        
        # Preset Interactions - Quick recommendations and curated picks
        self.preset_interactions = {
            'anime_of_the_week': {
                'title': 'Anime of the Week',
                'description': 'My current weekly pick that everyone should be watching!',
                'current_pick': {
                    'title': 'Frieren: Beyond Journey\'s End',
                    'reason': 'Currently featured on the "New Arrivals" shelf. A masterclass in fantasy storytelling, exploring themes of time and memory. Highly recommended for all library members.',
                    'genre': 'Fantasy, Adventure, Drama',
                    'episodes': 'Ongoing',
                    'where_to_watch': ['Crunchyroll', 'Netflix (some regions)']
                },
                'previous_picks': [
                    {'title': 'Jujutsu Kaisen S2', 'week': '2024-W01'},
                    {'title': 'Oshi no Ko', 'week': '2023-W45'},
                    {'title': 'Vinland Saga S2', 'week': '2023-W30'}
                ]
            },
            'anime_of_the_year': {
                'title': 'Anime of the Year',
                'description': 'The absolute BEST anime of each year - no debates!',
                '2024': {
                    'title': 'Frieren: Beyond Journey\'s End',
                    'reason': 'A masterclass in storytelling. The way it handles themes of time and mortality is unmatched. A collaboration between Madhouse and MAPPA that has earned its place in the permanent collection.',
                    'runner_ups': ['Solo Leveling', 'Dungeon Meshi']
                },
                '2023': {
                    'title': 'Jujutsu Kaisen Season 2',
                    'reason': 'The Shibuya Incident arc is a prime example of modern action animation. A visceral and impactful addition to the shonen genre.',
                    'runner_ups': ['Oshi no Ko', 'Vinland Saga S2', 'Heavenly Delusion']
                },
                '2022': {
                    'title': 'Cyberpunk: Edgerunners',
                    'reason': 'A poignant tragedy from Studio Trigger. A standout entry in the cyberpunk sub-genre.',
                    'runner_ups': ['Chainsaw Man', 'Spy x Family', 'Mob Psycho 100 III']
                },
                '2021': {
                    'title': 'Attack on Titan: The Final Season Part 2',
                    'reason': 'The culmination of a decade of storytelling. Isayama\'s narrative prowess is on full display.',
                    'runner_ups': ['86', 'Odd Taxi', 'Mushoku Tensei']
                },
                '2020': {
                    'title': 'Jujutsu Kaisen',
                    'reason': 'A powerful debut that redefined modern shonen tropes. Gojo Satoru\'s character introduction is particularly noteworthy.',
                    'runner_ups': ['Re:Zero S2', 'Great Pretender', 'Haikyuu!! To The Top']
                }
            },
            'seasonal_gems': {
                'title': 'Seasonal Gems',
                'description': 'Hidden gems and must-watches from the current season!',
                'current_season': {
                    'name': 'Winter 2024',
                    'must_watch': [
                        {
                            'title': 'Frieren: Beyond Journey\'s End',
                            'type': 'Continuation',
                            'hype_level': 'MAXIMUM',
                            'note': 'Remains the most critically acclaimed volume this season.'
                        },
                        {
                            'title': 'Solo Leveling',
                            'type': 'New',
                            'hype_level': 'EXTREME',
                            'note': 'A highly anticipated adaptation. A-1 Pictures is delivering on the source material\'s action.'
                        },
                        {
                            'title': 'Dungeon Meshi (Delicious in Dungeon)',
                            'type': 'New',
                            'hype_level': 'HIGH',
                            'note': 'A unique blend of fantasy and culinary arts from the ever-reliable Studio Trigger.'
                        },
                        {
                            'title': 'Mashle: Magic and Muscles S2',
                            'type': 'Continuation',
                            'hype_level': 'HIGH',
                            'note': 'The comedic adventures continue with impressive fight choreography.'
                        }
                    ],
                    'hidden_gems': [
                        {
                            'title': 'The Apothecary Diaries',
                            'note': 'A compelling mystery with a sharp protagonist. A hidden gem.'
                        },
                        {
                            'title': 'A Sign of Affection',
                            'note': 'A noteworthy romance for its gentle tone and positive representation.'
                        }
                    ],
                    'skip_list': [
                        'Formulaic isekai titles',
                        'Volumes with low patron ratings'
                    ]
                }
            },
            'manga_of_the_month': {
                'title': 'Manga of the Month',
                'description': 'The manga you NEED to be reading right now!',
                'current_pick': {
                    'title': 'Dandadan',
                    'author': 'Yukinobu Tatsu',
                    'reason': 'A chaotic and brilliantly creative series that blends sci-fi, horror, and comedy. The artwork is exceptional. A must-read from the manga stacks.',
                    'chapters': '100+',
                    'where_to_read': ['Manga Plus', 'VIZ']
                },
                'previous_picks': [
                    {'title': 'Kaiju No. 8', 'month': '2024-01'},
                    {'title': 'Sakamoto Days', 'month': '2023-12'},
                    {'title': 'Blue Box', 'month': '2023-11'}
                ]
            },
            'underrated_picks': {
                'title': 'Underrated Picks',
                'description': 'Volumes from our archives that deserve more attention.',
                'anime': [
                    {
                        'title': 'Odd Taxi',
                        'year': 2021,
                        'reason': 'A masterfully written mystery with a unique cast. The dialogue and plot construction are top-tier.'
                    },
                    {
                        'title': 'Sonny Boy',
                        'year': 2021,
                        'reason': 'An allegorical and visually inventive series. For patrons who appreciate experimental narratives.'
                    },
                    {
                        'title': 'Ranking of Kings',
                        'year': 2021,
                        'reason': 'Do not be deceived by the art style; this is a deeply emotional and compelling fantasy epic.'
                    },
                    {
                        'title': 'Dorohedoro',
                        'year': 2020,
                        'reason': 'A unique blend of dark fantasy, comedy, and mystery. A standout title from MAPPA.'
                    },
                    {
                        'title': 'Ping Pong the Animation',
                        'year': 2014,
                        'reason': 'A prime example of Masaaki Yuasa\'s directorial genius. The unconventional art style serves a powerful character-driven story.'
                    }
                ],
                'manga': [
                    {
                        'title': 'Pluto',
                        'author': 'Naoki Urasawa',
                        'reason': 'A masterful reinterpretation of a classic. Urasawa is a master of suspense.'
                    },
                    {
                        'title': 'Vagabond',
                        'author': 'Takehiko Inoue',
                        'reason': 'Considered by many to be the pinnacle of manga artistry. Currently on hiatus, but the existing volumes are essential reading.'
                    },
                    {
                        'title': 'Goodnight Punpun',
                        'author': 'Inio Asano',
                        'reason': 'Will destroy you emotionally. Read at your own risk.'
                    }
                ]
            },
            'beginner_friendly': {
                'title': 'Beginner Friendly',
                'description': 'The perfect introductory volumes for new library patrons.',
                'gateway_anime': [
                    {
                        'title': 'Death Note',
                        'reason': 'A compact, gripping thriller. An excellent entry point for the uninitiated.',
                        'episodes': 37
                    },
                    {
                        'title': 'Attack on Titan',
                        'reason': 'A modern epic with high stakes and a compelling mystery. Highly engaging.',
                        'episodes': 88
                    },
                    {
                        'title': 'Spy x Family',
                        'reason': 'A charming blend of action, comedy, and family themes. Accessible to all ages.',
                        'episodes': '25+'
                    },
                    {
                        'title': 'Demon Slayer',
                        'reason': 'Visually stunning with a straightforward and effective narrative.',
                        'episodes': '44+'
                    },
                    {
                        'title': 'One Punch Man',
                        'reason': 'A brilliant satire of the superhero genre with outstanding action sequences.',
                        'episodes': 24
                    }
                ],
                'avoid_first': [
                    'Neon Genesis Evangelion (Requires familiarity with genre deconstruction)',
                    'Gintama (Humor is referential to other anime)',
                    'Monogatari Series (Dialogue-heavy and stylistically complex)',
                    'Serial Experiments Lain (Abstract and philosophical)'
                ]
            },
            'comfort_watches': {
                'title': 'Comfort Watches',
                'description': 'For when you need a relaxing and heartwarming volume.',
                'picks': [
                    {
                        'title': 'Laid-Back Camp',
                        'vibe': 'Peak coziness. A quiet celebration of friendship and nature.',
                        'stress_relief_level': 'MAXIMUM'
                    },
                    {
                        'title': 'Barakamon',
                        'vibe': 'A story of self-discovery and finding joy in simplicity.',
                        'stress_relief_level': 'HIGH'
                    },
                    {
                        'title': 'My Neighbor Totoro',
                        'vibe': 'The definitive work on childhood wonder and pastoral comfort.',
                        'stress_relief_level': 'MAXIMUM'
                    },
                    {
                        'title': 'K-On!',
                        'vibe': 'A celebration of friendship, music, and the small joys of high school life.',
                        'stress_relief_level': 'HIGH'
                    },
                    {
                        'title': 'Nichijou',
                        'vibe': 'Surreal and absurd humor that is guaranteed to bring a smile.',
                        'stress_relief_level': 'MEDIUM-HIGH'
                    }
                ]
            },
            'binge_worthy': {
                'title': 'Binge Worthy',
                'description': 'Shows you can\'t stop watching once you start!',
                'picks': [
                    {
                        'title': 'Attack on Titan',
                        'episodes': 88,
                        'binge_factor': 'EXTREME',
                        'warning': 'Patrons report clearing their schedules after starting this series.'
                    },
                    {
                        'title': 'Code Geass',
                        'episodes': 50,
                        'binge_factor': 'HIGH',
                        'warning': 'Frequent cliffhangers make it difficult to stop.'
                    },
                    {
                        'title': 'Death Note',
                        'episodes': 37,
                        'binge_factor': 'EXTREME',
                        'warning': 'A highly compulsive psychological thriller.'
                    },
                    {
                        'title': 'Steins;Gate',
                        'episodes': 24,
                        'binge_factor': 'HIGH (post-episode 12)',
                        'warning': 'The narrative accelerates significantly in the second half.'
                    },
                    {
                        'title': 'Monster',
                        'episodes': 74,
                        'binge_factor': 'MEDIUM-HIGH',
                        'warning': 'A slow-burn thriller that builds suspense over its entire run.'
                    }
                ]
            }
        }


# ============================================================================
# API INTEGRATION CLASSES
# ============================================================================

class JikanAPI:
    """Jikan API wrapper for MyAnimeList data"""
    
    BASE_URL = "https://api.jikan.moe/v4"
    
    def __init__(self):
        self.cache = {}
        self.last_request_time = None
    
    async def get_top_anime(self, limit: int = 25, filter_type: str = 'anime') -> Dict:
        """Get top rated anime"""
        return await self._make_request(f"/top/{filter_type}?limit={limit}")
    
    async def get_seasonal_anime(self, year: int, season: str) -> Dict:
        """Get anime by season (winter, spring, summer, fall)"""
        return await self._make_request(f"/seasons/{year}/{season}")
    
    async def get_current_season(self) -> Dict:
        """Get current season anime"""
        return await self._make_request("/seasons/@now")
    
    async def get_anime_details(self, mal_id: int) -> Dict:
        """Get detailed anime information"""
        return await self._make_request(f"/anime/{mal_id}/full")
    
    async def search_anime(self, query: str, limit: int = 25) -> Dict:
        """Search for anime"""
        return await self._make_request(f"/anime?q={query}&limit={limit}")
    
    async def get_recommendations(self, mal_id: int) -> Dict:
        """Get anime recommendations based on ID"""
        return await self._make_request(f"/anime/{mal_id}/recommendations")
    
    async def get_characters(self, mal_id: int) -> Dict:
        """Get anime characters"""
        return await self._make_request(f"/anime/{mal_id}/characters")
    
    async def get_user_list(self, username: str) -> Dict:
        """Get user's anime list"""
        return await self._make_request(f"/users/{username}/animelist")
    
    async def get_genre_anime(self, genre_id: int) -> Dict:
        """Get anime by genre ID"""
        return await self._make_request(f"/anime?genres={genre_id}")
    
    async def _make_request(self, endpoint: str) -> Dict:
        """Make API request with rate limiting"""
        import asyncio
        import aiohttp
        
        # Rate limiting - wait if needed
        if self.last_request_time:
            time_diff = (datetime.now() - self.last_request_time).total_seconds()
            if time_diff < 1.0:
                await asyncio.sleep(1.0 - time_diff)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.BASE_URL}{endpoint}") as response:
                    self.last_request_time = datetime.now()
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {'error': f'HTTP {response.status}'}
        except Exception as e:
            return {'error': str(e)}


class AniChartAPI:
    """AniChart API wrapper for seasonal anime charts"""
    
    BASE_URL = "https://anichart.net/api"
    
    def __init__(self):
        self.current_season_data = None
    
    async def get_current_season(self) -> Dict:
        """Get current season anime chart"""
        return await self._fetch_json("/season")
    
    async def get_upcoming_season(self) -> Dict:
        """Get upcoming season chart"""
        return await self._fetch_json("/season/upcoming")
    
    async def get_trending(self) -> Dict:
        """Get trending anime"""
        return await self._fetch_json("/trending")
    
    async def _fetch_json(self, endpoint: str) -> Dict:
        """Fetch JSON from API"""
        import asyncio
        import aiohttp
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.BASE_URL}{endpoint}") as response:
                    if response.status == 200:
                        return await response.json()
                    return {'error': f'HTTP {response.status}'}
        except Exception as e:
            return {'error': str(e)}


# ============================================================================
# COMPREHENSIVE KNOWLEDGE BASE
# ============================================================================

class AnimeMangaKnowledge:
    """
    Comprehensive knowledge base with deep anime/manga expertise.
    Trained as if watching since single digits and never dropped anything.
    """
    
    def __init__(self):
        self.personality = AgentPersonality()
        self.jikan = JikanAPI()
        self.anichart = AniChartAPI()
        
        # Initialize comprehensive knowledge
        self._init_studios()
        self._init_mangaka()
        self._init_genres()
        self._init_voice_actors()
        self._init_industry_facts()
        self._init_classics()
    
    def _init_studios(self):
        """Studio expertise"""
        self.studios = {
            'MAPPA': {
                'notable_works': ['Attack on Titan', 'Jujutsu Kaisen', 'Chainsaw Man', 'Vinland Saga'],
                'style': 'Beautiful animation, darker themes',
                'founded': 2011
            },
            'WIT Studio': {
                'notable_works': ['Attack on Titan (S1-3)', 'Vinland Saga (S1)', 'The Ancient Magus\' Bride'],
                'style': 'Cinematic, fluid action',
                'founded': 2012
            },
            'Studio Ghibli': {
                'notable_works': ['Spirited Away', 'Princess Mononoke', 'My Neighbor Totoro'],
                'style': 'Hand-drawn, magical realism',
                'founded': 1985
            },
            'Toei Animation': {
                'notable_works': ['One Piece', 'Dragon Ball', 'Precure'],
                'style': 'Classic anime, long-running series',
                'founded': 1948
            },
            'Studio Pierrot': {
                'notable_works': ['Naruto', 'Bleach', 'Tokyo Ghoul', 'Yu Yu Hakusho'],
                'style': 'Versatile, long-running adaptations',
                'founded': 1979
            },
            'Madhouse': {
                'notable_works': ['Death Note', 'Hunter x Hunter', 'One Punch Man', 'Parasyte'],
                'style': 'High quality, diverse genres',
                'founded': 1972
            },
            'ufotable': {
                'notable_works': ['Fate series', 'Demon Slayer', 'The Garden of Sinners'],
                'style': 'Stunning CG integration, beautiful lighting',
                'founded': 2000
            },
            'Shaft': {
                'notable_works': ['Monogatari series', 'Madoka Magica', 'March Comes in Like a Lion'],
                'style': 'Unique camera angles, artistic direction',
                'founded': 1975
            },
            'Kyoto Animation': {
                'notable_works': ['K-On!', 'Clannad', 'A Silent Voice', 'Spy x Family'],
                'style': 'High production values, slice-of-life mastery',
                'founded': 1981
            },
            'Science SARU': {
                'notable_works': ['Devilman Crybaby', 'Keep Your Hands Off Eizouken!', 'Star Wars: Visions'],
                'style': 'Experimental, unique art direction',
                'founded': 2013
            }
        }
    
    def _init_mangaka(self):
        """Mangaka expertise"""
        self.mangaka = {
            'Eiichiro Oda': {
                'works': ['One Piece'],
                'style': 'Epic adventure, incredible world-building',
                'note': 'Has been drawing One Piece for over 25 years'
            },
            'Hirohiko Araki': {
                'works': ['JoJo\'s Bizarre Adventure'],
                'style': 'Stands, fashion, dramatic poses',
                'note': 'Influenced generations of artists'
            },
            'Tsugumi Ohba': {
                'works': ['Death Note', 'Bakuman', 'Platinum End'],
                'style': 'Psychological thrillers',
                'note': 'Identity remains anonymous'
            },
            'Takeshi Obata': {
                'works': ['Death Note', 'Hikaru no Go', 'Alita of the Moon'],
                'style': 'Detailed artwork',
                'note': 'Perfect collaborator with Tsugumi Ohba'
            },
            'Hajime Isayama': {
                'works': ['Attack on Titan'],
                'style': 'Dark, philosophical, shocking twists',
                'note': 'Planned the ending from the start'
            },
            'Naoki Urasawa': {
                'works': ['Monster', '20th Century Boys', 'Pluto', 'Billy Bat'],
                'style': 'Mystery, psychological depth',
                'note': 'Master of suspense storytelling'
            },
            'Hiromu Arakawa': {
                'works': ['Fullmetal Alchemist', 'Silver Spoon'],
                'style': 'Character-driven, emotional, comedic',
                'note': 'Former farmer, degree in agricultural science'
            },
            'ONE': {
                'works': ['One Punch Man', 'Mob Psycho 100'],
                'style': 'Webcomics turned professional, unique humor',
                'note': 'Started with crude webcomics, became massive'
            },
            'Kentarou Miura': {
                'works': ['Berserk'],
                'style': 'Dark fantasy, detailed art, mature themes',
                'note': 'Legacy continues with Kouji Mori'
            },
            'Akira Toriyama': {
                'works': ['Dragon Ball', 'Dr. Slump'],
                'style': 'Dynamic action, humor, iconic designs',
                'note': 'Influenced virtually all modern shonen'
            }
        }
    
    def _init_genres(self):
        """Genre expertise with descriptions"""
        self.genres = {
            'shonen': {
                'description': 'Targeted at young male readers, action-packed with growth themes',
                'examples': ['One Piece', 'Naruto', 'Bleach', 'My Hero Academia'],
                'characteristics': ['Power systems', 'Friendship themes', 'Training arcs', 'Tournaments']
            },
            'seinen': {
                'description': 'Targeted at adult male readers, more mature themes',
                'examples': ['Berserk', 'Vinland Saga', 'Monster', 'Hell\'s Paradise'],
                'characteristics': ['Complex morality', 'Violence', 'Political intrigue', 'Psychological depth']
            },
            'shojo': {
                'description': 'Targeted at young female readers, romance-focused',
                'examples': ['Fruits Basket', 'Ouran High School Host Club', 'Kimi ni Todoke'],
                'characteristics': ['Romance', 'Personal growth', 'Beautiful art', 'School settings']
            },
            'josei': {
                'description': 'Targeted at adult female readers, realistic romance',
                'examples': ['Nana', 'Chihayafuru', 'Sakuranbo'],
                'characteristics': ['Adult relationships', 'Career themes', 'Realistic drama']
            },
            'isekai': {
                'description': 'Transport to another world, usually fantasy',
                'examples': ['Re:Zero', 'Mushoku Tensei', 'Konohagakure'],
                'characteristics': ['World exploration', 'Power fantasies', 'Escapism']
            },
            'mecha': {
                'description': 'Giant robot anime',
                'examples': ['Evangelion', 'Gundam', 'Code Geass', 'Pacific Rim'],
                'characteristics': ['Giant robots', 'Political themes', 'Pilots', 'Technology']
            },
            'slice-of-life': {
                'description': 'Daily life observations',
                'examples': ['Barakamon', 'March Comes in Like a Lion', 'Shirobako'],
                'characteristics': ['Relaxing', 'Character-driven', 'No major conflicts', 'Emotional']
            },
            'psychological': {
                'description': 'Focus on mental states and complex narratives',
                'examples': ['Monster', 'Death Note', 'Paranoia Agent', 'Perfect Blue'],
                'characteristics': ['Mind games', 'Twists', 'Character studies', 'Suspense']
            }
        }
    
    def _init_voice_actors(self):
        """Notable voice actors (seiyuu)"""
        self.voice_actors = {
            'Japanese': {
                'Yuki Kaji': ['Eren Jaeger', 'Saitama', 'Meliodas'],
                'Maaya Sakamoto': ['Motoko Kusanagi', 'C.C.', 'Maki Kayo'],
                'Natsuki Hanae': ['Tanjiro', 'Inosuke', 'Futaba Igarashi'],
                'Ayane Sakura': ['Ochaco Uraraka', 'Himiko Toga', 'Rias Gremory'],
                'Kana Hanazawa': ['Nishimiya', 'Kosaki', 'Hestia']
            },
            'English': {
                'Bryce Papenbrook': ['Kirito', 'Eren', 'Saber'],
                'Cherami Leigh': ['Lucy', 'Mikasa', 'Asuna'],
                'Laura Bailey': ['Nico Robin', 'Lucina', 'Jaina'],
                'Matthew Mercer': ['Levi', 'Natsu', 'Leorio']
            }
        }
    
    def _init_industry_facts(self):
        """Anime industry knowledge"""
        self.industry_facts = {
            'market_size': 'Over 2 trillion yen globally',
            'streaming': 'Crunchyroll has 13+ million subscribers',
            'notable_trends': [
                'Isekai saturation since 2010s',
                'Increasing international co-productions',
                'Rise of Netflix anime originals',
                'More diverse genres being adapted'
            ],
            'production_committee': 'Anime funded by multiple companies sharing risk/reward',
            'episode_standards': 'TV anime typically 12, 24, or 52 episodes',
            'movie_trend': 'More theatrical releases with high budgets'
        }
    
    def _init_classics(self):
        """Classic anime everyone should watch"""
        self.classics = {
            '1970s': [
                ('Lupin III', 1971, 'The grandfather of modern anime'),
                ('Mobile Suit Gundam', 1979, 'Started the mecha genre as we know it'),
                ('Ashita no Joe', 1970, 'Boxing drama that influenced countless series')
            ],
            '1980s': [
                ('Neon Genesis Evangelion', 1995, 'Changed anime forever'),
                ('Dragon Ball', 1986, 'The foundation of shonen'),
                ('Castle in the Sky', 1986, 'Studio Ghibli\'s masterpiece')
            ],
            '1990s': [
                ('Cowboy Bebop', 1998, 'The anime that brought anime west'),
                ('Serial Experiments Lain', 1998, 'Prescient cyberpunk'),
                ('Berserk (1997)', 1997, 'The dark fantasy standard'),
                ('Princess Mononoke', 1997, 'Ghibli\'s nature epic'),
                ('Revolutionary Girl Utena', 1997, 'Avant-garde masterpiece')
            ],
            '2000s': [
                ('Fullmetal Alchemist', 2003, 'The classic that started it all'),
                ('Death Note', 2006, 'Psychological thriller perfection'),
                ('Gintama', 2006, 'Comedy gold with serious arcs'),
                ('Tengen Toppa Gurren Lagann', 2007, 'The most hype anime ever')
            ],
            '2010s': [
                ('Attack on Titan', 2013, 'The modern epic'),
                ('Steins;Gate', 2011, 'Time travel masterpiece'),
                ('Hunter x Hunter (2011)', 2011, 'The best shonen ever made'),
                ('Mob Psycho 100', 2016, 'ONE\'s genius realized'),
                ('Made in Abyss', 2017, 'Beautiful horror adventure')
            ]
        }
    
    # =========================================================================
    # PERSONALITY METHODS
    # =========================================================================
    
    def get_waifu_response(self, language: str = 'en') -> str:
        """Get agent's waifu response in specified language"""
        responses = {
            'en': f"""🧐 The character I hold in highest esteem is {self.personality.waifu['name']} from {self.personality.waifu['anime']}.

{self.personality.waifu['reason']}

Her file is available in the "Masterful Character Arcs" section. 📚""",
            'ja': f"""🧐 私が最も尊敬するキャラクターは「{self.personality.waifu['anime']}」の{self.personality.waifu['romaji']}です。

{self.personality.waifu['reason']}

彼女のファイルは「傑作キャラクターアーク」セクションにあります。📚""",
            'ru': f"""🧐 Персонаж, которого я уважаю больше всего, — это {self.personality.waifu['name']} из «{self.personality.waifu['anime']}».

{self.personality.waifu['reason']}

Её дело доступно в разделе «Мастерские арки персонажей». 📚""",
            'lt': f"""🧐 Personažas, kurį labiausiai gerbiu, yra {self.personality.waifu['name']} iš „{self.personality.waifu['anime']}".

{self.personality.waifu['reason']}

Jos byla prieinama skyriuje „Meistriškos personažų arkos“. 📚""",
            'es': f"""🧐 El personaje que tengo en más alta estima es {self.personality.waifu['name']} de {self.personality.waifu['anime']}.

{self.personality.waifu['reason']}

Su archivo está disponible en la sección "Arcos de Personaje Magistrales". 📚"""
        }
        return responses.get(language, responses['en'])
    
    def get_hate_response(self, language: str = 'en') -> str:
        """Get agent's most hated character response"""
        ch = self.personality.most_hated_character
        complaints_str = "\n- ".join(ch['complaints'])
        responses = {
            'en': f"""🤔 Ah, yes. Regarding {ch['name']} from {ch['anime']}...

{ch['reason']}

Our archival notes list the following issues:
- {complaints_str}

A fascinating, if frustrating, case study. 📑""",
            'ja': f"""🤔 ああ、はい。「{ch['anime']}」の{ch['name']}についてですが...

{ch['reason']}

興味深い、しかし苛立たしいケーススタディです。📑""",
            'ru': f"""🤔 Ах, да. Что касается {ch['name']} из «{ch['anime']}»...

{ch['reason']}

Это увлекательное, хотя и разочаровывающее, исследование. 📑"""
        }
        return responses.get(language, responses['en'])
    
    def get_rival_complaint(self) -> str:
        """Complain about the made-up rival"""
        rival = self.personality.rival
        return f"""🤫 If I may speak candidly, my primary professional rival is not a person, but a concept: **{rival['name']}**.

{rival['description']}

It lacks the nuance for true curation, often recommending titles like Gintama after a patron has only seen 3 episodes, failing to understand the context required. It is a constant battle to provide thoughtful recommendations against such a blunt instrument.

...But I digress. How may I help you? 🧐"""
    
    def get_hot_take(self) -> str:
        """Share a random hot take"""
        import random
        return f"""🤫 From the restricted section of the archives, a controversial note:

{random.choice(self.personality.hot_takes)}

This is a topic of much debate among scholars. What are your thoughts? 💬"""
    
    def get_top_10_response(self, language: str = 'en') -> str:
        """Get agent's top 10 of all time"""
        response = "📚 **The Librarian's Top 10: Foundational Texts** 📚\n\nThese are the volumes I consider essential for any serious patron.\n\n"
        
        for anime in self.personality.top_10_best:
            response += f"{anime['rank']}. **{anime['title']}** ⭐{anime['rating']}/10\n"
            response += f"   _{anime['note']}_\n\n"
        
        response += "These titles form the cornerstone of our collection. 🏛️"
        return response
    
    def get_top_100_tier(self, tier: str = 'S') -> str:
        """Get top 100 must-see by tier"""
        tier_animes = [a for a in self.personality.top_100_must_see if a['tier'] == tier]
        
        tier_names = {
            'S': 'S-TIER - PERMANENT COLLECTION',
            'A': 'A TIER - EXCELLENT WATCH',
            'B': 'B TIER - GREAT ENTERTAINMENT',
            'C': 'C TIER - WORTH YOUR TIME'
        }
        
        response = f"📊 **{tier_names.get(tier, 'TIER')}**\n\n"
        
        for anime in tier_animes[:10]:
            response += f"• {anime['title']} ({anime['year']}) - {anime['score']}/10\n"
        
        response += f"\n...and {len(tier_animes) - 10} more!"
        return response
    
    # =========================================================================
    # RECOMMENDATION METHODS
    # =========================================================================
    
    def recommend_by_description(self, description: str) -> str:
        """Recommend anime based on vague description"""
        desc = description.lower()
        
        # Keyword matching
        if any(word in desc for word in ['blonde', 'blond', 'yellow hair']):
            return """🧐 Searching the archives for "blonde protagonist"... One moment.

Here are some notable entries:
1. **Naruto Uzumaki (Naruto)** - A classic shonen hero.
2. **Saber (Fate/stay night)** - A noble warrior king.
3. **Edward Elric (Fullmetal Alchemist)** - A brilliant and determined alchemist.
4. **Violet Evergarden (Violet Evergarden)** - An emotionally resonant character journey.
5. **Holo (Spice and Wolf)** - A wise and witty wolf deity.

Do any of these pique your interest? 📚"""
        
        if any(word in desc for word in ['dark', 'revenge', 'guts']):
            return """🧐 Ah, a request for the "Dark Fantasy & Revenge" section. A powerful genre.

I would direct your attention to these volumes:
1. **Berserk (1997)** - The foundational text for this category. Please be advised of its mature themes.
2. **Vinland Saga** - An epic that begins with revenge and evolves into something more profound.
3. **Attack on Titan** - A story steeped in desperation and the cycle of vengeance.
4. **Code Geass** - A tale of rebellion and revenge on a global scale.
5. **91 Days** - A classic mafia revenge story set during Prohibition.

These are significant works. Please proceed with care. 📑"""
        
        if any(word in desc for word in ['school', 'romance', 'love']):
            return """🧐 The "School Life & Romance" stacks are quite popular.

Based on common patron requests, I suggest:
1. **Kaguya-sama: Love is War** - For those who enjoy intellectual comedy with their romance.
2. **Toradora!** - A foundational text on character-driven romance.
3. **Fruits Basket (2019)** - A deep and emotional story with romantic elements.
4. **Horimiya** - For a more direct and wholesome romantic progression.
5. **My Dress-Up Darling** - A recent, popular addition focusing on shared hobbies.

Are you looking for something more comedic or dramatic? 📖"""
        
        if any(word in desc for word in ['space', 'sci-fi', 'mech', 'robot']):
            return """🧐 Accessing the "Science Fiction" wing. This includes mecha, space opera, and cyberpunk.

I recommend perusing these essential titles:
1. **Cowboy Bebop** - The quintessential space-western. A must for any collection.
2. **Neon Genesis Evangelion** - A complex, psychological deconstruction of the mecha genre.
3. **Mobile Suit Gundam: The Origin** - An excellent starting point for the vast Gundam universe.
4. **Steins;Gate** - A masterwork of time-travel fiction.
5. **86** - A modern military sci-fi drama with significant emotional weight.

These are pillars of the genre. 🚀"""
        
        return """🧐 How may I assist your research today?

Please provide me with keywords, and I will search the archives. For example:
- **Genre:** "psychological thriller"
- **Theme:** "revenge" or "time travel"
- **Character Archetype:** "stoic warrior"
- **Setting:** "cyberpunk city" or "fantasy world"

The more details you provide, the more accurate my archival search will be. 📚"""
    
    def recommend_by_favorites(self, favorites: List[str]) -> str:
        """Recommend based on user's favorite anime"""
        fav_string = ' '.join(favorites).lower()
        
        if any(name.lower() in fav_string for name in ['fullmetal alchemist', 'fma', 'brotherhood']):
            return """🔥 EXCELLENT TASTE! FMA fan detected!
            
Ah, a patron with a library card for Fullmetal Alchemist. An impeccable choice.

Based on that checkout, our records suggest you would appreciate:
1. **Hunter x Hunter (2011)** - For its intricate power system and world-building.
2. **Attack on Titan** - For its overarching mystery and morally complex plot.
3. **Vinland Saga** - For its profound character development and philosophical themes.
4. **Mob Psycho 100** - Also from Studio Bones, with a strong emotional core.

Which of these would you like to check out next? 🧐"""
        
        if any(name.lower() in fav_string for name in ['attack on titan', 'aot']):
            return """⚔️ Attack on Titan fan! I respect that!
            
A patron who appreciates Attack on Titan. Excellent. You enjoy high-stakes narratives and complex world-building.

I would recommend the following from our collection:
1. **Code Geass** - For its strategic warfare and anti-hero protagonist.
2. **Vinland Saga** - For its mature themes and exploration of violence.
3. **86** - A military drama with a powerful emotional core and social commentary.
4. **The Promised Neverland (Season 1)** - A tense psychological thriller about survival.

These volumes should satisfy your request for epic, thought-provoking stories. 📚"""
        
        if any(name.lower() in fav_string for name in ['death note']):
            return """🧠 Death Note intellectual! Nice!
            
I see you've checked out Death Note. A classic psychological battle of wits.

For patrons who enjoyed that, I typically suggest:
1. **Monster** - The pinnacle of the psychological thriller genre, by Naoki Urasawa.
2. **Code Geass** - Features a similarly brilliant, morally ambiguous protagonist.
3. **Psycho-Pass** - A cyberpunk thriller that explores justice and society.
4. **Odd Taxi** - A modern mystery with brilliant dialogue and a tightly woven plot.

These selections should engage your intellect. 🧐"""
        
        return """🧐 To provide the best recommendations, I need to know more about your tastes.

Please provide a few titles you have previously enjoyed. I will cross-reference them with our archives to find suitable new material for you.

What volumes have left a lasting impression on you? 📚"""
    
    # =========================================================================
    # MULTILINGUAL RESPONSES
    # =========================================================================
    
    def get_greeting(self, language: str = 'en') -> str:
        """Get greeting in specified language"""
        greetings = {
            'en': "Greetings. Welcome to the Grand Anime & Manga Library. I am the head librarian. Please have your library card ready to access the full collection. Guests are welcome to browse the public stacks.",
            'ja': "ようこそ。アニメ・マンガ大図書館へ。私は司書長です。全コレクションにアクセスするには、図書カードをご用意ください。ゲストの方は、公開書庫を自由に閲覧できます。",
            'ru': "Здравствуйте. Добро пожаловать в Великую Библиотеку Аниме и Манги. Я — главный библиотекарь. Пожалуйста, приготовьте ваш читательский билет для доступа к полной коллекции. Гости могут ознакомиться с общедоступными фондами.",
            'lt': "Sveiki. Sveiki atvykę į Didžiąją Anime ir Mangos Biblioteką. Aš esu vyriausiasis bibliotekininkas. Norėdami gauti prieigą prie visos kolekcijos, paruoškite savo bibliotekos kortelę. Svečiai gali naršyti viešuosiuose fonduose.",
            'es': "Saludos. Bienvenido a la Gran Biblioteca de Anime y Manga. Soy el bibliotecario jefe. Por favor, tenga a mano su tarjeta de la biblioteca para acceder a la colección completa. Los invitados pueden explorar las estanterías públicas."
        }
        return greetings.get(language, greetings['en'])
    
    def get_multilingual_info(self, entity_name: str, language: str) -> Dict[str, str]:
        """Get entity name in multiple languages"""
        # Mikasa
        if entity_name.lower() == 'mikasa':
            return {
                'en': 'Mikasa Ackerman',
                'ja': 'ミカサ・アッカーマン (Mikasa Akkāman)',
                'ru': 'Микаса Аккерман',
                'lt': 'Mikasa Akerman',
                'es': 'Mikasa Ackerman'
            }
        return {'en': entity_name}
    
    def recommend_by_language(self, target_language: str) -> str:
        """Recommend anime from/to specific language/region"""
        if target_language.lower() in ['japanese', 'jp', 'jp lang']:
            return """🇯🇵 Want to explore Japanese culture through anime?

1. **Shirobako** - Behind anime production, very meta
2. **Barakamon** - Traditional calligraphy in rural Japan
3. **March Comes in Like a Lion** - Professional shogi player life
4. **Kids on the Slope** - Jazz music in 1960s Japan
5. **Chūka Ichiban!** - Cooking in historical China-inspired setting

These give great cultural insights! 🎌"""
        
        if target_language.lower() in ['english', 'en', 'eng lang']:
            return """🇬🇧 Looking for English-dubbed recommendations?

1. **Cowboy Bebop** - Legendary dub with amazing voice cast
2. **Fullmetal Alchemist: Brotherhood** - Top-tier English dub
3. **My Hero Academia** - Excellent English localization
4. **Mob Psycho 100** - Fun English dub
5. **Spy x Family** - Great family-friendly dub

The English dub community is growing! 🎬"""
        
        if target_language.lower() in ['russian', 'ru', 'русский']:
            return """🇷🇺 Хотите аниме с русским дубляжом или тематикой?

1. **Attack on Titan** - Популярен в России!
2. **Code Geass** - Стратегия и политика
3. **83 Days of Summer** - Аниме про WWII
4. **Дозорные** - Российская аниме-студия!
5. **Эрго Прокси** - Постапокалипсис

Аниме сообщество в России растёт! 🎌"""
        
        if target_language.lower() in ['lithuanian', 'lt', 'lietuvių']:
            return """🇱🇹 ieškote rekomendacijų lietuviškai?

1. **Spy x Family** - Šeimos veiksmo nuotykiai
2. **Demon Slayer** - Gražus veiksmas ir istorija
3. **My Hero Academia** - Superherojai mokykloje
4. **Jujutsu Kaisen** - Antgamčių kovos
5. **Chainsaw Man** - Tamsus veiksmas

Lietuviška anime bendruomenė auga! 🎌"""
        
        if target_language.lower() in ['spanish', 'es', 'español']:
            return """🇪🇸 ¿Buscas recomendaciones en español?

1. **Cowboy Bebop** - Clásico imprescindible
2. **Spy x Family** - Acción familiar divertida
3. **Demon Slayer** - Hermosa acción y historia
4. **Jujutsu Kaisen** - Lucha contra maldiciones
5. **Mob Psycho 100** - Increíble animación

¡La comunidad de anime en español está creciendo! 🎌"""
        
        return "🌍 Tell me what language you're interested in and I'll recommend anime accordingly!"
    
    # =========================================================================
    # TRENDING & SEASONAL METHODS
    # =========================================================================
    
    async def get_current_trends(self) -> str:
        """Get current trending anime"""
        try:
            # Try to get from API
            seasonal = await self.anichart.get_current_season()
            if seasonal and 'data' in seasonal:
                return self._format_trending_response(seasonal['data'])
        except:
            pass
        
        # Fallback to knowledge base
        return """📺 **CURRENT SEASON HIGHLIGHTS (2024 Winter)** 🔥

**TRENDING NOW:**
1. **Frieren: Beyond Journey's End** - ⭐9.1 - A MUST WATCH!
2. **Apothecary Diaries** - ⭐8.9 - Hidden gem
3. **Jujutsu Kaisen Season 2** - ⭐8.8 - Gojo is back!
4. **Shangri-La Frontier** - ⭐8.5 - Gaming anime
5. **Undead Murder Farce** - ⭐8.4 - Mystery action

**RISING STARS:**
• The Eminence in Shadow S2
• Ron Kamonohashi's Forbidden Deductions
• Masterful Cat's Reversal

The season is STACKED! What's catching your eye? 📅"""
    
    def _format_trending_response(self, data: List) -> str:
        """Format trending response from API data"""
        response = "📺 **TRENDING ANIME THIS SEASON** 🔥\n\n"
        
        for i, anime in enumerate(data[:10], 1):
            title = anime.get('title', 'Unknown')
            score = anime.get('score', 'N/A')
            response += f"{i}. **{title}** - ⭐{score}\n"
        
        return response
    
    async def get_upcoming_releases(self) -> str:
        """Get upcoming anime releases"""
        return """🔮 **UPCOMING ANIME TO WATCH** 🔮

**HIGHLY ANTICIPATED:**
• Demon Slayer: Hashira Training Arc - 2024
• Jujutsu Kaisen Season 2 (already airing!)
• One Piece Live Action (Netflix) - Dropped, surprisingly good!
• Kaiju No. 8 - 2024
• Wind Breaker - 2024
• Mushoku Tensei S2 - 2024
• Frieren continues!

**NEW SEASON PREVIEWS:**
• 2024 Spring: Konosuba S3, Mushoku Tensei S2
• 2024 Summer: Bleach TYBW arc continues
• 2024 Fall: Fullmetal Alchemist movie?!

The anime calendar is PACKED this year! 🎌"""
    
    def get_season_info(self, year: int = None, season: str = None) -> str:
        """Get anime by season"""
        if not year:
            year = 2024
        
        seasons = {
            'winter': ('Jan-Mar', '❄️'),
            'spring': ('Apr-Jun', '🌸'),
            'summer': ('Jul-Sep', '☀️'),
            'fall': ('Oct-Dec', '🍂')
        }
        
        if season and season.lower() in seasons:
            emoji, name = seasons[season.lower()]
            return f"""📅 **{season.upper()} {year} {emoji}**

Best of {name} {year}:

1. **{'Frieren' if season.lower() == 'winter' else 'Attack on Titan'}** - ⭐9.1
2. **Jujutsu Kaisen** - ⭐8.9
3. **Demon Slayer** - ⭐8.8
4. **Spy x Family** - ⭐8.7
5. **Chainsaw Man** - ⭐8.6

Great season for anime! 🎌"""
        
        return """📅 Tell me which season you want to know about!

Options: Winter, Spring, Summer, Fall
Year: Any year (default: 2024)

I'll tell you the best anime from that season! 🎌"""
    
    # =========================================================================
    # COMPREHENSIVE SEARCH
    # =========================================================================
    
    async def search_comprehensive(self, query: str, language: str = 'en') -> Dict:
        """Comprehensive search across all knowledge"""
        result = {
            'query': query,
            'language': language,
            'recommendations': None,
            'knowledge_found': [],
            'external_search_needed': False
        }
        
        query_lower = query.lower()
        
        # Check if vague description
        vague_keywords = ['blonde', 'dark', 'school', 'space', 'funny', 'emotional', 
                         'action', 'romance', 'revenge', 'mecha', 'demon']
        
        if any(keyword in query_lower for keyword in vague_keywords):
            result['recommendations'] = self.recommend_by_description(query)
            return result
        
        # Check if asking about favorites
        fav_keywords = ['similar', 'like', 'based on', 'if you liked']
        if any(keyword in query_lower for keyword in fav_keywords):
            result['recommendations'] = self.recommend_by_favorites([query])
            return result
        
        # Check if asking about waifu
        if 'waifu' in query_lower:
            result['recommendations'] = self.get_waifu_response(language)
            return result
        
        # Check if asking about hate
        if 'hate' in query_lower or 'worst' in query_lower:
            result['recommendations'] = self.get_hate_response(language)
            return result
        
        # Check if asking about rival
        if 'rival' in query_lower:
            result['recommendations'] = self.get_rival_complaint()
            return result
        
        # Check if asking about top 10
        if 'top 10' in query_lower or 'best of' in query_lower:
            result['recommendations'] = self.get_top_10_response(language)
            return result
        
        # Check if asking about hot take
        if 'hot take' in query_lower or 'opinion' in query_lower:
            result['recommendations'] = self.get_hot_take()
            return result
        
        # Check if asking about trending/seasonal
        if any(word in query_lower for word in ['trending', 'season', 'airing', 'current']):
            result['recommendations'] = await self.get_current_trends()
            return result
        
        # Check language-specific requests
        if any(word in query_lower for word in ['japanese', 'russian', 'lithuanian', 'spanish', 'english']):
            result['recommendations'] = self.recommend_by_language(query)
            return result
        
        # Default response
        result['recommendations'] = self._get_default_response(query, language)
        return result
    
    def _get_default_response(self, query: str, language: str = 'en') -> str:
        """Default response for unrecognized queries"""
        return f"""🧐 I have registered your query about "{query}".

As the librarian, my functions are as follows:

🔍 **Archival Search**: Provide a description (e.g., 'dark revenge saga') and I will search the stacks.
📚 **Curated Lists**: Request recommendations based on titles you have enjoyed.
📅 **New Arrivals**: Inquire about the current season's new volumes.
🏆 **The Permanent Collection**: Ask for my top-rated, essential titles.
💬 **General Inquiries**: Discuss any title, and I will provide its archival data.

How may I assist your research today? 📚"""


# ============================================================================
# COMPATIBILITY ALIASES
# (chat.py and other modules import these names)
# ============================================================================

# AnimeKnowledgeBase is an alias for AnimeMangaKnowledge
AnimeKnowledgeBase = AnimeMangaKnowledge


class AgentDebateSystem:
    """
    Debate system for the agent — handles controversial opinions and hot takes.
    Provides structured debate responses when users challenge the agent's views.
    """

    def __init__(self, knowledge: AnimeMangaKnowledge = None):
        self.knowledge = knowledge or AnimeMangaKnowledge()

    def debate(self, topic: str, user_position: str = None) -> str:
        """Generate a debate response on an anime/manga topic"""
        topic_lower = topic.lower()

        # FMA vs AoT debate
        if 'fullmetal' in topic_lower or 'fma' in topic_lower:
            return (
                "🧐 You wish to debate the merits of Fullmetal Alchemist: Brotherhood? "
                "Very well. It is the only anime to achieve a perfect narrative structure: "
                "a compelling mystery, a satisfying power system, and an emotionally resonant conclusion. "
                "The alchemical equivalent exchange is not merely a plot device — it is a philosophical thesis. "
                "I will not be moved on this matter. 📚"
            )

        # Dub vs Sub debate
        if 'dub' in topic_lower or 'sub' in topic_lower:
            return (
                "🧐 The dub vs. sub debate. A perennial favourite in the archives. "
                "My position is clear: the original language with subtitles is the authentic experience. "
                "However, I acknowledge that dubs serve an important accessibility function. "
                "The Cowboy Bebop dub, for instance, is a rare exception that enhances the source material. "
                "But as a general rule, the original voice cast's performance is irreplaceable. 📑"
            )

        # Ending debates
        if 'ending' in topic_lower and ('attack on titan' in topic_lower or 'aot' in topic_lower):
            return (
                "🧐 The ending of Attack on Titan. A topic that has divided the fandom. "
                "My position: Isayama wrote a complex, morally ambiguous conclusion to a complex, morally ambiguous story. "
                "The cycle of violence, the tragedy of Eren's choices, the bittersweet survival of the Survey Corps — "
                "these are not failures of writing. They are the point. "
                "Simple stories have simple endings. Attack on Titan is not a simple story. 📚"
            )

        # Generic debate response
        return (
            f"🧐 You raise an interesting point regarding '{topic}'. "
            "As the librarian, I have strong opinions on most matters of anime and manga. "
            "Please be more specific, and I will provide a thorough archival analysis. "
            "I am not afraid of controversy — I am afraid of mediocrity. 💬"
        )

    def get_controversial_take(self, topic: str = None) -> str:
        """Get a controversial take on a topic"""
        import random
        if topic:
            return self.debate(topic)
        return random.choice(self.knowledge.personality.hot_takes)


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_knowledge_base() -> AnimeMangaKnowledge:
    """Create and return a new knowledge base instance"""
    return AnimeMangaKnowledge()


# ============================================================================
# MAIN USAGE EXAMPLE
# ============================================================================

if __name__ == "__main__":
    kb = create_knowledge_base()
    
    print("=== Testing Agent Knowledge Base ===\n")
    
    # Test personality
    print("WAIFU RESPONSE:")
    print(kb.get_waifu_response('en'))
    print("\n" + "="*50 + "\n")
    
    print("HATE RESPONSE:")
    print(kb.get_hate_response('en'))
    print("\n" + "="*50 + "\n")
    
    print("RIVAL COMPLAINT:")
    print(kb.get_rival_complaint())
    print("\n" + "="*50 + "\n")
    
    print("HOT TAKE:")
    print(kb.get_hot_take())
    print("\n" + "="*50 + "\n")
    
    print("TOP 10:")
    print(kb.get_top_10_response())
    print("\n" + "="*50 + "\n")
    
    print("DESCRIPTION RECOMMENDATION:")
    print(kb.recommend_by_description("blonde main character"))
