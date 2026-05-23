import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Guitar } from "lucide-react";
import { CHORD_DIAGRAMS, ALL_CHORDS, SONGS } from "../data/mockData";
import ChordDiagramView from "../components/ChordDiagram";
import SongCard from "../components/SongCard";

const CHORD_GROUPS = [
  { label: "A", chords: ALL_CHORDS.filter((c) => c.startsWith("A")) },
  { label: "B", chords: ALL_CHORDS.filter((c) => c.startsWith("B")) },
  { label: "C", chords: ALL_CHORDS.filter((c) => c.startsWith("C")) },
  { label: "D", chords: ALL_CHORDS.filter((c) => c.startsWith("D")) },
  { label: "E", chords: ALL_CHORDS.filter((c) => c.startsWith("E")) },
  { label: "F", chords: ALL_CHORDS.filter((c) => c.startsWith("F")) },
  { label: "G", chords: ALL_CHORDS.filter((c) => c.startsWith("G")) },
];

export default function ChordPage() {
  const { chordName } = useParams<{ chordName?: string }>();
  const [activeGroup, setActiveGroup] = useState("A");

  const selectedChord = chordName ? CHORD_DIAGRAMS[chordName] : null;
  const songsWithChord = chordName
    ? SONGS.filter((s) => s.chords.includes(chordName))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/chords" className="hover:text-white transition-colors">
          Hợp âm
        </Link>
        {chordName && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{chordName}</span>
          </>
        )}
      </nav>

      {!chordName ? (
        // Chord browser
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Guitar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Hợp Âm Guitar</h1>
              <p className="text-gray-400 text-sm">
                Sơ đồ hợp âm và bài hát liên quan
              </p>
            </div>
          </div>

          {/* Group tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CHORD_GROUPS.map((group) => (
              <button
                key={group.label}
                onClick={() => setActiveGroup(group.label)}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0 transition-colors ${
                  activeGroup === group.label
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          {/* Chord diagrams grid */}
          {CHORD_GROUPS.map((group) =>
            group.label === activeGroup ? (
              <div
                key={group.label}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {group.chords.map((chord) => (
                  <Link
                    key={chord}
                    to={`/chords/${chord}`}
                    className="card p-4 flex flex-col items-center hover:border-purple-700/50 hover:bg-purple-900/10 transition-all"
                  >
                    <ChordDiagramView chord={CHORD_DIAGRAMS[chord]} size="md" />
                    <div className="mt-2 text-xs text-gray-500">
                      {SONGS.filter((s) => s.chords.includes(chord)).length} bài
                    </div>
                  </Link>
                ))}
              </div>
            ) : null,
          )}
        </div>
      ) : (
        // Single chord view
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card p-6 flex flex-col items-center">
              {selectedChord ? (
                <ChordDiagramView chord={selectedChord} size="lg" />
              ) : (
                <div className="text-center py-8">
                  <p className="text-3xl font-bold text-white mb-2">
                    {chordName}
                  </p>
                  <p className="text-gray-500 text-sm">Chưa có sơ đồ hợp âm</p>
                </div>
              )}
            </div>

            <div className="card p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Các hợp âm khác
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_CHORDS.map((c) => (
                  <Link
                    key={c}
                    to={`/chords/${c}`}
                    className={`font-mono text-sm px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      c === chordName
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">
              Bài hát có hợp âm{" "}
              <span className="text-purple-400">{chordName}</span>
            </h2>
            {songsWithChord.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {songsWithChord.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card">
                <Guitar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">
                  Chưa có bài hát nào sử dụng hợp âm này
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
