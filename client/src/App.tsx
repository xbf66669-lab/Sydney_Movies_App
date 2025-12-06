// client/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Watchlist from './pages/Watchlist';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';  // Changed from { Profile }
import NotFound from './pages/NotFound';
import MovieDetails from './pages/MovieDetails';
import ProfileSettings from './pages/Profile/ProfileSettings';
import ProfilePreferences from './pages/Profile/ProfilePreferences';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="movies">
              <Route index element={<Movies />} />
              <Route path=":id" element={<MovieDetails />} />
            </Route>
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="profile" element={<Profile />}>
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="preferences" element={<ProfilePreferences />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}