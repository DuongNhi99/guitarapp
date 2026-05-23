import type { Song } from "../types";
import { parseChordContent, transposeChord } from "./index";

export function printSheetMusic(song: Song, transpose: number, capo: number) {
  const transposedContent = song.content.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, chord) => `[[${transposeChord(chord, transpose)}]]`,
  );

  const lines = parseChordContent(transposedContent);

  // Build chord-above-lyrics HTML lines
  const bodyLines = lines
    .map((tokens) => {
      if (tokens.length === 0) return `<div class="empty-line"></div>`;
      if (tokens[0].type === "section") {
        return `<div class="section-header">${tokens[0].value}</div>`;
      }
      if (tokens[0].type === "newline") {
        return `<div class="empty-line"></div>`;
      }

      // Pair each chord with the text that follows it
      const pairs: { chord: string; text: string }[] = [];
      let i = 0;
      while (i < tokens.length) {
        const t = tokens[i];
        if (t.type === "chord") {
          const nextText =
            i + 1 < tokens.length && tokens[i + 1].type === "text"
              ? tokens[i + 1].value
              : "";
          pairs.push({ chord: t.value, text: nextText });
          i += nextText ? 2 : 1;
        } else if (t.type === "text") {
          pairs.push({ chord: "", text: t.value });
          i++;
        } else {
          i++;
        }
      }

      const inner = pairs
        .map(
          ({ chord, text }) =>
            `<span class="pair">` +
            `<span class="chord-label">${chord || "&nbsp;"}</span>` +
            `<span class="lyric-text">${text || "&nbsp;"}</span>` +
            `</span>`,
        )
        .join("");

      return `<div class="lyric-line">${inner}</div>`;
    })
    .join("\n");

  const transposedChords = song.chords.map((c) => transposeChord(c, transpose));
  const chordBadges = transposedChords
    .map((c) => `<span class="chord-badge">${c}</span>`)
    .join("");

  const metaParts = [
    `Giọng: <strong>${song.tone}</strong>`,
    capo > 0 ? `Capo: <strong>${capo}</strong>` : null,
    transpose !== 0
      ? `Chuyển tông: <strong>${transpose > 0 ? "+" : ""}${transpose}</strong>`
      : null,
    `Điệu: <strong>${song.rhythm.name}</strong>`,
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${song.title} – ${song.artist.name} | Hợp Âm Chuẩn</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #111;
      background: #fff;
      padding: 28px 36px;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Header */
    .sheet-header { border-bottom: 2px solid #7c3aed; padding-bottom: 14px; margin-bottom: 16px; }
    .sheet-title { font-size: 26px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; }
    .sheet-artist { font-size: 16px; color: #7c3aed; font-weight: 600; margin-top: 4px; }
    .sheet-meta { font-size: 12px; color: #555; margin-top: 8px; }

    /* Chords used */
    .chords-used { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; padding: 10px 12px; background: #f5f3ff; border-radius: 8px; border: 1px solid #ddd6fe; }
    .chord-badge { background: #7c3aed; color: #fff; padding: 2px 9px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 700; }

    /* Lyrics */
    .content { line-height: 1; }
    .section-header { font-size: 12px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.08em; margin: 18px 0 4px; }
    .lyric-line { display: flex; flex-wrap: wrap; margin-bottom: 2px; align-items: flex-end; }
    .empty-line { height: 10px; }
    .pair { display: inline-flex; flex-direction: column; margin-right: 0px; }
    .chord-label { font-family: monospace; font-size: 12px; font-weight: 700; color: #7c3aed; min-height: 18px; line-height: 18px; white-space: pre; }
    .lyric-text { font-size: 13px; color: #222; white-space: pre; line-height: 20px; }

    /* Footer */
    .sheet-footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 11px; color: #aaa; text-align: center; }

    /* Print tweaks */
    @media print {
      body { padding: 12px 20px; }
      @page { margin: 15mm 15mm; }
    }
  </style>
</head>
<body>
  <div class="sheet-header">
    <div class="sheet-title">${song.title}</div>
    <div class="sheet-artist">${song.artist.name}</div>
    <div class="sheet-meta">${metaParts}</div>
  </div>

  <div class="chords-used">${chordBadges}</div>

  <div class="content">
    ${bodyLines}
  </div>

  <div class="sheet-footer">hopamchuan.com &nbsp;·&nbsp; ${song.contributors.map((c) => "@" + c).join(", ")}</div>

  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
