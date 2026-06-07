export interface Game {
  slug: string;
  title: string;
  genre: string[];
  developer: string;
  year: number;
  gradient: string;
  coverUrl?: string;
  trending?: boolean;
  exclusive?: boolean;
}

export const GENRES = ['All', 'Action', 'RPG', 'Sports', 'Horror', 'Fighting', 'Adventure', 'Racing', 'Platformer'] as const;
export type Genre = typeof GENRES[number];

const S = (id: number) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`;

export const GAMES: Game[] = [
  // ── Trending ──────────────────────────────────────────────
  {
    slug: 'marvels-spider-man-2',
    title: "Marvel's Spider-Man 2",
    genre: ['Action', 'Adventure'], developer: 'Insomniac Games', year: 2023,
    gradient: 'from-red-900 via-blue-900 to-slate-950',
    coverUrl: S(2651280),
    trending: true, exclusive: true,
  },
  {
    slug: 'god-of-war-ragnarok',
    title: 'God of War: Ragnarök',
    genre: ['Action', 'Adventure'], developer: 'Santa Monica Studio', year: 2022,
    gradient: 'from-teal-900 via-slate-900 to-zinc-950',
    coverUrl: S(2322010),
    trending: true, exclusive: false,
  },
  {
    slug: 'elden-ring',
    title: 'Elden Ring',
    genre: ['RPG', 'Action'], developer: 'FromSoftware', year: 2022,
    gradient: 'from-yellow-950 via-amber-900 to-stone-950',
    coverUrl: S(1245620),
    trending: true, exclusive: false,
  },
  {
    slug: 'hogwarts-legacy',
    title: 'Hogwarts Legacy',
    genre: ['RPG', 'Adventure'], developer: 'Avalanche Software', year: 2023,
    gradient: 'from-purple-900 via-indigo-900 to-slate-950',
    coverUrl: S(990080),
    trending: true, exclusive: false,
  },
  {
    slug: 'black-myth-wukong',
    title: 'Black Myth: Wukong',
    genre: ['Action', 'RPG'], developer: 'Game Science', year: 2024,
    gradient: 'from-yellow-800 via-orange-900 to-stone-950',
    coverUrl: S(2358720),
    trending: true, exclusive: false,
  },
  {
    slug: 'final-fantasy-vii-rebirth',
    title: 'Final Fantasy VII Rebirth',
    genre: ['RPG'], developer: 'Square Enix', year: 2024,
    gradient: 'from-emerald-900 via-blue-900 to-slate-950',
    coverUrl: S(2909400),
    trending: true, exclusive: true,
  },
  {
    slug: 'tekken-8',
    title: 'Tekken 8',
    genre: ['Fighting'], developer: 'Bandai Namco', year: 2024,
    gradient: 'from-slate-900 via-yellow-950 to-zinc-950',
    coverUrl: S(1778820),
    trending: true, exclusive: false,
  },

  // ── Action / Adventure ───────────────────────────────────
  {
    slug: 'ratchet-and-clank-rift-apart',
    title: 'Ratchet & Clank: Rift Apart',
    genre: ['Action', 'Platformer'], developer: 'Insomniac Games', year: 2021,
    gradient: 'from-orange-800 via-purple-900 to-slate-950',
    coverUrl: S(1895840),
    exclusive: true,
  },
  {
    slug: 'horizon-forbidden-west',
    title: 'Horizon Forbidden West',
    genre: ['Action', 'RPG'], developer: 'Guerrilla Games', year: 2022,
    gradient: 'from-emerald-800 via-blue-900 to-slate-950',
    coverUrl: S(2420110),
  },
  {
    slug: 'ghost-of-tsushima',
    title: 'Ghost of Tsushima',
    genre: ['Action', 'Adventure'], developer: 'Sucker Punch', year: 2020,
    gradient: 'from-red-900 via-zinc-900 to-black',
    coverUrl: S(2215430),
  },
  {
    slug: 'the-last-of-us-part-i',
    title: 'The Last of Us Part I',
    genre: ['Action', 'Adventure'], developer: 'Naughty Dog', year: 2022,
    gradient: 'from-stone-800 via-green-950 to-zinc-950',
    coverUrl: S(1888930),
  },
  {
    slug: 'the-last-of-us-part-ii',
    title: 'The Last of Us Part II Rem.',
    genre: ['Action', 'Adventure'], developer: 'Naughty Dog', year: 2024,
    gradient: 'from-green-950 via-slate-900 to-zinc-950',
    coverUrl: S(2531310),
  },
  {
    slug: 'death-stranding',
    title: 'Death Stranding DC',
    genre: ['Action', 'Adventure'], developer: 'Kojima Productions', year: 2021,
    gradient: 'from-yellow-900 via-slate-900 to-black',
    coverUrl: S(1850570),
  },
  {
    slug: 'returnal',
    title: 'Returnal',
    genre: ['Action'], developer: 'Housemarque', year: 2021,
    gradient: 'from-purple-900 via-indigo-950 to-black',
    coverUrl: S(1649240),
    exclusive: true,
  },
  {
    slug: 'deathloop',
    title: 'Deathloop',
    genre: ['Action'], developer: 'Arkane Studios', year: 2021,
    gradient: 'from-orange-800 via-zinc-900 to-black',
    coverUrl: S(1252330),
  },
  {
    slug: 'ghostwire-tokyo',
    title: 'Ghostwire: Tokyo',
    genre: ['Action', 'Adventure'], developer: 'Tango Gameworks', year: 2022,
    gradient: 'from-blue-900 via-indigo-950 to-zinc-950',
    coverUrl: S(1475810),
  },
  {
    slug: 'star-wars-jedi-survivor',
    title: 'Star Wars Jedi: Survivor',
    genre: ['Action', 'Adventure'], developer: 'Respawn', year: 2023,
    gradient: 'from-orange-900 via-slate-900 to-zinc-950',
    coverUrl: S(1774580),
  },
  {
    slug: 'assassins-creed-mirage',
    title: "Assassin's Creed Mirage",
    genre: ['Action', 'Adventure'], developer: 'Ubisoft', year: 2023,
    gradient: 'from-amber-900 via-orange-950 to-stone-950',
    coverUrl: S(3035570),
  },
  {
    slug: 'dying-light-2',
    title: 'Dying Light 2',
    genre: ['Action', 'Adventure'], developer: 'Techland', year: 2022,
    gradient: 'from-green-950 via-zinc-900 to-black',
    coverUrl: S(534380),
  },
  {
    slug: 'a-plague-tale-requiem',
    title: 'A Plague Tale: Requiem',
    genre: ['Action', 'Adventure'], developer: 'Asobo Studio', year: 2022,
    gradient: 'from-stone-800 via-red-950 to-zinc-950',
    coverUrl: S(1182900),
  },
  {
    slug: 'armored-core-vi',
    title: 'Armored Core VI',
    genre: ['Action'], developer: 'FromSoftware', year: 2023,
    gradient: 'from-gray-800 via-slate-900 to-zinc-950',
    coverUrl: S(1888160),
  },

  // ── RPG ──────────────────────────────────────────────────
  {
    slug: 'final-fantasy-xvi',
    title: 'Final Fantasy XVI',
    genre: ['RPG', 'Action'], developer: 'Square Enix', year: 2023,
    gradient: 'from-slate-900 via-orange-950 to-blue-950',
    coverUrl: S(1903340),
    exclusive: true,
  },
  {
    slug: 'final-fantasy-vii-remake',
    title: 'Final Fantasy VII Remake',
    genre: ['RPG', 'Action'], developer: 'Square Enix', year: 2021,
    gradient: 'from-blue-900 via-purple-950 to-slate-950',
    coverUrl: S(1462040),
  },
  {
    slug: 'persona-5-royal',
    title: 'Persona 5 Royal',
    genre: ['RPG'], developer: 'Atlus', year: 2022,
    gradient: 'from-red-900 via-black to-zinc-950',
    coverUrl: S(1687950),
  },
  {
    slug: 'dragons-dogma-2',
    title: "Dragon's Dogma 2",
    genre: ['RPG', 'Action'], developer: 'Capcom', year: 2024,
    gradient: 'from-red-950 via-stone-900 to-zinc-950',
    coverUrl: S(2054970),
  },
  {
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    genre: ['RPG'], developer: 'Larian Studios', year: 2023,
    gradient: 'from-purple-900 via-blue-950 to-zinc-950',
    coverUrl: S(1086940),
  },
  {
    slug: 'tales-of-arise',
    title: 'Tales of Arise',
    genre: ['RPG', 'Action'], developer: 'Bandai Namco', year: 2021,
    gradient: 'from-orange-800 via-purple-900 to-slate-950',
    coverUrl: S(1467360),
  },
  {
    slug: 'metaphor-refantazio',
    title: 'Metaphor: ReFantazio',
    genre: ['RPG'], developer: 'Atlus', year: 2024,
    gradient: 'from-blue-950 via-red-950 to-zinc-950',
    coverUrl: S(2679460),
  },
  {
    slug: 'dragon-age-veilguard',
    title: 'Dragon Age: The Veilguard',
    genre: ['RPG', 'Action'], developer: 'BioWare', year: 2024,
    gradient: 'from-indigo-900 via-purple-950 to-slate-950',
    coverUrl: S(1845910),
  },
  {
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    genre: ['RPG', 'Action'], developer: 'CD Projekt Red', year: 2020,
    gradient: 'from-yellow-800 via-blue-950 to-zinc-950',
    coverUrl: S(1091500),
  },
  {
    slug: 'sekiro',
    title: 'Sekiro: Shadows Die Twice',
    genre: ['Action', 'RPG'], developer: 'FromSoftware', year: 2019,
    gradient: 'from-red-950 via-stone-900 to-zinc-950',
    coverUrl: S(814380),
  },

  // ── Sports ───────────────────────────────────────────────
  {
    slug: 'ea-sports-fc-25',
    title: 'EA Sports FC 25',
    genre: ['Sports'], developer: 'EA Sports', year: 2024,
    gradient: 'from-green-900 via-emerald-950 to-zinc-950',
    coverUrl: S(2669320),
  },
  {
    slug: 'nba-2k25',
    title: 'NBA 2K25',
    genre: ['Sports'], developer: '2K Sports', year: 2024,
    gradient: 'from-orange-900 via-red-950 to-zinc-950',
    coverUrl: S(2878980),
  },
  {
    slug: 'forza-horizon-6',
    title: 'Forza Horizon 6',
    genre: ['Racing'], developer: 'Playground Games', year: 2025,
    gradient: 'from-orange-800 via-red-900 to-zinc-950',
    coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/2483190/library_hero.jpg`,
    trending: true,
  },
  {
    slug: 'f1-24',
    title: 'F1 24',
    genre: ['Racing', 'Sports'], developer: 'Codemasters', year: 2024,
    gradient: 'from-red-900 via-slate-900 to-zinc-950',
    coverUrl: S(2488620),
  },
  {
    slug: 'wwe-2k24',
    title: 'WWE 2K24',
    genre: ['Sports', 'Fighting'], developer: '2K Sports', year: 2024,
    gradient: 'from-zinc-900 via-yellow-950 to-black',
    coverUrl: S(2315690),
  },
  {
    slug: 'ea-sports-fc-24',
    title: 'EA Sports FC 24',
    genre: ['Sports'], developer: 'EA Sports', year: 2023,
    gradient: 'from-green-950 via-slate-900 to-zinc-950',
    coverUrl: S(2195250),
  },

  // ── Horror ───────────────────────────────────────────────
  {
    slug: 'resident-evil-village',
    title: 'Resident Evil Village',
    genre: ['Horror', 'Action'], developer: 'Capcom', year: 2021,
    gradient: 'from-green-950 via-stone-900 to-black',
    coverUrl: S(1196590),
  },
  {
    slug: 'resident-evil-4-remake',
    title: 'Resident Evil 4',
    genre: ['Horror', 'Action'], developer: 'Capcom', year: 2023,
    gradient: 'from-stone-800 via-orange-950 to-zinc-950',
    coverUrl: S(2050650),
  },
  {
    slug: 'dead-space',
    title: 'Dead Space',
    genre: ['Horror', 'Action'], developer: 'Motive Studio', year: 2023,
    gradient: 'from-slate-950 via-blue-950 to-black',
    coverUrl: S(1693980),
  },
  {
    slug: 'the-callisto-protocol',
    title: 'The Callisto Protocol',
    genre: ['Horror'], developer: 'Striking Distance', year: 2022,
    gradient: 'from-gray-900 via-green-950 to-black',
    coverUrl: S(1544020),
  },
  {
    slug: 'alan-wake-2',
    title: 'Alan Wake 2',
    genre: ['Horror', 'Adventure'], developer: 'Remedy Entertainment', year: 2023,
    gradient: 'from-blue-950 via-slate-900 to-zinc-950',
    coverUrl: S(1250410),
  },
  {
    slug: 'silent-hill-2',
    title: 'Silent Hill 2 (Remake)',
    genre: ['Horror'], developer: 'Bloober Team', year: 2024,
    gradient: 'from-gray-800 via-stone-900 to-zinc-950',
    coverUrl: S(2124490),
  },

  // ── Fighting ─────────────────────────────────────────────
  {
    slug: 'mortal-kombat-1',
    title: 'Mortal Kombat 1',
    genre: ['Fighting'], developer: 'NetherRealm', year: 2023,
    gradient: 'from-red-950 via-zinc-900 to-black',
    coverUrl: S(1971870),
  },
  {
    slug: 'street-fighter-6',
    title: 'Street Fighter 6',
    genre: ['Fighting'], developer: 'Capcom', year: 2023,
    gradient: 'from-red-800 via-blue-900 to-zinc-950',
    coverUrl: S(1685030),
  },
  {
    slug: 'dragon-ball-sparking-zero',
    title: 'Dragon Ball: Sparking! Zero',
    genre: ['Fighting', 'Action'], developer: 'Bandai Namco', year: 2024,
    gradient: 'from-orange-800 via-yellow-900 to-zinc-950',
    coverUrl: S(1790600),
  },

  // ── Platformer ───────────────────────────────────────────
  {
    slug: 'crash-bandicoot-4',
    title: 'Crash Bandicoot 4',
    genre: ['Platformer'], developer: 'Toys for Bob', year: 2021,
    gradient: 'from-orange-700 via-blue-900 to-zinc-950',
    coverUrl: S(1378990),
  },
  {
    slug: 'sonic-frontiers',
    title: 'Sonic Frontiers',
    genre: ['Platformer', 'Action'], developer: 'Sonic Team', year: 2022,
    gradient: 'from-blue-800 via-teal-900 to-slate-950',
    coverUrl: S(1237320),
  },
  {
    slug: 'sackboy-a-big-adventure',
    title: 'Sackboy: A Big Adventure',
    genre: ['Platformer'], developer: 'Sumo Digital', year: 2020,
    gradient: 'from-yellow-700 via-blue-800 to-purple-950',
    coverUrl: S(1599660),
  },

  // ── Racing ───────────────────────────────────────────────
  {
    slug: 'need-for-speed-unbound',
    title: 'Need for Speed Unbound',
    genre: ['Racing'], developer: 'Criterion Games', year: 2022,
    gradient: 'from-purple-900 via-zinc-900 to-black',
    coverUrl: S(1846380),
  },

  // ── Adventure / Indie ────────────────────────────────────
  {
    slug: 'kena-bridge-of-spirits',
    title: 'Kena: Bridge of Spirits',
    genre: ['Adventure', 'Action'], developer: 'Ember Lab', year: 2021,
    gradient: 'from-emerald-800 via-purple-900 to-slate-950',
    coverUrl: S(1954200),
    exclusive: true,
  },
  {
    slug: 'stray',
    title: 'Stray',
    genre: ['Adventure'], developer: 'BlueTwelve Studio', year: 2022,
    gradient: 'from-blue-900 via-purple-950 to-zinc-950',
    coverUrl: S(1332010),
  },
  {
    slug: 'it-takes-two',
    title: 'It Takes Two',
    genre: ['Adventure', 'Action'], developer: 'Hazelight Studios', year: 2021,
    gradient: 'from-pink-800 via-purple-800 to-blue-950',
    coverUrl: S(1426210),
  },
  {
    slug: 'sifu',
    title: 'Sifu',
    genre: ['Action'], developer: 'Sloclap', year: 2022,
    gradient: 'from-orange-900 via-red-950 to-zinc-950',
    coverUrl: S(1260780),
  },
  {
    slug: 'detroit-become-human',
    title: 'Detroit: Become Human',
    genre: ['Adventure'], developer: 'Quantic Dream', year: 2022,
    gradient: 'from-blue-900 via-slate-900 to-zinc-950',
    coverUrl: S(1222140),
  },
];
