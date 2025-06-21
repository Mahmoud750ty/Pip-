import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import PipBeachPlugPage from './pages/home';
import ConfirmPage from './pages/ConfirmPage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/auth/LoginPage';

// Admin Pages & Components
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import SmokesPage from './pages/admin/SmokesPage';
import SnackAttackPage from './pages/admin/SnackAttackPage';
import CandyBoomPage from './pages/admin/CandyBoomPage';
import SuperNutsPage from './pages/admin/SuperNutsPage';
import VibeSavePage from './pages/admin/VibeSavePage';
import GameOnPage from './pages/admin/GameOnPage';


// CORRECTED IMPORT PATH
import ProtectedRoute from './pages/admin/ProtectedRoute';
import CashierHomePage from './pages/admin/CashierHomePage';
import CashierConfirmPage from './pages/admin/CashierConfirmPage';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PipBeachPlugPage />} />
            <Route path="/confirm" element={<ConfirmPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="smokes" element={<SmokesPage />} />
              <Route path="snack-attack" element={<SnackAttackPage />} />
              <Route path="candy-boom" element={<CandyBoomPage />} />
              <Route path="super-nuts" element={<SuperNutsPage />} />
              <Route path="vibe-save" element={<VibeSavePage />} />
              <Route path="game-on" element={<GameOnPage />} />
              <Route path="new-order" element={<CashierHomePage />} />
              <Route path="confirm-order" element={<CashierConfirmPage />} />
            </Route>

          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;