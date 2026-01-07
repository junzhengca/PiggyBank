import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { useKeyboardShortcuts } from '@/components/keyboard/useKeyboardShortcuts';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchTags } from '@/store/slices/tagsSlice';
import { fetchTransactions } from '@/store/slices/transactionsSlice';
import { fetchBudgets } from '@/store/slices/budgetsSlice';
import {
  LayoutDashboard,
  LayoutList,
  PieChart,
  Wallet,
  Settings as SettingsIcon,
  Plus,
  Search,
  Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Dashboard from '@/features/dashboard/Dashboard';
import Accounts from '@/features/accounts/Accounts';
import AccountDetails from '@/features/accounts/AccountDetails';
import Transactions from '@/features/transactions/Transactions';
import Categories from '@/features/categories/Categories';
import Budgets from '@/features/budgets/Budgets';
import Analytics from '@/features/analytics/Analytics';
import Settings from '@/features/settings/Settings';
import { KeyboardShortcutsProvider } from '@/components/keyboard/KeyboardShortcutsProvider';
import { KeyboardHelpDialog } from '@/components/keyboard/KeyboardHelpDialog';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useRegisterShortcut } from '@/components/keyboard/useKeyboardShortcuts';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { path: '/accounts', label: 'Accounts', icon: Wallet, shortcut: '2' },
  { path: '/transactions', label: 'Transactions', icon: LayoutList, shortcut: '3' },
  { path: '/categories', label: 'Categories', icon: PieChart, shortcut: '4' },
  { path: '/budgets', label: 'Budgets', icon: PieChart, shortcut: '5' },
  { path: '/analytics', label: 'Analytics', icon: PieChart, shortcut: '6' },
  { path: '/settings', label: 'Settings', icon: SettingsIcon, shortcut: '7' },
];

function LayoutContent() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
    dispatch(fetchTags());
    dispatch(fetchTransactions());
    dispatch(fetchBudgets());
  }, [dispatch]);

  // Register global shortcuts
  useRegisterShortcut({
    key: 'k',
    ctrl: true,
    meta: true,
    description: 'Open global search',
    category: 'global',
    action: () => setIsSearchOpen(true),
  });

  const { openHelp } = useKeyboardShortcuts();

  useRegisterShortcut({
    key: '?',
    ctrl: true,
    meta: true,
    description: 'Show keyboard shortcuts',
    category: 'global',
    action: openHelp,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b px-3 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl">🐷</span>
            <span className="font-bold text-lg gradient-text">PiggyBank</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsSearchOpen(true)}
              className="relative"
            >
              <Search className="h-4 w-4" />
              <kbd className="absolute -bottom-1 -right-1 text-[10px] px-1 py-0.5 bg-primary text-primary-foreground">
                ⌘K
              </kbd>
            </Button>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-card border-r p-3 fixed">
          <Link to="/" className="flex items-center space-x-2 mb-6 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🐷</span>
            <span className="font-bold text-xl gradient-text">PiggyBank</span>
          </Link>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <kbd className="kbd text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.shortcut}
                  </kbd>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
              <kbd className="kbd ml-auto">⌘K</kbd>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={openHelp}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Keyboard Shortcuts
              <kbd className="kbd ml-auto">⌘?</kbd>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-56 pt-16 lg:pt-6 p-3 lg:p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:id" element={<AccountDetails />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t px-2 py-1.5 z-40">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-1.5 transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Search Dialog */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Keyboard Help Dialog */}
      <KeyboardHelpDialog />
    </div>
  );
}

export default function Layout() {
  return (
    <KeyboardShortcutsProvider>
      <LayoutContent />
    </KeyboardShortcutsProvider>
  );
}
