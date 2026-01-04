import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SHORTCUTS, formatShortcut } from './shortcuts';
import { useKeyboardShortcuts } from './KeyboardShortcutsProvider';
import { Keyboard, Navigation, Zap, Search } from 'lucide-react';

const categoryIcons = {
  global: Keyboard,
  navigation: Navigation,
  actions: Zap,
  search: Search,
};

const categoryNames = {
  global: 'Global Shortcuts',
  navigation: 'Navigation',
  actions: 'Actions',
  search: 'Search',
};

export function KeyboardHelpDialog() {
  const { isHelpOpen, closeHelp } = useKeyboardShortcuts();

  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof SHORTCUTS>);

  return (
    <Dialog open={isHelpOpen} onOpenChange={closeHelp}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="h-6 w-6" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Icon className="h-5 w-5" />
                  {categoryNames[category as keyof typeof categoryNames]}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b border-border hover:bg-muted transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="kbd">{formatShortcut(shortcut)}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
