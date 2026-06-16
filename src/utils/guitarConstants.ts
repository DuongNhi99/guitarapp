import { NOTES_SHARP as NOTE_EN } from "./index";

export { NOTE_EN };

export const NOTE_VI = [
  "Đô", "Đô♯", "Rê", "Rê♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si",
];

export const OPEN_MIDI = [40, 45, 50, 55, 59, 64];
export const OPEN_LABELS_VI = ["Mi", "La", "Rê", "Sol", "Si", "Mi"];
export const OPEN_LABELS_EN = ["E2", "A2", "D3", "G3", "B3", "E4"];
export const STRING_THICKNESS = [4.2, 3.2, 2.4, 1.7, 1.1, 0.75];
export const NUM_FRETS = 14;
export const FRET_DOTS = new Set([3, 5, 7, 9, 12]);
export const DOUBLE_DOT_FRET = 12;

export function noteClass(midi: number) {
  return ((midi % 12) + 12) % 12;
}
export function getNoteName(midi: number, vi: boolean) {
  return vi ? NOTE_VI[noteClass(midi)] : NOTE_EN[noteClass(midi)];
}
export function isSharpNote(midi: number) {
  return NOTE_EN[noteClass(midi)].includes("#");
}
export function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export type MarkedKey = string;
export const mk = (s: number, f: number): MarkedKey => `${s}-${f}`;

export interface LastNote {
  vi: string;
  en: string;
  midi: number;
  si: number;
  fret: number;
}

export const CHORDS: Record<string, number[]> = {
  C: [-1, 3, 2, 0, 1, 0],
  Cm: [-1, 3, 5, 5, 4, 3],
  C7: [-1, 3, 2, 3, 1, 0],
  D: [-1, -1, 0, 2, 3, 2],
  Dm: [-1, -1, 0, 2, 3, 1],
  D7: [-1, -1, 0, 2, 1, 2],
  E: [0, 2, 2, 1, 0, 0],
  Em: [0, 2, 2, 0, 0, 0],
  E7: [0, 2, 0, 1, 0, 0],
  F: [1, 3, 3, 2, 1, 1],
  Fm: [1, 3, 3, 1, 1, 1],
  G: [3, 2, 0, 0, 0, 3],
  Gm: [3, 5, 5, 3, 3, 3],
  G7: [3, 2, 0, 0, 0, 1],
  A: [-1, 0, 2, 2, 2, 0],
  Am: [-1, 0, 2, 2, 1, 0],
  A7: [-1, 0, 2, 0, 2, 0],
  Am7: [-1, 0, 2, 0, 1, 0],
  B: [-1, 2, 4, 4, 4, 2],
  Bm: [-1, 2, 4, 4, 3, 2],
  B7: [-1, 2, 1, 2, 0, 2],
  Dm7: [-1, -1, 0, 2, 1, 1],
  "F#m": [2, 4, 4, 2, 2, 2],
  Bb: [-1, 1, 3, 3, 3, 1],
  "B°": [-1, 2, 3, 4, 3, -1],
  "E°": [0, 1, 2, 0, -1, -1],
  "F#°": [-1, -1, 4, 5, 4, 5],
};

export const CANON_PROGRESSIONS = [
  { key: "Am", chords: ["Am", "Dm", "G", "C", "F", "B°", "E7", "Am"] },
  { key: "C",  chords: ["C", "F", "B°", "Em", "Am", "Dm", "G7", "C"] },
  { key: "G",  chords: ["G", "C", "F#°", "Bm", "Em", "Am", "D7", "G"] },
  { key: "Em", chords: ["Em", "Am", "D", "G", "C", "F#°", "B7", "Em"] },
  { key: "F",  chords: ["F", "Bb", "E°", "Am", "Dm", "Gm", "C7", "F"] },
  { key: "Dm", chords: ["Dm", "Gm", "C", "F", "Bb", "E°", "A7", "Dm"] },
];

export const CHORD_GROUPS = [
  { label: "Canon",    names: [] as string[] },
  { label: "Trưởng",  names: ["C", "D", "E", "F", "G", "A", "B"] },
  { label: "Thứ",     names: ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"] },
  { label: "7",       names: ["C7", "D7", "E7", "G7", "A7", "B7", "Am7", "Dm7"] },
  { label: "Thang âm", names: [] as string[] },
];

export const SCALES: Record<string, { label: string; intervals: number[] }> = {
  major:            { label: "Trưởng (Major)",   intervals: [0, 2, 4, 5, 7, 9, 11] },
  natural_minor:    { label: "Thứ (Minor)",       intervals: [0, 2, 3, 5, 7, 8, 10] },
  pentatonic_major: { label: "Pentatonic Trưởng", intervals: [0, 2, 4, 7, 9] },
  pentatonic_minor: { label: "Pentatonic Thứ",    intervals: [0, 3, 5, 7, 10] },
  blues:            { label: "Blues",             intervals: [0, 3, 5, 6, 7, 10] },
  dorian:           { label: "Dorian",            intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian:         { label: "Phrygian",          intervals: [0, 1, 3, 5, 7, 8, 10] },
  mixolydian:       { label: "Mixolydian",        intervals: [0, 2, 4, 5, 7, 9, 10] },
};
