import type { ChordDiagram } from "../types";

interface ChordDiagramProps {
  chord: ChordDiagram;
  size?: "sm" | "md" | "lg";
}

const STRING_COUNT = 6;
const FRET_COUNT = 4;

export default function ChordDiagramView({
  chord,
  size = "md",
}: ChordDiagramProps) {
  const dimensions = {
    sm: { cell: 16, dot: 10, fontSize: 9, padding: 20 },
    md: { cell: 22, dot: 14, fontSize: 11, padding: 28 },
    lg: { cell: 28, dot: 18, fontSize: 13, padding: 32 },
  }[size];

  const width = (STRING_COUNT - 1) * dimensions.cell + dimensions.padding * 2;
  const height = FRET_COUNT * dimensions.cell + dimensions.padding * 2 + 20;

  const getStringX = (stringIndex: number) =>
    dimensions.padding + (6 - 1 - stringIndex) * dimensions.cell;
  const getFretY = (fret: number) =>
    dimensions.padding + 20 + (fret - 0.5) * dimensions.cell;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-sm font-bold text-white">{chord.name}</p>
      {chord.baseFret > 1 && (
        <p className="text-xs text-gray-400">{chord.baseFret}fr</p>
      )}
      <svg width={width} height={height} className="overflow-visible">
        {/* Nut (top bar if baseFret === 1) */}
        {chord.baseFret === 1 && (
          <rect
            x={dimensions.padding}
            y={dimensions.padding + 18}
            width={(STRING_COUNT - 1) * dimensions.cell}
            height={3}
            fill="#9ca3af"
            rx={1}
          />
        )}

        {/* Fret lines */}
        {Array.from({ length: FRET_COUNT + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={dimensions.padding}
            y1={dimensions.padding + 20 + i * dimensions.cell}
            x2={dimensions.padding + (STRING_COUNT - 1) * dimensions.cell}
            y2={dimensions.padding + 20 + i * dimensions.cell}
            stroke="#374151"
            strokeWidth={i === 0 ? 2 : 1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: STRING_COUNT }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={getStringX(i)}
            y1={dimensions.padding + 20}
            x2={getStringX(i)}
            y2={dimensions.padding + 20 + FRET_COUNT * dimensions.cell}
            stroke="#4b5563"
            strokeWidth={i === 0 ? 2 : 1}
          />
        ))}

        {/* Barre indicators */}
        {chord.barres?.map((barre, i) => (
          <rect
            key={`barre-${i}`}
            x={getStringX(barre.fromString - 1) - dimensions.dot / 2}
            y={getFretY(barre.fret) - dimensions.dot / 2}
            width={
              getStringX(barre.toString - 1) -
              getStringX(barre.fromString - 1) +
              dimensions.dot
            }
            height={dimensions.dot}
            fill="#9333ea"
            rx={dimensions.dot / 2}
          />
        ))}

        {/* Finger dots */}
        {chord.frets.map((fret, stringIndex) => {
          if (fret <= 0) return null;
          return (
            <circle
              key={`dot-${stringIndex}`}
              cx={getStringX(stringIndex)}
              cy={getFretY(fret)}
              r={dimensions.dot / 2}
              fill="#9333ea"
            />
          );
        })}

        {/* Open/muted indicators */}
        {chord.frets.map((fret, stringIndex) => {
          const x = getStringX(stringIndex);
          const y = dimensions.padding + 8;
          if (fret === 0) {
            return (
              <circle
                key={`open-${stringIndex}`}
                cx={x}
                cy={y}
                r={5}
                fill="none"
                stroke="#6b7280"
                strokeWidth={1.5}
              />
            );
          }
          if (fret === -1) {
            return (
              <g key={`muted-${stringIndex}`}>
                <line
                  x1={x - 4}
                  y1={y - 4}
                  x2={x + 4}
                  y2={y + 4}
                  stroke="#6b7280"
                  strokeWidth={1.5}
                />
                <line
                  x1={x + 4}
                  y1={y - 4}
                  x2={x - 4}
                  y2={y + 4}
                  stroke="#6b7280"
                  strokeWidth={1.5}
                />
              </g>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}

// Popup version used when clicking inline chords
interface ChordPopupProps {
  chordName: string;
  diagram?: ChordDiagram;
  position?: { x: number; y: number };
  onClose: () => void;
}

export function ChordPopup({ chordName, diagram, onClose }: ChordPopupProps) {
  return (
    <div className="chord-popup absolute z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-4 min-w-[140px]">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors text-xs"
        aria-label="Close"
      >
        ✕
      </button>
      {diagram ? (
        <ChordDiagramView chord={diagram} size="sm" />
      ) : (
        <div className="text-center py-4">
          <p className="text-white font-bold text-lg">{chordName}</p>
          <p className="text-gray-500 text-xs mt-1">Không có sơ đồ</p>
        </div>
      )}
    </div>
  );
}
