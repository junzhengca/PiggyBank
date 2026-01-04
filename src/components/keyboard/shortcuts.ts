export interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: 'navigation' | 'global' | 'actions' | 'search';
  action: () => void;
  page?: string; // Optional: only active on specific pages
}

export const SHORTCUTS: Omit<Shortcut, 'action'>[] = [
  // Global shortcuts
  {
    key: 'k',
    ctrl: true,
    meta: true,
    description: 'Open global search',
    category: 'global',
  },
  {
    key: 'p',
    ctrl: true,
    meta: true,
    description: 'Open quick actions',
    category: 'global',
  },
  {
    key: '?',
    ctrl: true,
    meta: true,
    description: 'Show keyboard shortcuts',
    category: 'global',
  },
  {
    key: 'Escape',
    description: 'Close modal/dialog',
    category: 'global',
  },

  // Navigation shortcuts
  {
    key: '1',
    description: 'Go to Dashboard',
    category: 'navigation',
  },
  {
    key: '2',
    description: 'Go to Accounts',
    category: 'navigation',
  },
  {
    key: '3',
    description: 'Go to Transactions',
    category: 'navigation',
  },
  {
    key: '4',
    description: 'Go to Categories',
    category: 'navigation',
  },
  {
    key: '5',
    description: 'Go to Budgets',
    category: 'navigation',
  },
  {
    key: '6',
    description: 'Go to Analytics',
    category: 'navigation',
  },
  {
    key: '7',
    description: 'Go to Settings',
    category: 'navigation',
  },

  // Action shortcuts
  {
    key: 'n',
    description: 'Create new item',
    category: 'actions',
  },
  {
    key: 'e',
    description: 'Edit selected item',
    category: 'actions',
  },
  {
    key: 'd',
    description: 'Delete selected item',
    category: 'actions',
  },
  {
    key: 'f',
    description: 'Focus search/filter',
    category: 'actions',
  },
  {
    key: 'r',
    description: 'Refresh data',
    category: 'actions',
  },

  // Search shortcuts
  {
    key: 'ArrowUp',
    description: 'Navigate up in results',
    category: 'search',
  },
  {
    key: 'ArrowDown',
    description: 'Navigate down in results',
    category: 'search',
  },
  {
    key: 'Enter',
    description: 'Select result',
    category: 'search',
  },
];

export const formatShortcut = (shortcut: Omit<Shortcut, 'action'>): string => {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  
  let key = shortcut.key;
  if (key === ' ') key = 'Space';
  if (key === 'Escape') key = 'Esc';
  if (key === 'ArrowUp') key = '↑';
  if (key === 'ArrowDown') key = '↓';
  if (key === 'ArrowLeft') key = '←';
  if (key === 'ArrowRight') key = '→';
  
  parts.push(key);
  return parts.join(' + ');
};

export const matchesShortcut = (event: KeyboardEvent, shortcut: Omit<Shortcut, 'action' | 'description' | 'category' | 'page'>): boolean => {
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase() && event.key !== shortcut.key) {
    return false;
  }
  if (shortcut.ctrl !== undefined && event.ctrlKey !== shortcut.ctrl) return false;
  if (shortcut.meta !== undefined && event.metaKey !== shortcut.meta) return false;
  if (shortcut.shift !== undefined && event.shiftKey !== shortcut.shift) return false;
  if (shortcut.alt !== undefined && event.altKey !== shortcut.alt) return false;
  return true;
};
