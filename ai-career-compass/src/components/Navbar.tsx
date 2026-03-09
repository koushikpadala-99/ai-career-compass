import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu, X, Compass } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Compass className="h-7 w-7 text-primary" />
          <span className="gradient-text">AI Career Compass</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              {/* <Link to="/quiz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Quiz</Link> */}
              <Link to="/results" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
              <Link to="/roadmap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roadmap</Link>
              <Link to="/study-tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Study</Link>
              <Link to="/documents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documents</Link>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
            </>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <Link to="/auth" className="gradient-bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-accent" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {isAuthenticated ? (
            <>
              <Link to="/quiz" onClick={() => setMobileOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground">Quiz</Link>
              <Link to="/results" onClick={() => setMobileOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground">Careers</Link>
              <Link to="/roadmap" onClick={() => setMobileOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground">Roadmap</Link>
              <Link to="/study-tools" onClick={() => setMobileOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground">Study</Link>
              <Link to="/documents" onClick={() => setMobileOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground">Documents</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-sm py-2 text-muted-foreground hover:text-foreground">Profile</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-sm py-2 text-muted-foreground hover:text-foreground">Logout</button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="block gradient-bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium text-center">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
