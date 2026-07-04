"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'EN' | 'LT' | 'JP';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['EN'];
}

export const translations = {
  EN: {
    nav: {
      brand: "LIBRARY OF OTAKU",
      features: "Features",
      roadmap: "Roadmap",
      devlog: "DevLog",
      portal: "Portal Login",
      beta: "Join Beta",
      library: "Archive",
      guild: "Guild",
      studio: "Studio",
      sync: "Online",
      logout: "Logout",
      system: "System v2.4.0-BETA"
    },
    hero: {
      presale: "Limited Time Pre-Sale",
      title_prefix: "Your Anime.",
      title_suffix: "Organized.",
      subtitle: "The all-in-one desktop manager for serious collectors. Auto-renaming, 4K analysis, and cloud sync in one beautiful package.",
      cta_buy: "Get Founder's Pack",
      cta_portal: "Open Web Portal",
      license: "Windows 10/11 • Lifetime License"
    },
    gateway: {
      title: "CHOOSE YOUR REALITY",
      subtitle: "The Ultimate Gamified Anime Library Platform",
      region_lt_title: "Otaku Gildija",
      region_lt_desc: "Join the Lithuanian anime community. Sort files, level up, and become a legend.",
      region_eu_title: "Library of Otaku",
      region_eu_desc: "The advanced anime library manager for serious collectors. Track stats and organize files.",
      join: "Join",
      enter: "Enter Portal"
    },
    library: {
      title: "Guild Archive",
      subtitle: "Database Status: Active",
      search_placeholder: "SEARCH ARCHIVE...",
      filter_quality: "Quality",
      filter_type: "Type",
      stat_items: "Total Items",
      stat_completed: "Completed",
      stat_4k: "4K Content",
      stat_missing: "Missing Eps",
      empty: "No data found in this sector.",
      reset: "Reset Parameters"
    },
    community: {
      title: "Hero Card",
      tab_overview: "Overview",
      tab_history: "History",
      tab_inventory: "Inventory",
      tab_missions: "Missions",
      share: "Share Profile",
      stats_files: "Files",
      stats_completed: "Completed",
      stats_rate: "Rate",
      stats_xp: "XP"
    },
    studio: {
        title: "Creative Studio",
        subtitle: "AI Powered Production Suite",
        tool_art: "Nano Banana Pro",
        tool_video: "Veo Motion",
        tool_scan: "Data Scanner",
        execute: "Execute Agent"
    }
  },
  LT: {
    nav: {
      brand: "OTAKU GILDIJA",
      features: "Funkcijos",
      roadmap: "Planas",
      devlog: "Dienoraštis",
      portal: "Prisijungti",
      beta: "Gauti Beta",
      library: "Archyvas",
      guild: "Gildija",
      studio: "Studija",
      sync: "Tinklas",
      logout: "Atsijungti",
      system: "Sistema v2.4.0-BETA"
    },
    hero: {
      presale: "Riboto Laiko Pasiūlymas",
      title_prefix: "Tavo Anime.",
      title_suffix: "Surūšiuota.",
      subtitle: "Viskas-viename darbalaukio tvarkyklė rimtiems kolekcionieriams. Auto-pervadinimas, 4K analizė ir debesų sinchronizacija.",
      cta_buy: "Gauti Įkūrėjo Paketą",
      cta_portal: "Atidaryti Portalą",
      license: "Windows 10/11 • Amžina Licencija"
    },
    gateway: {
      title: "PASIRINK REALYBĘ",
      subtitle: "Gamifikuota Anime Bibliotekos Platforma",
      region_lt_title: "Otaku Gildija",
      region_lt_desc: "Prisijunk prie Lietuvos anime bendruomenės. Rūšiuok failus, kelk lygį ir tapk legenda.",
      region_eu_title: "Library of Otaku",
      region_eu_desc: "Pažangi anime bibliotekos tvarkyklė. Sek statistiką ir organizuok failus.",
      join: "Prisijungti",
      enter: "Atidaryti Portalą"
    },
    library: {
      title: "Gildijos Archyvas",
      subtitle: "Duombazės Būsena: Aktyvi",
      search_placeholder: "IEŠKOTI ARCHYVE...",
      filter_quality: "Kokybė",
      filter_type: "Tipas",
      stat_items: "Viso Įrašų",
      stat_completed: "Užbaigta",
      stat_4k: "4K Turinys",
      stat_missing: "Trūksta Ep",
      empty: "Nerasta duomenų šiame sektoriuje.",
      reset: "Atstatyti Parametrus"
    },
    community: {
      title: "Herojaus Kortelė",
      tab_overview: "Apžvalga",
      tab_history: "Istorija",
      tab_inventory: "Inventorius",
      tab_missions: "Misijos",
      share: "Dalintis Profiliu",
      stats_files: "Failai",
      stats_completed: "Užbaigta",
      stats_rate: "Reitingas",
      stats_xp: "XP"
    },
    studio: {
        title: "Kūrybinė Studija",
        subtitle: "DI Produkcijos Paketas",
        tool_art: "Nano Banana Pro",
        tool_video: "Veo Judesys",
        tool_scan: "Duomenų Skeneris",
        execute: "Vykdyti Agentą"
    }
  },
  JP: {
    nav: {
      brand: "オタクの図書館",
      features: "機能",
      roadmap: "ロードマップ",
      devlog: "開発ログ",
      portal: "ログイン",
      beta: "ベータ版入手",
      library: "アーカイブ",
      guild: "ギルド",
      studio: "スタジオ",
      sync: "オンライン",
      logout: "ログアウト",
      system: "システム v2.4.0-BETA"
    },
    hero: {
      presale: "期間限定プレセール",
      title_prefix: "アニメコレクション",
      title_suffix: "完全整理",
      subtitle: "真のコレクターのためのオールインワンデスクトップマネージャー。自動リネーム、4K分析、クラウド同期を一つの美しいパッケージに。",
      cta_buy: "創設者パックを入手",
      cta_portal: "ウェブポータルを開く",
      license: "Windows 10/11 • 永久ライセンス"
    },
    gateway: {
      title: "現実を選択せよ",
      subtitle: "究極のゲーミフィケーション・アニメライブラリ",
      region_lt_title: "Otaku Gildija (LT)",
      region_lt_desc: "リトアニアのアニメコミュニティに参加しよう。ファイルを整理し、レベルを上げ、伝説となれ。",
      region_eu_title: "Library of Otaku (EU)",
      region_eu_desc: "真のコレクターのための高度なアニメライブラリマネージャー。統計を追跡し、ファイルを整理。",
      join: "参加する",
      enter: "ポータルに入る"
    },
    library: {
      title: "ギルドアーカイブ",
      subtitle: "データベース状態：アクティブ",
      search_placeholder: "アーカイブを検索...",
      filter_quality: "画質",
      filter_type: "タイプ",
      stat_items: "全アイテム",
      stat_completed: "完了",
      stat_4k: "4Kコンテンツ",
      stat_missing: "欠番エピソード",
      empty: "このセクターにはデータがありません。",
      reset: "パラメータをリセット"
    },
    community: {
      title: "ヒーローカード",
      tab_overview: "概要",
      tab_history: "履歴",
      tab_inventory: "インベントリ",
      tab_missions: "ミッション",
      share: "プロフィール共有",
      stats_files: "ファイル",
      stats_completed: "完了",
      stats_rate: "レート",
      stats_xp: "経験値"
    },
    studio: {
        title: "クリエイティブスタジオ",
        subtitle: "AI搭載プロダクションスイート",
        tool_art: "Nano Banana Pro",
        tool_video: "Veo Motion",
        tool_scan: "データスキャナー",
        execute: "エージェント実行"
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toUpperCase();
      if (browserLang.startsWith('LT')) return 'LT';
      if (browserLang.startsWith('JA') || browserLang.startsWith('JP')) return 'JP';
    }
    return 'EN';
  });

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
