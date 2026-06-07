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

const W = 'https://upload.wikimedia.org/wikipedia/en'; // Wikimedia shorthand

export const GAMES: Game[] = [
  // ── Trending ──────────────────────────────────────────────
  {
    slug: 'marvels-spider-man-2',
    title: "Marvel's Spider-Man 2",
    genre: ['Action', 'Adventure'], developer: 'Insomniac Games', year: 2023,
    gradient: 'from-red-900 via-blue-900 to-slate-950',
    coverUrl: '/spiderman.jpg',
    trending: true, exclusive: true,
  },
  {
    slug: 'god-of-war-ragnarok',
    title: 'God of War: Ragnarök',
    genre: ['Action', 'Adventure'], developer: 'Santa Monica Studio', year: 2022,
    gradient: 'from-teal-900 via-slate-900 to-zinc-950',
    coverUrl: `${W}/7/7a/God_of_War_Ragnar%C3%B6k_cover.jpg`,
    trending: true, exclusive: false,
  },
  {
    slug: 'elden-ring',
    title: 'Elden Ring',
    genre: ['RPG', 'Action'], developer: 'FromSoftware', year: 2022,
    gradient: 'from-yellow-950 via-amber-900 to-stone-950',
    coverUrl: `${W}/b/b9/Elden_Ring_Box_art.jpg`,
    trending: true, exclusive: false,
  },
  {
    slug: 'hogwarts-legacy',
    title: 'Hogwarts Legacy',
    genre: ['RPG', 'Adventure'], developer: 'Avalanche Software', year: 2023,
    gradient: 'from-purple-900 via-indigo-900 to-slate-950',
    coverUrl: `${W}/4/4f/Hogwarts_Legacy_cover_art.jpg`,
    trending: true, exclusive: false,
  },
  {
    slug: 'black-myth-wukong',
    title: 'Black Myth: Wukong',
    genre: ['Action', 'RPG'], developer: 'Game Science', year: 2024,
    gradient: 'from-yellow-800 via-orange-900 to-stone-950',
    coverUrl: `${W}/8/86/Black_Myth_Wukong_cover_art.jpg`,
    trending: true, exclusive: false,
  },
  {
    slug: 'final-fantasy-vii-rebirth',
    title: 'Final Fantasy VII Rebirth',
    genre: ['RPG'], developer: 'Square Enix', year: 2024,
    gradient: 'from-emerald-900 via-blue-900 to-slate-950',
    coverUrl: `${W}/6/63/Final_Fantasy_VII_Rebirth.jpg`,
    trending: true, exclusive: true,
  },
  {
    slug: 'astro-bot',
    title: 'Astro Bot',
    genre: ['Platformer'], developer: 'Team Asobi', year: 2024,
    gradient: 'from-blue-700 via-cyan-800 to-slate-900',
    coverUrl: `${W}/1/1c/Astro_Bot_cover_art.jpg`,
    trending: true, exclusive: true,
  },
  {
    slug: 'tekken-8',
    title: 'Tekken 8',
    genre: ['Fighting'], developer: 'Bandai Namco', year: 2024,
    gradient: 'from-slate-900 via-yellow-950 to-zinc-950',
    coverUrl: `${W}/9/9c/Tekken8coverart.jpg`,
    trending: true, exclusive: false,
  },

  // ── Action / Adventure ───────────────────────────────────
  {
    slug: 'ratchet-and-clank-rift-apart',
    title: 'Ratchet & Clank: Rift Apart',
    genre: ['Action', 'Platformer'], developer: 'Insomniac Games', year: 2021,
    gradient: 'from-orange-800 via-purple-900 to-slate-950',
    coverUrl: `${W}/5/55/Ratchet_%26_Clank_Rift_Apart_cover_art.jpg`,
    exclusive: true,
  },
  {
    slug: 'horizon-forbidden-west',
    title: 'Horizon Forbidden West',
    genre: ['Action', 'RPG'], developer: 'Guerrilla Games', year: 2022,
    gradient: 'from-emerald-800 via-blue-900 to-slate-950',
    coverUrl: `${W}/8/88/Horizon_Forbidden_West_cover_art.jpg`,
  },
  {
    slug: 'ghost-of-tsushima',
    title: 'Ghost of Tsushima',
    genre: ['Action', 'Adventure'], developer: 'Sucker Punch', year: 2020,
    gradient: 'from-red-900 via-zinc-900 to-black',
    coverUrl: `${W}/6/61/Ghost_of_tsushima_cover_art.jpg`,
  },
  {
    slug: 'the-last-of-us-part-i',
    title: 'The Last of Us Part I',
    genre: ['Action', 'Adventure'], developer: 'Naughty Dog', year: 2022,
    gradient: 'from-stone-800 via-green-950 to-zinc-950',
    coverUrl: `${W}/5/56/The_Last_of_Us_Part_I_cover_art.jpg`,
  },
  {
    slug: 'the-last-of-us-part-ii',
    title: 'The Last of Us Part II Rem.',
    genre: ['Action', 'Adventure'], developer: 'Naughty Dog', year: 2024,
    gradient: 'from-green-950 via-slate-900 to-zinc-950',
  },
  {
    slug: 'death-stranding',
    title: 'Death Stranding DC',
    genre: ['Action', 'Adventure'], developer: 'Kojima Productions', year: 2021,
    gradient: 'from-yellow-900 via-slate-900 to-black',
    coverUrl: `${W}/2/22/Death_Stranding_Director%27s_Cut_cover_art.jpg`,
  },
  {
    slug: 'returnal',
    title: 'Returnal',
    genre: ['Action'], developer: 'Housemarque', year: 2021,
    gradient: 'from-purple-900 via-indigo-950 to-black',
    coverUrl: `${W}/5/59/Returnal_cover_art.jpg`,
    exclusive: true,
  },
  {
    slug: 'deathloop',
    title: 'Deathloop',
    genre: ['Action'], developer: 'Arkane Studios', year: 2021,
    gradient: 'from-orange-800 via-zinc-900 to-black',
    coverUrl: `${W}/b/b4/Deathloop_cover.jpg`,
  },
  {
    slug: 'ghostwire-tokyo',
    title: 'Ghostwire: Tokyo',
    genre: ['Action', 'Adventure'], developer: 'Tango Gameworks', year: 2022,
    gradient: 'from-blue-900 via-indigo-950 to-zinc-950',
  },
  {
    slug: 'star-wars-jedi-survivor',
    title: 'Star Wars Jedi: Survivor',
    genre: ['Action', 'Adventure'], developer: 'Respawn', year: 2023,
    gradient: 'from-orange-900 via-slate-900 to-zinc-950',
  },
  {
    slug: 'assassins-creed-mirage',
    title: "Assassin's Creed Mirage",
    genre: ['Action', 'Adventure'], developer: 'Ubisoft', year: 2023,
    gradient: 'from-amber-900 via-orange-950 to-stone-950',
  },
  {
    slug: 'dying-light-2',
    title: 'Dying Light 2',
    genre: ['Action', 'Adventure'], developer: 'Techland', year: 2022,
    gradient: 'from-green-950 via-zinc-900 to-black',
    coverUrl: `${W}/4/4c/Dying_Light_2_Stay_Human.jpg`,
  },
  {
    slug: 'a-plague-tale-requiem',
    title: 'A Plague Tale: Requiem',
    genre: ['Action', 'Adventure'], developer: 'Asobo Studio', year: 2022,
    gradient: 'from-stone-800 via-red-950 to-zinc-950',
    coverUrl: `${W}/8/87/A_Plague_Tale_Requiem.jpg`,
  },
  {
    slug: 'armored-core-vi',
    title: 'Armored Core VI',
    genre: ['Action'], developer: 'FromSoftware', year: 2023,
    gradient: 'from-gray-800 via-slate-900 to-zinc-950',
    coverUrl: `${W}/3/37/Armored_Core_VI_cover_art.jpg`,
  },
  {
    slug: 'call-of-duty-black-ops-6',
    title: 'Call of Duty: Black Ops 6',
    genre: ['Action'], developer: 'Treyarch', year: 2024,
    gradient: 'from-zinc-900 via-orange-950 to-black',
    coverUrl: `${W}/8/88/Call_of_Duty_Black_Ops_6_cover_art.jpg`,
  },

  // ── RPG ──────────────────────────────────────────────────
  {
    slug: 'final-fantasy-xvi',
    title: 'Final Fantasy XVI',
    genre: ['RPG', 'Action'], developer: 'Square Enix', year: 2023,
    gradient: 'from-slate-900 via-orange-950 to-blue-950',
    coverUrl: `${W}/7/71/Final_Fantasy_XVI_cover_art.jpg`,
    exclusive: true,
  },
  {
    slug: 'final-fantasy-vii-remake',
    title: 'Final Fantasy VII Remake',
    genre: ['RPG', 'Action'], developer: 'Square Enix', year: 2021,
    gradient: 'from-blue-900 via-purple-950 to-slate-950',
    coverUrl: `${W}/b/bf/Final_Fantasy_VII_Remake_Box_Art.jpg`,
  },
  {
    slug: 'persona-5-royal',
    title: 'Persona 5 Royal',
    genre: ['RPG'], developer: 'Atlus', year: 2022,
    gradient: 'from-red-900 via-black to-zinc-950',
    coverUrl: `${W}/d/d5/Persona5Royal.jpg`,
  },
  {
    slug: 'dragons-dogma-2',
    title: "Dragon's Dogma 2",
    genre: ['RPG', 'Action'], developer: 'Capcom', year: 2024,
    gradient: 'from-red-950 via-stone-900 to-zinc-950',
    coverUrl: `${W}/0/05/Dragon%27s_Dogma_2_cover_art.jpg`,
  },
  {
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    genre: ['RPG'], developer: 'Larian Studios', year: 2023,
    gradient: 'from-purple-900 via-blue-950 to-zinc-950',
    coverUrl: `${W}/9/93/Baldur%27s_Gate_3_official_cover_art.jpg`,
  },
  {
    slug: 'tales-of-arise',
    title: 'Tales of Arise',
    genre: ['RPG', 'Action'], developer: 'Bandai Namco', year: 2021,
    gradient: 'from-orange-800 via-purple-900 to-slate-950',
  },
  {
    slug: 'metaphor-refantazio',
    title: 'Metaphor: ReFantazio',
    genre: ['RPG'], developer: 'Atlus', year: 2024,
    gradient: 'from-blue-950 via-red-950 to-zinc-950',
  },
  {
    slug: 'dragon-age-veilguard',
    title: 'Dragon Age: The Veilguard',
    genre: ['RPG', 'Action'], developer: 'BioWare', year: 2024,
    gradient: 'from-indigo-900 via-purple-950 to-slate-950',
    coverUrl: `${W}/a/aa/Dragon_Age_The_Veilguard_cover_art.jpg`,
  },
  {
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    genre: ['RPG', 'Action'], developer: 'CD Projekt Red', year: 2020,
    gradient: 'from-yellow-800 via-blue-950 to-zinc-950',
    coverUrl: `${W}/9/9f/Cyberpunk_2077_box_art.jpg`,
  },
  {
    slug: 'sekiro',
    title: 'Sekiro: Shadows Die Twice',
    genre: ['Action', 'RPG'], developer: 'FromSoftware', year: 2019,
    gradient: 'from-red-950 via-stone-900 to-zinc-950',
    coverUrl: `${W}/6/6e/Sekiro_art.jpg`,
  },

  // ── Sports ───────────────────────────────────────────────
  {
    slug: 'ea-sports-fc-25',
    title: 'EA Sports FC 25',
    genre: ['Sports'], developer: 'EA Sports', year: 2024,
    gradient: 'from-green-900 via-emerald-950 to-zinc-950',
    coverUrl: `${W}/6/60/EA_Sports_FC_25_cover_art.jpg`,
  },
  {
    slug: 'nba-2k25',
    title: 'NBA 2K25',
    genre: ['Sports'], developer: '2K Sports', year: 2024,
    gradient: 'from-orange-900 via-red-950 to-zinc-950',
  },
  {
    slug: 'gran-turismo-7',
    title: 'Gran Turismo 7',
    genre: ['Racing', 'Sports'], developer: 'Polyphony Digital', year: 2022,
    gradient: 'from-blue-900 via-red-950 to-zinc-950',
    coverUrl: `${W}/a/a8/Gran_Turismo_7_cover.jpg`,
    exclusive: true,
  },
  {
    slug: 'f1-24',
    title: 'F1 24',
    genre: ['Racing', 'Sports'], developer: 'Codemasters', year: 2024,
    gradient: 'from-red-900 via-slate-900 to-zinc-950',
    coverUrl: `${W}/f/f6/F1_24_cover_art.jpg`,
  },
  {
    slug: 'wwe-2k24',
    title: 'WWE 2K24',
    genre: ['Sports', 'Fighting'], developer: '2K Sports', year: 2024,
    gradient: 'from-zinc-900 via-yellow-950 to-black',
    coverUrl: `${W}/7/77/WWE_2K24_cover.jpg`,
  },
  {
    slug: 'ea-sports-fc-24',
    title: 'EA Sports FC 24',
    genre: ['Sports'], developer: 'EA Sports', year: 2023,
    gradient: 'from-green-950 via-slate-900 to-zinc-950',
  },

  // ── Horror ───────────────────────────────────────────────
  {
    slug: 'resident-evil-village',
    title: 'Resident Evil Village',
    genre: ['Horror', 'Action'], developer: 'Capcom', year: 2021,
    gradient: 'from-green-950 via-stone-900 to-black',
    coverUrl: `${W}/4/40/Resident_Evil_Village_cover_art.jpg`,
  },
  {
    slug: 'resident-evil-4-remake',
    title: 'Resident Evil 4',
    genre: ['Horror', 'Action'], developer: 'Capcom', year: 2023,
    gradient: 'from-stone-800 via-orange-950 to-zinc-950',
    coverUrl: `${W}/0/05/Resident_Evil_4_remake_cover_art.jpg`,
  },
  {
    slug: 'dead-space',
    title: 'Dead Space',
    genre: ['Horror', 'Action'], developer: 'Motive Studio', year: 2023,
    gradient: 'from-slate-950 via-blue-950 to-black',
    coverUrl: `${W}/8/83/Dead_Space_2023_cover_art.jpg`,
  },
  {
    slug: 'the-callisto-protocol',
    title: 'The Callisto Protocol',
    genre: ['Horror'], developer: 'Striking Distance', year: 2022,
    gradient: 'from-gray-900 via-green-950 to-black',
    coverUrl: `${W}/e/e5/The_Callisto_Protocol_cover.jpg`,
  },
  {
    slug: 'alan-wake-2',
    title: 'Alan Wake 2',
    genre: ['Horror', 'Adventure'], developer: 'Remedy Entertainment', year: 2023,
    gradient: 'from-blue-950 via-slate-900 to-zinc-950',
    coverUrl: `${W}/5/52/Alan_Wake_2_cover_art.jpg`,
  },
  {
    slug: 'silent-hill-2',
    title: 'Silent Hill 2 (Remake)',
    genre: ['Horror'], developer: 'Bloober Team', year: 2024,
    gradient: 'from-gray-800 via-stone-900 to-zinc-950',
    coverUrl: `${W}/4/42/Silent_Hill_2_2024_game_cover_art.jpg`,
  },

  // ── Fighting ─────────────────────────────────────────────
  {
    slug: 'mortal-kombat-1',
    title: 'Mortal Kombat 1',
    genre: ['Fighting'], developer: 'NetherRealm', year: 2023,
    gradient: 'from-red-950 via-zinc-900 to-black',
    coverUrl: `${W}/4/42/Mortal_Kombat_1_cover_art.jpg`,
  },
  {
    slug: 'street-fighter-6',
    title: 'Street Fighter 6',
    genre: ['Fighting'], developer: 'Capcom', year: 2023,
    gradient: 'from-red-800 via-blue-900 to-zinc-950',
    coverUrl: `${W}/e/e7/Street_Fighter_6_cover_art.jpg`,
  },
  {
    slug: 'dragon-ball-sparking-zero',
    title: 'Dragon Ball: Sparking! Zero',
    genre: ['Fighting', 'Action'], developer: 'Bandai Namco', year: 2024,
    gradient: 'from-orange-800 via-yellow-900 to-zinc-950',
    coverUrl: `${W}/d/d1/Dragon_Ball_Sparking_Zero_cover_art.jpg`,
  },

  // ── Platformer ───────────────────────────────────────────
  {
    slug: 'crash-bandicoot-4',
    title: 'Crash Bandicoot 4',
    genre: ['Platformer'], developer: 'Toys for Bob', year: 2021,
    gradient: 'from-orange-700 via-blue-900 to-zinc-950',
  },
  {
    slug: 'sonic-frontiers',
    title: 'Sonic Frontiers',
    genre: ['Platformer', 'Action'], developer: 'Sonic Team', year: 2022,
    gradient: 'from-blue-800 via-teal-900 to-slate-950',
  },
  {
    slug: 'sackboy-a-big-adventure',
    title: 'Sackboy: A Big Adventure',
    genre: ['Platformer'], developer: 'Sumo Digital', year: 2020,
    gradient: 'from-yellow-700 via-blue-800 to-purple-950',
    coverUrl: `${W}/3/38/Sackboy_-_A_Big_Adventure_cover_art.jpg`,
    exclusive: true,
  },

  // ── Racing ───────────────────────────────────────────────
  {
    slug: 'need-for-speed-unbound',
    title: 'Need for Speed Unbound',
    genre: ['Racing'], developer: 'Criterion Games', year: 2022,
    gradient: 'from-purple-900 via-zinc-900 to-black',
    coverUrl: `${W}/a/a5/Need_for_Speed_Unbound_cover_art.jpg`,
  },

  // ── Adventure / Indie ────────────────────────────────────
  {
    slug: 'kena-bridge-of-spirits',
    title: 'Kena: Bridge of Spirits',
    genre: ['Adventure', 'Action'], developer: 'Ember Lab', year: 2021,
    gradient: 'from-emerald-800 via-purple-900 to-slate-950',
    coverUrl: `${W}/3/3c/Kena_Bridge_of_Spirits_cover_art.jpg`,
    exclusive: true,
  },
  {
    slug: 'stray',
    title: 'Stray',
    genre: ['Adventure'], developer: 'BlueTwelve Studio', year: 2022,
    gradient: 'from-blue-900 via-purple-950 to-zinc-950',
    coverUrl: `${W}/8/82/Stray_%28video_game%29_cover.jpg`,
  },
  {
    slug: 'it-takes-two',
    title: 'It Takes Two',
    genre: ['Adventure', 'Action'], developer: 'Hazelight Studios', year: 2021,
    gradient: 'from-pink-800 via-purple-800 to-blue-950',
  },
  {
    slug: 'sifu',
    title: 'Sifu',
    genre: ['Action'], developer: 'Sloclap', year: 2022,
    gradient: 'from-orange-900 via-red-950 to-zinc-950',
  },
  {
    slug: 'detroit-become-human',
    title: 'Detroit: Become Human',
    genre: ['Adventure'], developer: 'Quantic Dream', year: 2022,
    gradient: 'from-blue-900 via-slate-900 to-zinc-950',
    coverUrl: `${W}/7/75/Detroit_Become_Human_cover_art.jpg`,
  },
];
