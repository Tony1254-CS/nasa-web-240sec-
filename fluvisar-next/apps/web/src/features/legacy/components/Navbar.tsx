import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Globe,
  ClipboardList,
  AlertTriangle,
  Brain,
  Microscope,
  BookOpen,
  FileText,
  Info,
  MessageSquare,
  Moon,
  Sun,
  Menu,
  ChevronDown
} from 'lucide-react';
import { LegacyThemeContext } from '../theme';
import { useWorkspaceStore } from '../../../store/workspaceStore';

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useContext(LegacyThemeContext);
  const { regionId, setRegion } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Close 'More' dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavItems = [
    { to: '/observatory', label: 'Observatory', icon: Compass, match: (path: string) => path.startsWith('/observatory') },
    { to: '/atlas', label: 'Atlas', icon: Globe, match: (path: string) => path.startsWith('/atlas') },
    { to: '/impact', label: 'Decision Desk', icon: ClipboardList, match: (path: string) => path.startsWith('/impact') },
    { to: '/insights', label: 'Insights', icon: AlertTriangle, match: (path: string) => path.startsWith('/insights') },
    { to: '/intelligence', label: 'ML Intelligence', icon: Brain, match: (path: string) => path.startsWith('/intelligence') },
    { to: '/sar-lab', label: 'SAR Lab', icon: Microscope, match: (path: string) => path.startsWith('/sar-lab') },
  ];

  const moreNavItems = [
    { to: '/stories', label: 'Stories', description: 'Interactive narrative chapters', icon: BookOpen, match: (path: string) => path.startsWith('/stories') },
    { to: '/about', label: 'About us', description: 'NASA challenge team & mission', icon: Info, match: (path: string) => path.startsWith('/about') },
    { to: '/reports', label: 'Report', description: 'Methods, math equations & source manifests', icon: FileText, match: (path: string) => path.startsWith('/reports') },
  ];

  const isMoreActive = moreNavItems.some(item => item.match(location.pathname));

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
          {primaryNavItems.map(item => {
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

          {/* More ▾ Dropdown */}
          <div
            ref={moreRef}
            className={`navbar__dropdown navbar__dropdown--more ${moreOpen ? 'is-open' : ''}`}
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              type="button"
              className={`navbar__link navbar__link--more ${isMoreActive ? 'navbar__link--active' : ''}`}
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              <span>More</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              {isMoreActive && <span className="navbar__link-indicator" />}
            </button>

            <div className={`navbar__dropdown-content navbar__dropdown-content--more ${moreOpen ? 'navbar__dropdown-content--visible' : ''}`}>
              {moreNavItems.map(item => {
                const isActive = item.match(location.pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      setMoreOpen(false);
                      setOpen(false);
                    }}
                    className={`navbar__more-item ${isActive ? 'navbar__more-item--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="navbar__more-icon-box">
                      <Icon size={16} />
                    </div>
                    <div className="navbar__more-text">
                      <div className="navbar__more-title">
                        <span>{item.label}</span>
                        {isActive && <span className="navbar__more-pill">Active</span>}
                      </div>
                      <div className="navbar__more-desc">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="navbar__right">
        <button
          className="navbar__btn navbar__assistant"
          aria-label="Ask FluviSAR"
          onClick={() => useWorkspaceStore.getState().setAgentDrawerOpen(true)}
        >
          <MessageSquare size={16} />
          <span>Ask FluviSAR</span>
        </button>
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
