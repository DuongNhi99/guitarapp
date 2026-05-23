import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Parse song content with chord markers [[CHORD]] into structured tokens
 */
export interface Token {
  type: "text" | "chord" | "newline" | "section";
  value: string;
}

export function parseChordContent(content: string): Token[][] {
  const lines = content.split("\n");
  return lines.map((line) => {
    // Section headers like [Verse 1], [Chorus]
    if (/^\[.+\]$/.test(line.trim())) {
      return [{ type: "section", value: line.trim().slice(1, -1) }];
    }

    const tokens: Token[] = [];
    const regex = /\[\[([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          value: line.slice(lastIndex, match.index),
        });
      }
      tokens.push({ type: "chord", value: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      tokens.push({ type: "text", value: line.slice(lastIndex) });
    }

    if (tokens.length === 0 && line === "") {
      return [{ type: "newline", value: "" }];
    }

    return tokens;
  });
}

// Transpose utilities
const NOTES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const NOTES_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;

  const noteRegex = /^([A-G][#b]?)(.*)/;
  const match = chord.match(noteRegex);
  if (!match) return chord;

  const rootNote = match[1];
  const suffix = match[2];

  let noteIndex = NOTES_SHARP.indexOf(rootNote);
  if (noteIndex === -1) noteIndex = NOTES_FLAT.indexOf(rootNote);
  if (noteIndex === -1) return chord;

  const newIndex = (((noteIndex + semitones) % 12) + 12) % 12;
  const newNote = semitones > 0 ? NOTES_SHARP[newIndex] : NOTES_FLAT[newIndex];

  return newNote + suffix;
}

export function transposeChordProgression(
  chords: string[],
  semitones: number,
): string[] {
  return chords.map((c) => transposeChord(c, semitones));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
