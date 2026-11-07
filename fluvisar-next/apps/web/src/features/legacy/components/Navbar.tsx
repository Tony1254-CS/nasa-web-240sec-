import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Globe,
  ClipboardList,
  Smartphone,
  Brain,
  Microscope,
  BookOpen,
  FileText,
  Moon,
  Sun,
  Menu
} from 'lucide-react';
import { LegacyThemeContext } from '../theme';
import { useWorkspaceStore } from '../../../store/workspaceStore';

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useContext(LegacyThemeContext);
  const { regionId, setRegion } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/observatory', label: 'Observatory', icon: Compass, match: (path: string) => path.startsWith('/observatory') },
    { to: '/atlas', label: 'Atlas', icon: Globe, match: (path: string) => path.startsWith('/atlas') },
    { to: '/impact', label: 'Decision Desk', icon: ClipboardList, match: (path: string) => path.startsWith('/impact') },
    { to: '/trace', label: 'TRACE Field', icon: Smartphone, match: (path: string) => path.startsWith('/trace') },
    { to: '/intelligence', label: 'ML Intelligence', icon: Brain, match: (path: string) => path.startsWith('/intelligence') },
    { to: '/sar-lab', label: 'SAR Lab', icon: Microscope, match: (path: string) => path.startsWith('/sar-lab') },
    { to: '/stories', label: 'Stories', icon: BookOpen, match: (path: string) => path.startsWith('/stories') },
    { to: '/reports', label: 'Report', icon: FileText, match: (path: string) => path.startsWith('/reports') }
  ];

  return (
    <nav className={`navbar${transparent ? ' navbar--transparent' : ''}`} aria-label="Primary">
      <div className="navbar__left">
        <Link to="/" className="navbar__brand" aria-label="FluviSAR — Home">
          <span className="navbar__brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" stroke="var(--water)" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
              <circle cx="12" cy="12" r="3" fill="var(--water)" fillOpacity=".2" />
            </svg>
          </span>
          <span className="navbar__brand-text">FLUVISAR</span>
        </Link>

        <div className={`navbar__nav${open ? ' navbar__nav--open' : ''}`}>
          {navItems.map(item => {
            const isActive = item.match(location.pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={15} className={`navbar__link-icon ${isActive ? 'navbar__link-icon--active' : ''}`} />
                <span>{item.label}</span>
                {isActive && <span className="navbar__link-indicator" />}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="navbar__right">
        <select
          className="navbar__reach-select"
          aria-label="Investigation region"
          value={regionId}
          onChange={e => {
            const region = e.target.value as 'jamuna' | 'sundarbans';
            setRegion(region);
            if (location.pathname.startsWith('/observatory')) {
              navigate('/observatory/' + region);
            }
          }}
        >
          <option value="jamuna">Jamuna</option>
          <option value="sundarbans">Sundarbans</option>
        </select>
        <button className="navbar__btn" onClick={toggleTheme} aria-label="Toggle Light/Dark Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="navbar__mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <Menu size={20} />
        </button>
      </div>
    </nav>
  );
}
