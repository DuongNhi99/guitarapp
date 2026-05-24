import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout/Layout";
import ScrollToTop from "./components/ScrollToTop";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import HomePage from "./pages/HomePage";
import SongListPage from "./pages/SongListPage";
import SongDetailPage from "./pages/SongDetailPage";
import SearchPage from "./pages/SearchPage";
import RhythmPage from "./pages/RhythmPage";
import ChordPage from "./pages/ChordPage";
import FindByChordPage from "./pages/FindByChordPage";
import SheetsPage from "./pages/SheetsPage";
import SheetPreviewPage from "./pages/SheetPreviewPage";
import GuitarPage from "./pages/GuitarPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <PwaInstallPrompt />
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
            <Route path="/sheets" element={<SheetsPage />} />
            <Route path="/sheets/:id/:slug" element={<SheetPreviewPage />} />
            <Route path="/sheets/:id" element={<SheetPreviewPage />} />
            <Route path="/guitar" element={<GuitarPage />} />
            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
