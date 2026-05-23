import { useState } from "react";
import { parseChordContent, transposeChord } from "../utils";
import { Link } from "react-router-dom";

interface SheetViewerProps {
  content: string;
  transpose?: number;
  fontSize?: number;
}

export default function SheetViewer({
  content,
  transpose = 0,
  fontSize = 14,
}: SheetViewerProps) {
  const [activeChord, setActiveChord] = useState<string | null>(null);

  const transposedContent = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, chord) => `[[${transposeChord(chord, transpose)}]]`,
  );

  const lines = parseChordContent(transposedContent);

  return (
    <div
      className="sheet-viewer font-mono leading-relaxed"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((tokens, li) => {
        if (!tokens.length) return <div key={li} className="h-3" />;

        const first = tokens[0];

        if (first.type === "section") {
          return (
            <div
              key={li}
              className="mt-5 mb-1 text-purple-400 font-sans font-bold text-xs uppercase tracking-widest"
            >
              [{first.value}]
            </div>
          );
        }

        if (first.type === "newline") {
          return <div key={li} className="h-3" />;
        }

        /* Build pairs: each chord is bound to the text immediately following */
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

        return (
          <div key={li} className="flex flex-wrap items-end mb-0.5">
            {pairs.map(({ chord, text }, pi) => (
              <span key={pi} className="inline-flex flex-col">
                {chord ? (
                  <Link
                    to={`/chords/${chord}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChord(chord === activeChord ? null : chord);
                    }}
                    className={`font-bold leading-none pb-0.5 transition-colors whitespace-pre ${
                      activeChord === chord
                        ? "text-pink-400"
                        : "text-purple-400 hover:text-purple-300"
                    }`}
                    style={{ fontSize: `${Math.max(11, fontSize - 2)}px` }}
                  >
                    {chord}
                  </Link>
                ) : (
                  <span
                    className="leading-none pb-0.5 whitespace-pre"
                    style={{ fontSize: `${Math.max(11, fontSize - 2)}px` }}
                  >
                    &nbsp;
                  </span>
                )}
                <span className="text-gray-200 whitespace-pre leading-snug">
                  {text || " "}
                </span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
