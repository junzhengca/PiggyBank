import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatShortcut } from './shortcuts';
import { Shortcut } from './shortcuts';

interface ShortcutTooltipProps {
  shortcut: Omit<Shortcut, 'action'>;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function ShortcutTooltip({ shortcut, children, side = 'bottom' }: ShortcutTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="flex items-center gap-2">
          <span>{shortcut.description}</span>
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">
            {formatShortcut(shortcut)}
          </kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
