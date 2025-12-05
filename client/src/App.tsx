// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Watchlist from './pages/Watchlist';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import MovieDetails from './pages/MovieDetails';

export default function App() {
  return (
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
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}