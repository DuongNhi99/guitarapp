import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import SongListPage from "./pages/SongListPage";
import SongDetailPage from "./pages/SongDetailPage";
import SearchPage from "./pages/SearchPage";
import RhythmPage from "./pages/RhythmPage";
import ChordPage from "./pages/ChordPage";
import FindByChordPage from "./pages/FindByChordPage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/songs" element={<SongListPage />} />
          <Route path="/songs/:id/:slug" element={<SongDetailPage />} />
          <Route path="/songs/:id" element={<SongDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/rhythms" element={<RhythmPage />} />
          <Route path="/rhythms/:id" element={<RhythmPage />} />
          <Route path="/chords" element={<ChordPage />} />
          <Route path="/chords/:chordName" element={<ChordPage />} />
          <Route path="/find-by-chord" element={<FindByChordPage />} />
          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
