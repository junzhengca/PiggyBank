import { useEffect } from 'react';
import { Shortcut } from './shortcuts';
import { useKeyboardShortcuts as useKeyboardShortcutsContext } from './KeyboardShortcutsProvider';

export function useKeyboardShortcuts() {
  return useKeyboardShortcutsContext();
}

export function useRegisterShortcut(shortcut: Shortcut) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(shortcut);
    return () => {
      unregisterShortcut(shortcut.key, {
        ctrl: shortcut.ctrl,
        meta: shortcut.meta,
        shift: shortcut.shift,
        alt: shortcut.alt,
      });
    };
  }, [shortcut, registerShortcut, unregisterShortcut]);
}

export function useKeydown(key: string, callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase()) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ...deps]);
}
