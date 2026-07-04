import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '../lib/i18n'; // Ensure global i18n is loaded

export type Language = 'EN' | 'LT' | 'JP' | 'ES' | 'PT' | 'FR' | 'DE';

// Keep translations here so they can be loaded by the global i18n
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
      subtitle:
        'Two honest offers: recurring "Library guild" (tracker premium + bundled desktop) or a one-time desktop app license only.',
      cta_buy: "Get Founder's Pack",
      cta_library_sub: "Library guild (subscription + app)",
      cta_app_only: "Desktop app only",
      offer_hint: "One Firebase account — sign in on blog, tracker, and program sites.",
      cta_portal: "Open Web Portal",
      license: "Windows 10/11 • Lifetime License"
    },
    product: {
      roadmapTabToday: "In the launcher today",
      roadmapTabComing: "Coming",
      roadmapSubtitle:
        "Roadmap content is aligned with workspace STATUS docs — not quarterly marketing fiction.",
      roadmapFootnote: "Shipped modules live in the merged desktop repos; single-installer polish is still in progress.",
      premiumKicker: "Before / After",
      premiumTitle: "Freemium tracker vs Library guild subscription",
      premiumFreeTitle: "Web tracker (free)",
      premiumSubTitle: "Library guild (subscription)",
      premiumFree1: "Manual library limits and standard discovery.",
      premiumFree2: "No server-granted premium until you subscribe on the tracker flow.",
      premiumFree3: "Desktop app is not included unless you subscribe or buy the app SKU separately.",
      premiumSub1: "Premium tracker library features while subscription is active.",
      premiumSub2: "Desktop app entitlement bundled with subscription (see cancel rules in account help).",
      premiumSub3: "App-only checkout never unlocks tracker premium — by design.",
      hubButton: "Open suite hub",
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
      subtitle:
        'Du aiškūs pasiūlymai: „Bibliotekos gildija“ (prenumerata: tracker premium + komplektuojama programa) arba vienkartinė tik darbalaukio programos licencija.',
      cta_buy: "Gauti Įkūrėjo Paketą",
      cta_library_sub: "Gildija (prenumerata + programa)",
      cta_app_only: "Tik darbalaukio programa",
      offer_hint: "Viena Firebase paskyra — prisijunkite tinklaraštyje, tracker'yje ir programų svetainėje.",
      cta_portal: "Atidaryti Portalą",
      license: "Windows 10/11 • Amžina Licencija"
    },
    product: {
      roadmapTabToday: "Paleidiklyje jau dabar",
      roadmapTabComing: "Netrukus",
      roadmapSubtitle: "Planas atitinka STATUS dokumentus — ne rinkodaros ketvirčiai.",
      roadmapFootnote:
        "Veikiančios dalys yra sujungtų desktop projektų moduliuose; vieno diegimo apvalinimas dar vyksta.",
      premiumKicker: "Prieš / Po",
      premiumTitle: "Nemokamas tracker vs Gildijos prenumerata",
      premiumFreeTitle: "Žiniatinklio tracker (nemokama)",
      premiumSubTitle: "Bibliotekos gildija (prenumerata)",
      premiumFree1: "Apribojimai ir standartinė paieška bibliotekoje.",
      premiumFree2: '„Premium“ neatsiranda be serverio patvirtintos prenumeratos.',
      premiumFree3: "Programa neįeina, nebent perkate prenumeratą arba atskirą programos SKU.",
      premiumSub1: "Pilnos tracker bibliotekos funkcijos kol galioja prenumerata.",
      premiumSub2: "Programos teisė į komplektą pagal taisykles (atsisakius — pagal paskyrą).",
      premiumSub3: "Tik programos pirkimas niekada neatrakina tracker premium — sąmoningai.",
      hubButton: "Atidaryti hub'ą",
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
      subtitle:
        "2つの明確な選択: 「ライブラリギルド」サブスク（オンライン版プレミアム＋同梱デスクトップ）か、デスクトップアプリ単体の買い切り。",
      cta_buy: "創設者パックを入手",
      cta_library_sub: "ライブラリギルド（サブスク＋アプリ）",
      cta_app_only: "デスクトップアプリのみ",
      offer_hint: "1つのアカウントでブログ／トラッカー／プログラムサイトにサインイン。",
      cta_portal: "ウェブポータルを開く",
      license: "Windows 10/11 • 永久ライセンス"
    },
    product: {
      roadmapTabToday: "ランンチャー済み",
      roadmapTabComing: "今後",
      roadmapSubtitle: "ロードマップはSTATUSドキュメントに沿います（四半期の宣伝文句ではありません）。",
      roadmapFootnote: "実装モジュールはデスクトップ統合リポジトリにあり、単一インストーラーは継続作業中です。",
      premiumKicker: "Before / After",
      premiumTitle: "無料トラッカー vs ライブラリサブスク",
      premiumFreeTitle: "Webトラッカー（無料）",
      premiumSubTitle: "ライブラリギルド（サブスク）",
      premiumFree1: "手動制限ありの標準ライブラリー体験。",
      premiumFree2: "サーバー証明のサブスクなしでプレミアムは付与されません。",
      premiumFree3: "サブスクまたはアプリSKUがなければデスクトップは同梱されません。",
      premiumSub1: "購読中有効なトラッカープレミアム機能。",
      premiumSub2: "サブスクに同梱されるデスクトップ権利（解約時はルールに従う）。",
      premiumSub3: "アプリ単体購入ではトラッカープレミアムは解放されません。",
      hubButton: "スイートハブを開く",
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
  },
  ES: {
    nav: {
      brand: "BIBLIOTECA DE OTAKU", features: "Características", roadmap: "Hoja de Ruta", devlog: "DevLog", portal: "Portal de Acceso", beta: "Unirse a Beta", library: "Archivo", guild: "Gremio", studio: "Estudio", sync: "En línea", logout: "Cerrar sesión", system: "Sistema v2.4.0-BETA"
    },
    hero: {
      presale: "Preventa por Tiempo Limitado", title_prefix: "Tu Anime.", title_suffix: "Organizado.", subtitle: "Dos ofertas honestas: 'Gremio de la Biblioteca' (premium + app) o una licencia única de la aplicación.", cta_buy: "Obtener Paquete de Fundador", cta_library_sub: "Gremio de la Biblioteca (suscripción)", cta_app_only: "Solo aplicación de escritorio", offer_hint: "Una cuenta de Firebase — inicia sesión en el blog, el tracker y los sitios de programas.", cta_portal: "Abrir Portal Web", license: "Windows 10/11 • Licencia de por vida"
    },
    product: {
      roadmapTabToday: "En el lanzador hoy", roadmapTabComing: "Próximamente", roadmapSubtitle: "El contenido de la hoja de ruta está alineado con los documentos STATUS.", roadmapFootnote: "Los módulos enviados viven en los repositorios de escritorio combinados.", premiumKicker: "Antes / Después", premiumTitle: "Tracker gratuito vs Suscripción", premiumFreeTitle: "Tracker Web (gratis)", premiumSubTitle: "Gremio (suscripción)", premiumFree1: "Límites manuales de la biblioteca.", premiumFree2: "Sin premium otorgado por el servidor.", premiumFree3: "La aplicación de escritorio no está incluida.", premiumSub1: "Funciones premium del tracker activas.", premiumSub2: "Derecho a la aplicación de escritorio.", premiumSub3: "El pago de la aplicación sola nunca desbloquea el tracker.", hubButton: "Abrir hub de la suite"
    },
    gateway: {
      title: "ELIGE TU REALIDAD", subtitle: "La Plataforma Definitiva de Biblioteca de Anime", region_lt_title: "Otaku Gildija", region_lt_desc: "Únete a la comunidad de anime.", region_eu_title: "Library of Otaku", region_eu_desc: "El administrador de biblioteca avanzado para coleccionistas.", join: "Unirse", enter: "Entrar al Portal"
    },
    library: {
      title: "Archivo del Gremio", subtitle: "Estado de la Base de Datos: Activa", search_placeholder: "BUSCAR ARCHIVO...", filter_quality: "Calidad", filter_type: "Tipo", stat_items: "Artículos Totales", stat_completed: "Completados", stat_4k: "Contenido 4K", stat_missing: "Episodios Faltantes", empty: "No se encontraron datos en este sector.", reset: "Restablecer Parámetros"
    },
    community: {
      title: "Tarjeta de Héroe", tab_overview: "Visión General", tab_history: "Historia", tab_inventory: "Inventario", tab_missions: "Misiones", share: "Compartir Perfil", stats_files: "Archivos", stats_completed: "Completados", stats_rate: "Tasa", stats_xp: "XP"
    },
    studio: {
      title: "Estudio Creativo", subtitle: "Suite de Producción con IA", tool_art: "Nano Banana Pro", tool_video: "Veo Motion", tool_scan: "Escáner de Datos", execute: "Ejecutar Agente"
    }
  },
  PT: {
    nav: {
      brand: "BIBLIOTECA DE OTAKU", features: "Recursos", roadmap: "Roteiro", devlog: "DevLog", portal: "Login do Portal", beta: "Entrar no Beta", library: "Arquivo", guild: "Guilda", studio: "Estúdio", sync: "Online", logout: "Sair", system: "Sistema v2.4.0-BETA"
    },
    hero: {
      presale: "Pré-venda por Tempo Limitado", title_prefix: "Seu Anime.", title_suffix: "Organizado.", subtitle: "Duas ofertas honestas: 'Guilda da Biblioteca' (premium + app) ou apenas a licença do aplicativo.", cta_buy: "Obter Pacote de Fundador", cta_library_sub: "Guilda da Biblioteca (assinatura)", cta_app_only: "Apenas aplicativo de desktop", offer_hint: "Uma conta Firebase — faça login no blog, tracker e sites de programas.", cta_portal: "Abrir Portal Web", license: "Windows 10/11 • Licença Vitalícia"
    },
    product: {
      roadmapTabToday: "No lançador hoje", roadmapTabComing: "Em breve", roadmapSubtitle: "O conteúdo do roteiro está alinhado com os documentos STATUS.", roadmapFootnote: "Os módulos enviados vivem nos repositórios combinados.", premiumKicker: "Antes / Depois", premiumTitle: "Tracker Gratuito vs Assinatura", premiumFreeTitle: "Tracker Web (grátis)", premiumSubTitle: "Guilda (assinatura)", premiumFree1: "Limites manuais da biblioteca.", premiumFree2: "Sem premium garantido pelo servidor.", premiumFree3: "O aplicativo de desktop não está incluído.", premiumSub1: "Recursos premium do tracker ativos.", premiumSub2: "Direito ao aplicativo de desktop.", premiumSub3: "O pagamento apenas do aplicativo nunca desbloqueia o tracker.", hubButton: "Abrir hub da suíte"
    },
    gateway: {
      title: "ESCOLHA SUA REALIDADE", subtitle: "A Plataforma de Biblioteca de Anime Gamificada", region_lt_title: "Otaku Gildija", region_lt_desc: "Junte-se à comunidade de anime.", region_eu_title: "Library of Otaku", region_eu_desc: "O gerenciador de biblioteca avançado para colecionadores.", join: "Juntar-se", enter: "Entrar no Portal"
    },
    library: {
      title: "Arquivo da Guilda", subtitle: "Status do Banco de Dados: Ativo", search_placeholder: "PESQUISAR ARQUIVO...", filter_quality: "Qualidade", filter_type: "Tipo", stat_items: "Total de Itens", stat_completed: "Concluídos", stat_4k: "Conteúdo 4K", stat_missing: "Eps Faltando", empty: "Nenhum dado encontrado.", reset: "Redefinir Parâmetros"
    },
    community: {
      title: "Cartão de Herói", tab_overview: "Visão Geral", tab_history: "História", tab_inventory: "Inventário", tab_missions: "Missões", share: "Compartilhar Perfil", stats_files: "Arquivos", stats_completed: "Concluídos", stats_rate: "Taxa", stats_xp: "XP"
    },
    studio: {
      title: "Estúdio Criativo", subtitle: "Suite de Produção IA", tool_art: "Nano Banana Pro", tool_video: "Veo Motion", tool_scan: "Scanner de Dados", execute: "Executar Agente"
    }
  },
  FR: {
    nav: {
      brand: "BIBLIOTHÈQUE D'OTAKU", features: "Caractéristiques", roadmap: "Feuille de Route", devlog: "DevLog", portal: "Portail", beta: "Rejoindre Beta", library: "Archives", guild: "Guilde", studio: "Studio", sync: "En Ligne", logout: "Déconnexion", system: "Système v2.4.0-BETA"
    },
    hero: {
      presale: "Prévente à Durée Limitée", title_prefix: "Votre Anime.", title_suffix: "Organisé.", subtitle: "Deux offres honnêtes : « Guilde de la Bibliothèque » (premium + application) ou une licence d'application de bureau uniquement.", cta_buy: "Obtenir le Pack Fondateur", cta_library_sub: "Guilde de la Bibliothèque (abonnement)", cta_app_only: "Application de bureau uniquement", offer_hint: "Un compte Firebase — connectez-vous au blog, au tracker et aux sites des programmes.", cta_portal: "Ouvrir le Portail Web", license: "Windows 10/11 • Licence à Vie"
    },
    product: {
      roadmapTabToday: "Aujourd'hui dans le lanceur", roadmapTabComing: "À venir", roadmapSubtitle: "Le contenu est aligné avec les documents STATUS.", roadmapFootnote: "Les modules expédiés vivent dans les dépôts combinés.", premiumKicker: "Avant / Après", premiumTitle: "Tracker gratuit vs Abonnement", premiumFreeTitle: "Tracker Web (gratuit)", premiumSubTitle: "Guilde (abonnement)", premiumFree1: "Limites manuelles de la bibliothèque.", premiumFree2: "Pas de premium accordé par le serveur.", premiumFree3: "L'application de bureau n'est pas incluse.", premiumSub1: "Fonctionnalités premium actives.", premiumSub2: "Droit à l'application de bureau.", premiumSub3: "Le paiement de l'application seule ne débloque jamais le tracker.", hubButton: "Ouvrir le hub de la suite"
    },
    gateway: {
      title: "CHOISISSEZ VOTRE RÉALITÉ", subtitle: "La Plateforme Gamifiée de Bibliothèque d'Anime", region_lt_title: "Otaku Gildija", region_lt_desc: "Rejoignez la communauté de l'anime.", region_eu_title: "Library of Otaku", region_eu_desc: "Le gestionnaire de bibliothèque avancé pour les collectionneurs.", join: "Rejoindre", enter: "Entrer dans le Portail"
    },
    library: {
      title: "Archives de la Guilde", subtitle: "État de la Base de Données: Active", search_placeholder: "RECHERCHER LES ARCHIVES...", filter_quality: "Qualité", filter_type: "Type", stat_items: "Articles Totaux", stat_completed: "Terminés", stat_4k: "Contenu 4K", stat_missing: "Épisodes Manquants", empty: "Aucune donnée trouvée.", reset: "Réinitialiser"
    },
    community: {
      title: "Carte de Héros", tab_overview: "Aperçu", tab_history: "Histoire", tab_inventory: "Inventaire", tab_missions: "Missions", share: "Partager le Profil", stats_files: "Fichiers", stats_completed: "Terminés", stats_rate: "Taux", stats_xp: "XP"
    },
    studio: {
      title: "Studio Créatif", subtitle: "Suite de Production IA", tool_art: "Nano Banana Pro", tool_video: "Veo Motion", tool_scan: "Scanner de Données", execute: "Exécuter l'Agent"
    }
  },
  DE: {
    nav: {
      brand: "BIBLIOTHEK VON OTAKU", features: "Funktionen", roadmap: "Fahrplan", devlog: "DevLog", portal: "Portal-Login", beta: "Beta beitreten", library: "Archiv", guild: "Gilde", studio: "Studio", sync: "Online", logout: "Abmelden", system: "System v2.4.0-BETA"
    },
    hero: {
      presale: "Zeitlich Begrenzter Vorverkauf", title_prefix: "Dein Anime.", title_suffix: "Organisiert.", subtitle: "Zwei ehrliche Angebote: 'Bibliotheksgilde' (Premium + App) oder eine einmalige Desktop-App-Lizenz.", cta_buy: "Gründerpaket holen", cta_library_sub: "Bibliotheksgilde (Abo)", cta_app_only: "Nur Desktop-App", offer_hint: "Ein Firebase-Konto — anmelden in Blog, Tracker und Programmen.", cta_portal: "Web-Portal öffnen", license: "Windows 10/11 • Lebenslange Lizenz"
    },
    product: {
      roadmapTabToday: "Heute im Launcher", roadmapTabComing: "Demnächst", roadmapSubtitle: "Der Inhalt des Fahrplans richtet sich nach STATUS-Dokumenten.", roadmapFootnote: "Die ausgelieferten Module leben in kombinierten Repositories.", premiumKicker: "Vorher / Nachher", premiumTitle: "Kostenloser Tracker vs Abonnement", premiumFreeTitle: "Web-Tracker (kostenlos)", premiumSubTitle: "Gilde (Abo)", premiumFree1: "Manuelle Limits der Bibliothek.", premiumFree2: "Kein Premium ohne Serverbestätigung.", premiumFree3: "Desktop-App ist nicht enthalten.", premiumSub1: "Premium-Funktionen des Trackers aktiv.", premiumSub2: "Recht auf Desktop-App enthalten.", premiumSub3: "Nur der App-Kauf schaltet den Tracker nie frei.", hubButton: "Suite-Hub öffnen"
    },
    gateway: {
      title: "WÄHLE DEINE REALITÄT", subtitle: "Die Gamifizierte Anime-Bibliotheksplattform", region_lt_title: "Otaku Gildija", region_lt_desc: "Schließe dich der Anime-Community an.", region_eu_title: "Library of Otaku", region_eu_desc: "Der erweiterte Bibliotheksmanager für Sammler.", join: "Beitreten", enter: "Portal Betreten"
    },
    library: {
      title: "Gildenarchiv", subtitle: "Datenbankstatus: Aktiv", search_placeholder: "ARCHIV DURCHSUCHEN...", filter_quality: "Qualität", filter_type: "Typ", stat_items: "Gesamte Elemente", stat_completed: "Abgeschlossen", stat_4k: "4K-Inhalte", stat_missing: "Fehlende Eps", empty: "Keine Daten gefunden.", reset: "Zurücksetzen"
    },
    community: {
      title: "Heldenkarte", tab_overview: "Übersicht", tab_history: "Verlauf", tab_inventory: "Inventar", tab_missions: "Missionen", share: "Profil Teilen", stats_files: "Dateien", stats_completed: "Abgeschlossen", stats_rate: "Rate", stats_xp: "XP"
    },
    studio: {
      title: "Kreatives Studio", subtitle: "KI-Produktionssuite", tool_art: "Nano Banana Pro", tool_video: "Veo Motion", tool_scan: "Daten-Scanner", execute: "Agent Ausführen"
    }
  }
};

// Polyfill the LanguageProvider so we don't break the copied components
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Map useLanguage to react-i18next so copied components work seamlessly!
export const useLanguage = () => {
  const { t: i18nT, i18n } = useTranslation();
  
  return {
    language: i18n.language.toUpperCase() as Language,
    setLanguage: (lang: string) => i18n.changeLanguage(lang.toLowerCase()),
    t: (keyStr?: string) => {
      // The original components did `t.nav.brand`. 
      // i18next does `t('nav.brand')`. 
      // To not rewrite all components right now, we can return the nested object based on language.
      const langMap: Record<string, string> = {
        'lt': 'LT',
        'ja': 'JP',
        'es': 'ES',
        'pt': 'PT',
        'fr': 'FR',
        'de': 'DE'
      };
      
      const prefix = i18n.language?.substring(0, 2).toLowerCase() || 'en';
      const langKey = langMap[prefix] || 'EN';
      
      return translations[langKey as Language] || translations.EN;
    }
  };
};
