import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { ImageUploadModal } from './components/ImageUploadModal';

// Pages
import { Generator } from './pages/Generator';
import { Explore } from './pages/Explore';
import { Saved } from './pages/Saved';
import { PaletteDetail } from './pages/PaletteDetail';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');
  const [toasts, setToasts] = useState([]);
  const [isGlobalImageModalOpen, setIsGlobalImageModalOpen] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = to => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }
    window.history.pushState({}, '', to);
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const notify = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Route parser
  let pageComponent = null;
  const path = currentPath.split('?')[0];

  if (path === '/') {
    pageComponent = <Generator navigate={navigate} onNotify={notify} />;
  } else if (path === '/explore') {
    pageComponent = <Explore navigate={navigate} onNotify={notify} />;
  } else if (path === '/saved') {
    pageComponent = <Saved navigate={navigate} onNotify={notify} />;
  } else if (path.startsWith('/palette/')) {
    const paletteId = path.replace('/palette/', '');
    pageComponent = <PaletteDetail paletteId={paletteId} navigate={navigate} onNotify={notify} />;
  } else if (path === '/login') {
    pageComponent = <Login navigate={navigate} onNotify={notify} />;
  } else if (path === '/profile') {
    pageComponent = <Profile navigate={navigate} onNotify={notify} />;
  } else if (path === '/admin') {
    pageComponent = <Admin navigate={navigate} onNotify={notify} />;
  } else if (path === '/about') {
    pageComponent = <About navigate={navigate} onNotify={notify} />;
  } else {
    pageComponent = <NotFound navigate={navigate} onNotify={notify} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeRoute={path}
        navigate={navigate}
        openImageUpload={() => setIsGlobalImageModalOpen(true)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {pageComponent}
      </div>

      <Footer />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Image Extractor Modal (accessible from any page) */}
      <ImageUploadModal
        isOpen={isGlobalImageModalOpen}
        onClose={() => setIsGlobalImageModalOpen(false)}
        onApplyPalette={extractedColors => {
          navigate('/');
          notify('Loaded extracted palette into generator!', 'success');
        }}
        onNotify={notify}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
