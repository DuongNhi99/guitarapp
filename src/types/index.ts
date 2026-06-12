export interface Song {
  id: number;
  title: string;
  slug: string;
  artist: Artist;
  contributors: string[];
  rhythm: Rhythm;
  genre: Genre;
  tone: string;
  capo?: number;
  chords: string[];
  content: string; // lyrics with chord markers [[CHORD]]
  views: number;
  likes: number;
  createdAt: string;
  youtubeId?: string;
  sheetImage?: string;
  tags: string[];
}

export interface Artist {
  id: number;
  name: string;
  slug: string;
  songCount?: number;
}

export interface Rhythm {
  id: string;
  name: string;
  songCount?: number;
}

export interface Genre {
  id: string;
  name: string;
  songCount?: number;
}

export interface ChordDiagram {
  name: string;
  frets: number[]; // -1 = muted, 0 = open, 1-4 = fret number
  fingers: number[];
  baseFret: number;
  barres?: { fromString: number; toString: number; fret: number }[];
}

export interface Playlist {
  id: number;
  title: string;
  description: string;
  songs: number[];
  coverSong?: Song;
  createdBy: string;
  createdAt: string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Sheet {
  id: number;
  songId: number;
  title: string;
  slug: string;
  artist: Artist;
  tone: string;
  capo: number;
  rhythm: Rhythm;
  genre: Genre;
  instruments: string[];
  difficulty: Difficulty;
  pages: number;
  downloads: number;
  likes: number;
  views: number;
  createdAt: string;
  contributors: string[];
  chords: string[];
  content: string;
  tags: string[];
}

export interface SearchFilters {
  query: string;
  rhythm?: string;
  genre?: string;
  tone?: string;
  chord?: string;
}
