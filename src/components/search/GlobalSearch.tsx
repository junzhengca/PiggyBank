import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fuzzySearch, highlightMatches } from '@/lib/fuzzySearch';
import { formatDisplayDate } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import {
  Search,
  Wallet,
  LayoutList,
  PieChart,
  Target,
  ArrowRight,
  X,
  Command
} from 'lucide-react';

interface SearchItem {
  id: string;
  type: 'account' | 'transaction' | 'category' | 'budget';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
  matches?: number[];
}

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchItem[]>([]);

  const accounts = useAppSelector((state) => state.accounts.accounts);
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const categories = useAppSelector((state) => state.categories.categories);
  const budgets = useAppSelector((state) => state.budgets.budgets);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const performSearch = useCallback((searchQuery: string) => {
    const allItems: SearchItem[] = [
      ...accounts.map(acc => ({
        id: acc.id,
        type: 'account' as const,
        title: acc.name,
        subtitle: `${acc.type} • $${acc.balance.toFixed(2)}`,
        icon: <Wallet className="h-4 w-4" />,
        path: '/accounts',
      })),
      ...transactions.map(tx => ({
        id: tx.id,
        type: 'transaction' as const,
        title: tx.vendor,
        subtitle: `${formatDisplayDate(tx.date)} • $${tx.amount.toFixed(2)}`,
        icon: tx.type === 'income' ?
          <ArrowRight className="h-4 w-4 text-green-500" /> : 
          <ArrowRight className="h-4 w-4 text-red-500 rotate-180" />,
        path: '/transactions',
      })),
      ...categories.map(cat => ({
        id: cat.id,
        type: 'category' as const,
        title: cat.name,
        subtitle: cat.type,
        icon: <span className="text-lg">{cat.icon}</span>,
        path: '/categories',
      })),
      ...budgets.map(bud => {
        const cat = categories.find(c => c.id === bud.categoryId);
        return {
          id: bud.id,
          type: 'budget' as const,
          title: cat?.name || 'Unknown',
          subtitle: `$${bud.amount.toFixed(2)} budget`,
          icon: <Target className="h-4 w-4" />,
          path: '/budgets',
        };
      }),
    ];

    const searchableText = (item: SearchItem) => `${item.title} ${item.subtitle}`;
    const searchResults = fuzzySearch(searchQuery, allItems, searchableText);

    setResults(
      searchResults.map(r => ({
        ...r.item,
        matches: r.matches,
      }))
    );
  }, [accounts, transactions, categories, budgets]);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      navigate(selected.path);
      onClose();
      setQuery('');
    } else if (e.key === 'Escape') {
      onClose();
      setQuery('');
    }
  };

  const getTypeLabel = (type: SearchItem['type']) => {
    const labels = {
      account: 'Account',
      transaction: 'Transaction',
      category: 'Category',
      budget: 'Budget',
    };
    return labels[type];
  };

  const getTypeColor = (type: SearchItem['type']) => {
    const colors = {
      account: 'text-blue-500',
      transaction: 'text-purple-500',
      category: 'text-green-500',
      budget: 'text-orange-500',
    };
    return colors[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search accounts, transactions, categories..."
            className="border-0 focus-visible:ring-0 text-base h-14"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="ml-2 p-2 hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    navigate(result.path);
                    onClose();
                    setQuery('');
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 border-b border-border transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary/10'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className={`p-2 bg-muted ${getTypeColor(result.type)}`}>
                    {result.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">
                      {result.matches && result.matches.length > 0 ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightMatches(result.title, result.matches),
                          }}
                        />
                      ) : (
                        result.title
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.matches && result.matches.length > 0 ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightMatches(result.subtitle, result.matches.map(m => m + result.title.length + 2)),
                          }}
                        />
                      ) : (
                        result.subtitle
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {getTypeLabel(result.type)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 bg-muted/50">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="kbd text-xs">↑</kbd>
              <kbd className="kbd text-xs">↓</kbd>
              <span>to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="kbd text-xs">Enter</kbd>
              <span>to select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="kbd text-xs">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
