# Excel-like Styling Plan

## Overview
Transform the PiggyBank application to have a compact, Excel-like appearance with:
- **Open Sans** font for all text (via Google Fonts)
- **JetBrains Mono** font for amounts and numerical data (via Google Fonts)
- **No rounded corners** - sharp, angular edges throughout
- **Consistent, compact styling** following DRY principles

## Design Principles

### Excel-like Characteristics
1. **Sharp corners** - All elements use square/rectangular shapes (border-radius: 0)
2. **Compact spacing** - Reduced padding and margins for information density
3. **Clear borders** - Distinct cell-like separation between elements
4. **Monospace numbers** - Numerical data aligned and readable
5. **Grid-based layout** - Data presented in tabular/row format

### DRY Implementation
1. **Reusable utility classes** for common patterns
2. **Centralized font configuration** in Tailwind config
3. **Consistent spacing scale** across all components
4. **Shared component styles** via base UI components

---

## Implementation Steps

### Step 1: Add Google Fonts to index.html
**File:** `index.html`

Add Google Fonts link in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

### Step 2: Configure Font Families in Tailwind
**File:** `tailwind.config.js`

Update `fontFamily` configuration:
```js
fontFamily: {
  sans: [
    "Open Sans",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "sans-serif",
  ],
  mono: [
    "JetBrains Mono",
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "monospace",
  ],
},
```

---

### Step 3: Remove Rounded Corners from CSS Variables
**File:** `src/index.css`

Update CSS variables to remove rounded corners:
```css
:root {
  --radius: 0rem; /* Changed from 0.75rem */
  /* ... other variables ... */
}
```

Update scrollbar styles to remove rounded corners:
```css
.scrollbar-thin::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 0; /* Changed from 3px */
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 0; /* Changed from 3px */
}
```

Update global scrollbar:
```css
::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 0; /* Changed from 4px */
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 0; /* Changed from 4px */
}
```

Update `.kbd` utility:
```css
.kbd {
  @apply inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-muted-foreground bg-muted border border-border shadow-sm;
  border-radius: 0; /* Remove rounded corners */
}
```

---

### Step 4: Create Reusable Utility Classes (DRY)
**File:** `src/index.css`

Add new utility classes for consistent Excel-like styling:

```css
/* Excel-like cell styles */
.excel-cell {
  @apply border border-border bg-background px-2 py-1 text-sm;
}

.excel-cell-header {
  @apply border border-border bg-muted px-2 py-1 text-sm font-semibold;
}

.excel-row {
  @apply flex items-center border-b border-border;
}

.excel-row:hover {
  @apply bg-muted/50;
}

/* Amount styling with monospace font */
.amount {
  @apply font-mono font-medium tabular-nums;
}

.amount-sm {
  @apply font-mono text-sm tabular-nums;
}

.amount-lg {
  @apply font-mono text-lg font-semibold tabular-nums;
}

.amount-xl {
  @apply font-mono text-xl font-bold tabular-nums;
}

/* Compact card styles */
.excel-card {
  @apply border border-border bg-card shadow-sm;
}

.excel-card-header {
  @apply border-b border-border bg-muted/50 px-3 py-2;
}

.excel-card-content {
  @apply px-3 py-2;
}

/* Sharp button styles */
.btn-sharp {
  @apply border border-border bg-background hover:bg-accent;
  border-radius: 0;
}

/* Sharp input styles */
.input-sharp {
  border-radius: 0;
}
```

---

### Step 5: Update UI Components

#### 5.1 Button Component
**File:** `src/components/ui/button.tsx`

Remove all rounded corners:
- `rounded-lg` → `rounded-none` or remove
- `rounded` → `rounded-none` or remove
- `rounded-md` → `rounded-none` or remove

Updated base class:
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
```

Update size variants:
```tsx
size: {
  default: "h-8 px-3 py-1.5",
  sm: "h-7 px-2 text-xs",
  lg: "h-9 px-6 text-sm",
  icon: "h-8 w-8",
},
```

---

#### 5.2 Card Component
**File:** `src/components/ui/card.tsx`

Remove rounded corners:
```tsx
className={cn(
  "rounded-none border bg-card text-card-foreground shadow-sm transition-all duration-300",
  className
)}
```

Update CardHeader and CardContent to use compact padding:
```tsx
className={cn("flex flex-col space-y-1 px-3 py-2", className)}
className={cn("px-3 py-2 pt-0", className)}
className={cn("flex items-center px-3 py-2 pt-0", className)}
```

---

#### 5.3 Input Component
**File:** `src/components/ui/input.tsx`

Remove rounded corners:
```tsx
className={cn(
  "flex h-8 w-full rounded-none border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  className
)}
```

---

#### 5.4 Dialog Component
**File:** `src/components/ui/dialog.tsx`

Update DialogContent:
```tsx
className={cn(
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-3 border bg-card p-4 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  className
)}
```

Update close button:
```tsx
className="absolute right-4 top-4 rounded-none opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
```

---

#### 5.5 Select Component
**File:** `src/components/ui/select.tsx`

Update SelectTrigger:
```tsx
className={cn(
  "flex h-8 w-full items-center justify-between rounded-none border border-input bg-background px-2.5 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  className
)}
```

Update SelectContent:
```tsx
className={cn(
  "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-none border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  // ...
)}
```

Update SelectItem:
```tsx
className={cn(
  "relative flex w-full cursor-default select-none items-center rounded-none py-1 pl-7 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  className
)}
```

---

#### 5.6 Tabs Component
**File:** `src/components/ui/tabs.tsx`

Update TabsList:
```tsx
className={cn(
  "inline-flex h-8 items-center justify-center rounded-none bg-muted p-0.5 text-muted-foreground",
  className
)}
```

Update TabsTrigger:
```tsx
className={cn(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none px-2.5 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
  className
)}
```

---

#### 5.7 Tooltip Component
**File:** `src/components/ui/tooltip.tsx`

Update TooltipContent:
```tsx
className={cn(
  "z-50 overflow-hidden rounded-none border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  className
)}
```

---

### Step 6: Update Feature Components

#### 6.1 Dashboard
**File:** `src/features/dashboard/Dashboard.tsx`

Changes:
- Remove `rounded-xl`, `rounded-lg`, `rounded-full` from all elements
- Apply `amount` class to all monetary values (`${...}`)
- Apply `font-sans` to non-monetary text
- Use compact padding throughout

Key updates:
```tsx
// Summary cards - remove rounded corners
<Card className="border-l-4 border-l-primary">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-xs font-medium">Total Balance</CardTitle>
    <div className="p-1.5 bg-primary/10">
      <Wallet className="h-3.5 w-3.5 text-primary" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-xl font-bold amount">${totalBalance.toFixed(2)}</div>
    <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
  </CardContent>
</Card>

// Account items - remove rounded corners
<div className="flex items-center justify-between p-3 border-b border-border hover:bg-muted/50 transition-all duration-300 group">
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
      {account.icon || '💳'}
    </div>
    <div>
      <p className="font-semibold text-sm">{account.name}</p>
      <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
    </div>
  </div>
  <div className="text-right">
    <p className="font-bold text-base amount">${account.balance.toFixed(2)}</p>
    <p className="text-xs text-muted-foreground">{account.currency}</p>
  </div>
</div>
```

---

#### 6.2 Transactions
**File:** `src/features/transactions/Transactions.tsx`

Changes:
- Remove `rounded-lg`, `rounded-md`, `rounded-full`
- Apply `amount` class to all monetary values
- Update transaction list items to use border-based styling

Key updates:
```tsx
// Transaction items
<div className="flex items-center justify-between p-3 border-b border-border hover:bg-muted/50 transition-all duration-300 group">
  <div className="flex items-center space-x-3">
    <div className={`w-10 h-10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform ${
      transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
    }`}>
      {category?.icon || '💰'}
    </div>
    <div>
      <p className="font-semibold text-sm">{transaction.vendor}</p>
      <p className="text-xs text-muted-foreground">
        {account?.name || 'Unknown'} • {category?.name || 'Unknown'}
      </p>
      <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
    </div>
  </div>
  <div className="flex items-center space-x-3">
    <div className="text-right">
      <p className={`text-base font-bold amount ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
      </p>
      {/* ... */}
    </div>
  </div>
</div>
```

---

#### 6.3 Accounts
**File:** `src/features/accounts/Accounts.tsx`

Changes:
- Remove `rounded-lg`, `rounded-full`, `rounded-xl`
- Apply `amount` class to balance displays
- Update account cards to use border-based styling

---

#### 6.4 Budgets
**File:** `src/features/budgets/Budgets.tsx`

Changes:
- Remove `rounded-xl`, `rounded-full`
- Apply `amount` class to budget values
- Update progress bar to use sharp corners

Key update for progress bar:
```tsx
<div className="h-4 bg-muted overflow-hidden">
  <div
    className={`h-full progress-animated ${
      budget.isOverBudget ? 'bg-destructive' : 'bg-primary'
    }`}
    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
  />
</div>
```

---

#### 6.5 Categories
**File:** `src/features/categories/Categories.tsx`

Changes:
- Remove `rounded-lg`, `rounded-full`
- Update category items to use border-based styling

---

#### 6.6 Analytics
**File:** `src/features/analytics/Analytics.tsx`

Changes:
- Remove `rounded-lg`, `rounded-full`
- Apply `amount` class to all monetary values
- Update category detail items to use border-based styling

---

#### 6.7 Settings
**File:** `src/features/settings/Settings.tsx`

Changes:
- Remove `rounded-lg`, `rounded-full`
- Apply `amount` class to numerical displays

---

### Step 7: Update Layout Components

#### 7.1 Layout
**File:** `src/components/layout/Layout.tsx`

Changes:
- Remove `rounded-lg` from navigation items
- Remove `rounded-full` from icon containers
- Update sidebar and mobile navigation to use sharp corners

Key updates:
```tsx
// Navigation items
<Link
  key={item.path}
  to={item.path}
  className={`flex items-center justify-between px-3 py-2 transition-all duration-200 group ${
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'hover:bg-accent hover:text-accent-foreground hover:translate-x-1'
  }`}
>
  {/* ... */}
</Link>

// Mobile bottom nav
<Link
  key={item.path}
  to={item.path}
  className={`flex flex-col items-center p-1.5 transition-all duration-200 ${
    isActive
      ? 'text-primary bg-primary/10'
      : 'text-muted-foreground hover:text-foreground'
  }`}
>
  {/* ... */}
</Link>
```

---

#### 7.2 Global Search
**File:** `src/components/search/GlobalSearch.tsx`

Changes:
- Remove `rounded-lg` from search results and buttons
- Apply `amount` class to monetary values in search results

---

#### 7.3 Keyboard Help Dialog
**File:** `src/components/keyboard/KeyboardHelpDialog.tsx`

Changes:
- Remove `rounded-lg` from shortcut items

---

### Step 8: Apply Monospace Font to Amounts

Create a consistent pattern for displaying amounts:
- Use `amount` utility class for all monetary values
- Use `amount-sm`, `amount-lg`, `amount-xl` for different sizes
- Apply `tabular-nums` for consistent number alignment

Example pattern:
```tsx
<p className="amount">${amount.toFixed(2)}</p>
<p className="amount-lg">${total.toFixed(2)}</p>
<p className="amount-sm text-muted-foreground">${smallAmount.toFixed(2)}</p>
```

---

### Step 9: Apply Open Sans to Text

All non-monetary text should use Open Sans:
- Labels, headings, descriptions
- Button text
- Form labels
- Navigation items

This is handled by the default `font-sans` class in Tailwind.

---

## Summary of Changes

### Files to Modify

1. **index.html** - Add Google Fonts
2. **tailwind.config.js** - Add font families
3. **src/index.css** - Remove rounded corners, add utility classes
4. **src/components/ui/button.tsx** - Remove rounded corners
5. **src/components/ui/card.tsx** - Remove rounded corners, compact padding
6. **src/components/ui/input.tsx** - Remove rounded corners
7. **src/components/ui/dialog.tsx** - Remove rounded corners
8. **src/components/ui/select.tsx** - Remove rounded corners
9. **src/components/ui/tabs.tsx** - Remove rounded corners
10. **src/components/ui/tooltip.tsx** - Remove rounded corners
11. **src/features/dashboard/Dashboard.tsx** - Remove rounded corners, apply amount class
12. **src/features/transactions/Transactions.tsx** - Remove rounded corners, apply amount class
13. **src/features/accounts/Accounts.tsx** - Remove rounded corners, apply amount class
14. **src/features/budgets/Budgets.tsx** - Remove rounded corners, apply amount class
15. **src/features/categories/Categories.tsx** - Remove rounded corners
16. **src/features/analytics/Analytics.tsx** - Remove rounded corners, apply amount class
17. **src/features/settings/Settings.tsx** - Remove rounded corners
18. **src/components/layout/Layout.tsx** - Remove rounded corners
19. **src/components/search/GlobalSearch.tsx** - Remove rounded corners, apply amount class
20. **src/components/keyboard/KeyboardHelpDialog.tsx** - Remove rounded corners

---

## Visual Style Reference

### Before (Current)
- Rounded corners everywhere (rounded-lg, rounded-xl, rounded-full)
- Inter font family
- Gradients and glassmorphism effects
- Generous padding and spacing

### After (Target)
- Sharp, angular edges (border-radius: 0)
- Open Sans for text, JetBrains Mono for numbers
- Clean borders and grid-like layouts
- Compact spacing for information density
- Excel-like data presentation

---

## Testing Checklist

- [ ] All rounded corners removed
- [ ] Open Sans font loads and is applied to text
- [ ] JetBrains Mono font loads and is applied to amounts
- [ ] All monetary values use monospace font
- [ ] Consistent spacing across all components
- [ ] Hover states work correctly without rounded corners
- [ ] Dialogs and modals display correctly
- [ ] Forms and inputs are properly styled
- [ ] Responsive design maintained
- [ ] Accessibility preserved (focus states, keyboard navigation)
