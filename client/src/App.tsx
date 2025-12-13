// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import MovieDetails from './pages/MovieDetails';
import TvDetails from './pages/TvDetails.tsx';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import ProfileSettings from './pages/Profile/ProfileSettings';
import Sidebar from './components/Sidebar';
import Recommendations from './pages/Recommendations';
import Search from './pages/Search.tsx';
import Filters from './pages/Filters.tsx';


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}


function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {user && <Sidebar />}
      <main className="flex-1 ml-0 md:ml-64 pt-14 md:pt-0">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/search"
            element={user ? <Search /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/recommendations"
            element={user ? <Recommendations /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/filters"
            element={user ? <Filters /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/browse"
            element={user ? <Browse /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/movies/:id"
            element={user ? <MovieDetails /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/tv/:id"
            element={user ? <TvDetails /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/watchlist"
            element={user ? <Watchlist /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" state={{ from: location }} replace />}
          >
            <Route index element={<Navigate to="settings" replace />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route path="preferences" element={<Navigate to="/filters" replace />} />
          </Route>

          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}


export default App;

