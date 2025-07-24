import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/home';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Memberships from './pages/Memberships';
import Products from './pages/Products';
import Registros from './pages/Registros';
import Pagos from './pages/Pagos';
import Checkout from './pages/Checkout';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                } 
              />
            <Route 
              path="/memberships" 
              element={
                <ProtectedRoute>
                  <Memberships />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/registros" 
              element={
                <ProtectedRoute>
                  <Registros />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pagos" 
              element={
                <ProtectedRoute>
                  <Pagos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reportes" 
              element={
                <ProtectedRoute>
                  <Reportes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracion" 
              element={
                <ProtectedRoute>
                  <Configuracion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;