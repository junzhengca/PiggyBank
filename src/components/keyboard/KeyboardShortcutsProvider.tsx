import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shortcut, matchesShortcut } from './shortcuts';

interface KeyboardShortcutsContextType {
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (key: string, modifiers?: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }) => void;
  openHelp: () => void;
  closeHelp: () => void;
  isHelpOpen: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
}

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setShortcuts((prev: Shortcut[]) => [...prev.filter((s: Shortcut) =>
      s.key !== shortcut.key ||
      s.ctrl !== shortcut.ctrl ||
      s.meta !== shortcut.meta
    ), shortcut]);
  }, []);

  const unregisterShortcut = useCallback((key: string, modifiers?: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }) => {
    setShortcuts((prev: Shortcut[]) => prev.filter((s: Shortcut) =>
      s.key !== key ||
      (modifiers?.ctrl !== undefined && s.ctrl !== modifiers.ctrl) ||
      (modifiers?.meta !== undefined && s.meta !== modifiers.meta)
    ));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;
      
      // Check registered shortcuts first
      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          // Skip if this shortcut is page-specific and we're not on that page
          if (shortcut.page && !location.pathname.includes(shortcut.page)) {
            continue;
          }
          
          // For action shortcuts, only trigger if not in input
          if (shortcut.category === 'actions' && isInput) {
            continue;
          }
          
          event.preventDefault();
          shortcut.action();
          return;
        }
      }

      // Built-in shortcuts
      if (!isInput) {
        // Navigation shortcuts
        const navShortcuts: Record<string, string> = {
          '1': '/',
          '2': '/accounts',
          '3': '/transactions',
          '4': '/categories',
          '5': '/budgets',
          '6': '/analytics',
          '7': '/settings',
        };
        
        if (navShortcuts[event.key] && location.pathname !== navShortcuts[event.key]) {
          navigate(navShortcuts[event.key]);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, navigate, location.pathname]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        registerShortcut,
        unregisterShortcut,
        openHelp,
        closeHelp,
        isHelpOpen,
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}
