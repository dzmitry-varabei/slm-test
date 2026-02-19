import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  debugMode: boolean;
  onToggleDebug: () => void;
}

export default function Layout({ children, debugMode, onToggleDebug }: Props) {
  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">AI-Trainer</h1>
        <nav className="nav">
          <NavLink to="/quiz" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Quiz
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            History
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Settings
          </NavLink>
          <button
            className={`debug-toggle ${debugMode ? 'active' : ''}`}
            onClick={onToggleDebug}
            title="Toggle Debug Mode"
          >
            <span className="debug-toggle-label">Debug</span>
            <span className={`debug-toggle-switch ${debugMode ? 'on' : ''}`}>
              <span className="debug-toggle-knob" />
            </span>
          </button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
