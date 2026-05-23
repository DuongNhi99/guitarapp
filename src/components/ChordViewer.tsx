import { useState, useRef, useEffect } from "react";
import { parseChordContent, transposeChord } from "../utils";
import { CHORD_DIAGRAMS } from "../data/mockData";
import { ChordPopup } from "./ChordDiagram";

interface ChordViewerProps {
  content: string;
  transpose: number;
}

export default function ChordViewer({ content, transpose }: ChordViewerProps) {
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedLines = parseChordContent(content);

  const handleChordClick = (chordName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const transposed = transposeChord(chordName, transpose);
    setActiveChord(transposed === activeChord ? null : transposed);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setPopupPos({
        x: rect.left - containerRect.left,
        y: rect.bottom - containerRect.top + 8,
      });
    }
  };

  useEffect(() => {
    const handler = () => setActiveChord(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative song-content font-mono leading-8"
    >
      {parsedLines.map((lineTokens, lineIdx) => {
        // Empty line
        if (lineTokens.length === 1 && lineTokens[0].type === "newline") {
          return <div key={lineIdx} className="h-4" />;
        }

        // Section header
        if (lineTokens.length === 1 && lineTokens[0].type === "section") {
          return (
            <div key={lineIdx} className="mt-6 mb-3 first:mt-0">
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-900/20 border border-purple-700/30 px-3 py-1 rounded-full">
                {lineTokens[0].value}
              </span>
            </div>
          );
        }

        // Has chords - build inline chord+text blocks
        const hasChords = lineTokens.some((t) => t.type === "chord");

        if (!hasChords) {
          return (
            <div key={lineIdx} className="leading-8 text-gray-200">
              {lineTokens.map((t, i) => (
                <span key={i}>{t.value}</span>
              ))}
            </div>
          );
        }

        // Pair each chord with the text that follows it
        const segments: { chord?: string; text: string }[] = [];
        let i = 0;
        while (i < lineTokens.length) {
          const token = lineTokens[i];
          if (token.type === "chord") {
            const nextText =
              lineTokens[i + 1]?.type === "text" ? lineTokens[i + 1].value : "";
            segments.push({ chord: token.value, text: nextText });
            i += nextText ? 2 : 1;
          } else {
            segments.push({ text: token.value });
            i++;
          }
        }

        return (
          <div key={lineIdx} className="pt-6 pb-1 leading-8">
            <span className="relative">
              {segments.map((seg, segIdx) => (
                <span key={segIdx} className="relative inline-block">
                  {seg.chord && (
                    <button
                      onClick={(e) => handleChordClick(seg.chord!, e)}
                      className="absolute -top-5 left-0 text-xs font-bold text-purple-400 hover:text-purple-200 transition-colors whitespace-nowrap font-mono z-10 cursor-pointer"
                    >
                      {transposeChord(seg.chord, transpose)}
                    </button>
                  )}
                  <span className="text-gray-200">
                    {seg.text || (seg.chord ? "\u00A0" : "")}
                  </span>
                </span>
              ))}
            </span>
          </div>
        );
      })}

      {/* Chord popup */}
      {activeChord && (
        <div
          className="absolute z-50"
          style={{ left: popupPos.x, top: popupPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <ChordPopup
            chordName={activeChord}
            diagram={CHORD_DIAGRAMS[activeChord]}
            onClose={() => setActiveChord(null)}
          />
        </div>
      )}
    </div>
  );
}
