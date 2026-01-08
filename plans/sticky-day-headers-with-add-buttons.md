# Sticky Day Headers with Add Buttons - Implementation Plan

## Overview
Add sticky day headers to transaction listings that split transactions into per-day chunks. Each day header includes an add button that prefills the transaction form with the appropriate context.

## Requirements
1. **Sticky Headers**: Day headers should stick to the top as the user scrolls through transactions
2. **Per-Day Grouping**: Transactions are grouped and displayed by date
3. **Add Button**: Each day header has an add button that opens the transaction dialog
4. **Context-Aware Prefill**:
   - On account details page: prefill account ID and date
   - On transactions page: prefill date only

## Current State Analysis

### Existing Components
- `Transactions.tsx`: Displays all transactions in a flat excel-like table
- `AccountDetails.tsx`: Displays transactions for a specific account
- Both use the same `excel-table` styling from `src/index.css`
- Dates are stored as `Date` objects and formatted using utility functions

### Date Utility Functions (from `src/lib/utils.ts`)
- `formatDisplayDate(date: Date)`: Formats as "Month Day, Year" (e.g., "Jan 5, 2026")
- `formatLocalDate(date: Date)`: Formats as "YYYY-MM-DD" for date inputs
- `getTodayDateString()`: Returns today's date as "YYYY-MM-DD"
- `parseLocalDate(dateString: string)`: Converts "YYYY-MM-DD" to Date object

## Implementation Plan

### 1. Add Utility Functions (`src/lib/utils.ts`)

Add helper functions for date grouping and display:

```typescript
/**
 * Groups transactions by date string (YYYY-MM-DD)
 * Returns a Map where keys are date strings and values are arrays of transactions
 */
export function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  
  transactions.forEach(transaction => {
    const dateKey = formatLocalDate(transaction.date);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(transaction);
  });
  
  return grouped;
}

/**
 * Formats a date for display in day headers
 * Returns "Today", "Yesterday", or formatted date
 */
export function formatDayHeaderDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Compare dates (ignoring time)
  const compareDates = (d1: Date, d2: Date) => {
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
           d1.getUTCMonth() === d2.getUTCMonth() &&
           d1.getUTCDate() === d2.getUTCDate();
  };
  
  if (compareDates(date, today)) {
    return 'Today';
  } else if (compareDates(date, yesterday)) {
    return 'Yesterday';
  } else {
    return formatDisplayDate(date);
  }
}

/**
 * Sorts date keys in descending order (newest first)
 */
export function sortDateKeysDesc(dateKeys: string[]): string[] {
  return dateKeys.sort((a, b) => b.localeCompare(a));
}
```

### 2. Add CSS Styles (`src/index.css`)

Add styles for sticky day headers:

```css
/* Sticky day header for transaction grouping */
.sticky-day-header {
  @apply sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border;
}

.dark .sticky-day-header {
  @apply bg-card/95 border-white/20;
}

/* Day header content container */
.day-header-content {
  @apply flex items-center justify-between px-3 py-2;
}

/* Day header date label */
.day-header-date {
  @apply text-sm font-semibold text-foreground;
}

/* Day header transaction count */
.day-header-count {
  @apply text-xs text-muted-foreground ml-2;
}

/* Day header add button */
.day-header-add-btn {
  @apply h-7 px-2 text-xs;
}
```

### 3. Create Reusable Component (`src/components/transactions/TransactionDayHeader.tsx`)

Create a new component for the sticky day header:

```typescript
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDayHeaderDate } from '@/lib/utils';

interface TransactionDayHeaderProps {
  date: Date;
  transactionCount: number;
  onAddClick: () => void;
}

export function TransactionDayHeader({ 
  date, 
  transactionCount, 
  onAddClick 
}: TransactionDayHeaderProps) {
  const displayDate = formatDayHeaderDate(date);
  
  return (
    <div className="sticky-day-header">
      <div className="day-header-content">
        <div className="flex items-center">
          <span className="day-header-date">{displayDate}</span>
          <span className="day-header-count">
            ({transactionCount} transaction{transactionCount !== 1 ? 's' : ''})
          </span>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="day-header-add-btn"
          onClick={onAddClick}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
```

### 4. Modify `Transactions.tsx`

Update to use day headers with date prefill:

```typescript
// Add new imports
import { groupTransactionsByDate, sortDateKeysDesc, formatLocalDate } from '@/lib/utils';
import { TransactionDayHeader } from '@/components/transactions/TransactionDayHeader';

// Modify the transaction list rendering section (lines 299-374)
// Replace the flat list with grouped rendering:

{filteredTransactions.length === 0 ? (
  // ... existing empty state
) : (
  <div className="excel-table">
    {/* Table Header */}
    <div className="excel-table-header">
      <div className="excel-table-header-cell col-icon"></div>
      <div className="excel-table-header-cell col-vendor">Vendor</div>
      <div className="excel-table-header-cell col-category">Category</div>
      <div className="excel-table-header-cell col-tags">Tags</div>
      <div className="excel-table-header-cell col-date">Date</div>
      <div className="excel-table-header-cell col-type">Type</div>
      <div className="excel-table-header-cell col-amount">Amount</div>
      <div className="excel-table-header-cell w-20 flex-shrink-0"></div>
    </div>
    
    {/* Table Body with Day Grouping */}
    <div className="excel-table-body">
      {(() => {
        const grouped = groupTransactionsByDate(filteredTransactions);
        const sortedDates = sortDateKeysDesc(Array.from(grouped.keys()));
        
        return sortedDates.map((dateKey) => {
          const dayTransactions = grouped.get(dateKey)!;
          const date = parseLocalDate(dateKey);
          
          return (
            <div key={dateKey}>
              {/* Sticky Day Header */}
              <TransactionDayHeader
                date={date}
                transactionCount={dayTransactions.length}
                onAddClick={() => handleAddTransactionForDate(dateKey)}
              />
              
              {/* Transactions for this day */}
              {dayTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId);
                const transactionTags = tags.filter(tag => transaction.tagIds.includes(tag.id));
                
                return (
                  <div key={transaction.id} className="excel-table-row group">
                    {/* ... existing transaction row rendering ... */}
                  </div>
                );
              })}
            </div>
          );
        });
      })()}
    </div>
  </div>
)}

// Add new handler function (before handleSubmit)
const handleAddTransactionForDate = (dateString: string) => {
  setFormData({
    accountId: '',
    categoryId: '',
    amount: '',
    type: 'expense',
    date: dateString,
    vendor: '',
    notes: '',
    tagIds: [],
  });
  setEditingTransaction(null);
  setIsOpen(true);
};
```

### 5. Modify `AccountDetails.tsx`

Update to use day headers with account+date prefill:

```typescript
// Add new imports
import { groupTransactionsByDate, sortDateKeysDesc, formatLocalDate, parseLocalDate } from '@/lib/utils';
import { TransactionDayHeader } from '@/components/transactions/TransactionDayHeader';

// Modify the transaction list rendering section (lines 582-638)
// Replace the flat list with grouped rendering:

{transactions.length === 0 ? (
  // ... existing empty state
) : (
  <div className="excel-table">
    {/* Table Header */}
    <div className="excel-table-header">
      <div className="excel-table-header-cell col-icon"></div>
      <div className="excel-table-header-cell col-vendor">Vendor</div>
      <div className="excel-table-header-cell col-category hide-on-mobile">Category</div>
      <div className="excel-table-header-cell col-date">Date</div>
      <div className="excel-table-header-cell col-type hide-on-mobile">Type</div>
      <div className="excel-table-header-cell col-amount">Amount</div>
      <div className="excel-table-header-cell w-12 flex-shrink-0"></div>
    </div>
    
    {/* Table Body with Day Grouping */}
    <div className="excel-table-body">
      {(() => {
        const grouped = groupTransactionsByDate(transactions);
        const sortedDates = sortDateKeysDesc(Array.from(grouped.keys()));
        
        return sortedDates.map((dateKey) => {
          const dayTransactions = grouped.get(dateKey)!;
          const date = parseLocalDate(dateKey);
          
          return (
            <div key={dateKey}>
              {/* Sticky Day Header */}
              <TransactionDayHeader
                date={date}
                transactionCount={dayTransactions.length}
                onAddClick={() => handleAddTransactionForDate(dateKey)}
              />
              
              {/* Transactions for this day */}
              {dayTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId);
                
                return (
                  <div key={transaction.id} className="excel-table-row group">
                    {/* ... existing transaction row rendering ... */}
                  </div>
                );
              })}
            </div>
          );
        });
      })()}
    </div>
  </div>
)}

// Add new handler function (before handleTransactionSubmit)
const handleAddTransactionForDate = (dateString: string) => {
  setTransactionFormData({
    accountId: id || '',
    categoryId: '',
    amount: '',
    type: 'expense',
    date: dateString,
    vendor: '',
    notes: '',
    tagIds: [],
  });
  setIsAddTransactionOpen(true);
};
```

## File Changes Summary

| File | Changes |
|------|---------|
| `src/lib/utils.ts` | Add 3 new utility functions for date grouping and display |
| `src/index.css` | Add CSS styles for sticky day headers |
| `src/components/transactions/TransactionDayHeader.tsx` | **NEW** - Create reusable day header component |
| `src/features/transactions/Transactions.tsx` | Modify to use day headers with date prefill |
| `src/features/accounts/AccountDetails.tsx` | Modify to use day headers with account+date prefill |

## Testing Checklist

- [ ] Sticky headers remain visible when scrolling through transactions
- [ ] Day headers display correct date (Today/Yesterday/formatted)
- [ ] Transaction count is accurate for each day
- [ ] Add button on Transactions page opens dialog with date prefilled
- [ ] Add button on AccountDetails page opens dialog with account AND date prefilled
- [ ] Styling is consistent in both light and dark modes
- [ ] Responsive behavior works correctly on mobile
- [ ] Existing functionality (edit, delete, search) continues to work
