import { createContext } from 'react';
export const LegacyThemeContext = createContext<{ theme: 'dark'|'light'; toggleTheme: () => void }>({ theme: 'dark', toggleTheme: () => {} });
