import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Settings from './pages/Settings';
import FunctionalityGuide from './pages/FunctionalityGuide';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                </div>
              } />
              <Route path="/projects/:id" element={
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <ProjectDetails />
                  </main>
                </div>
              } />
              <Route path="/settings" element={
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <Settings />
                  </main>
                </div>
              } />
              <Route path="/guide" element={
                <div className="app-layout">
                  <Sidebar />
                  <main className="main-content">
                    <FunctionalityGuide />
                  </main>
                </div>
              } />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
