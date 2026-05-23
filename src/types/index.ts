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

export interface SearchFilters {
  query: string;
  rhythm?: string;
  genre?: string;
  tone?: string;
  chord?: string;
}
