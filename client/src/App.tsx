// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Browse from './pages/Browse';
import MovieDetails from './pages/MovieDetails';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';


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
    <div className="min-h-screen bg-gray-900 text-white">
      {user && <Navbar />}
      <main className="pt-16"> {/* Add padding to account for fixed navbar */}
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
         
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" state={{ from: location }} replace />}
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
            path="/watchlist"
            element={user ? <Watchlist /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}


export default App;

