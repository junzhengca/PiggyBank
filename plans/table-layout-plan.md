# Excel-like Table Layout Plan

## Overview
Transform the Dashboard and Transactions views to use Excel-like table layouts with clear columns and rows while maintaining colors, icons, and visual elements.

## Table Column Specifications

### Transactions Table
**Columns:** Icon | Vendor | Category | Date | Type | Amount

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Icon | 40px | Center | Category icon with colored background |
| Vendor | Auto | Left | Vendor name (primary text) |
| Category | Auto | Left | Category name with icon |
| Date | Auto | Left | Formatted date |
| Type | Auto | Left | Income/Expense with arrow icon |
| Amount | Auto | Right | Monetary value with +/- prefix, colored by type |

### Accounts Table
**Columns:** Icon | Name | Type | Last Reviewed | Balance

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Icon | 40px | Center | Account type icon |
| Name | Auto | Left | Account name with review alert if needed |
| Type | Auto | Left | Account type (checking, savings, etc.) |
| Last Reviewed | Auto | Left | Relative time since last review |
| Balance | Auto | Right | Current balance with currency |

---

## Implementation Steps

### Step 1: Add Excel-like Table Utility Classes
**File:** `src/index.css`

Add new utility classes for table styling:

```css
/* Table container */
.excel-table {
  @apply w-full border border-border;
}

/* Table header row */
.excel-table-header {
  @apply flex items-center bg-muted/80 border-b border-border font-semibold text-sm text-muted-foreground;
}

/* Table header cell */
.excel-table-header-cell {
  @apply px-3 py-2 text-sm font-medium;
}

/* Table body */
.excel-table-body {
  @apply divide-y divide-border;
}

/* Table row */
.excel-table-row {
  @apply flex items-center hover:bg-muted/50 transition-colors duration-150;
}

/* Table cell */
.excel-table-cell {
  @apply px-3 py-2 text-sm;
}

/* Column-specific widths */
.col-icon { @apply w-10 flex-shrink-0; }
.col-vendor { @apply flex-1 min-w-[120px]; }
.col-category { @apply w-32 flex-shrink-0; }
.col-date { @apply w-28 flex-shrink-0; }
.col-type { @apply w-20 flex-shrink-0; }
.col-amount { @apply w-28 flex-shrink-0 text-right; }
.col-name { @apply flex-1 min-w-[100px]; }
.col-account-type { @apply w-24 flex-shrink-0; }
.col-reviewed { @apply w-32 flex-shrink-0; }
.col-balance { @apply w-32 flex-shrink-0 text-right; }

/* Icon cell styling */
.icon-cell {
  @apply w-10 h-10 flex items-center justify-center;
}

/* Colored icon backgrounds */
.icon-income { @apply bg-success/10; }
.icon-expense { @apply bg-destructive/10; }
.icon-account { @apply bg-primary/10; }

/* Status badges */
.status-income {
  @apply inline-flex items-center gap-1 text-xs font-medium text-success;
}

.status-expense {
  @apply inline-flex items-center gap-1 text-xs font-medium text-destructive;
}

/* Review alert badge */
.review-alert {
  @apply inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400;
}

/* Mobile responsive - hide less important columns on small screens */
@media (max-width: 640px) {
  .hide-on-mobile {
    @apply hidden;
  }
}

@media (max-width: 768px) {
  .hide-on-tablet {
    @apply hidden;
  }
}
```

---

### Step 2: Update Dashboard - Accounts Section
**File:** `src/features/dashboard/Dashboard.tsx`

Replace the accounts list with a table layout:

```tsx
{/* Table Header */}
<div className="excel-table-header">
  <div className="excel-table-header-cell col-icon"></div>
  <div className="excel-table-header-cell col-name">Name</div>
  <div className="excel-table-header-cell col-account-type hide-on-mobile">Type</div>
  <div className="excel-table-header-cell col-reviewed hide-on-tablet">Last Reviewed</div>
  <div className="excel-table-header-cell col-balance">Balance</div>
</div>

{/* Table Body */}
<div className="excel-table-body">
  {accounts.map((account) => (
    <Link key={account.id} to={`/accounts/${account.id}`}>
      <div className="excel-table-row group">
        <div className="excel-table-cell col-icon">
          <div className="icon-cell icon-account">
            {accountIcons[account.type]}
          </div>
        </div>
        <div className="excel-table-cell col-name">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{account.name}</span>
            {needsReview && (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            )}
          </div>
        </div>
        <div className="excel-table-cell col-account-type hide-on-mobile">
          <span className="text-muted-foreground capitalize">{account.type}</span>
        </div>
        <div className={`excel-table-cell col-reviewed hide-on-tablet ${needsReview ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
          {formatLastReviewed(account.lastReviewedAt)}
        </div>
        <div className="excel-table-cell col-balance">
          <span className="amount font-semibold">${account.balance.toFixed(2)}</span>
          {isCreditCard && availableCredit !== null && (
            <div className="text-xs text-muted-foreground">
              <span className="text-success">${availableCredit.toFixed(2)} available</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  ))}
</div>
```

---

### Step 3: Update Dashboard - Recent Transactions Section
**File:** `src/features/dashboard/Dashboard.tsx`

Replace the transactions list with a table layout:

```tsx
{/* Table Header */}
<div className="excel-table-header">
  <div className="excel-table-header-cell col-icon"></div>
  <div className="excel-table-header-cell col-vendor">Vendor</div>
  <div className="excel-table-header-cell col-category hide-on-mobile">Category</div>
  <div className="excel-table-header-cell col-date hide-on-tablet">Date</div>
  <div className="excel-table-header-cell col-type hide-on-mobile">Type</div>
  <div className="excel-table-header-cell col-amount">Amount</div>
</div>

{/* Table Body */}
<div className="excel-table-body">
  {transactions.slice(0, 5).map((transaction) => {
    const category = categories.find((c) => c.id === transaction.categoryId);
    return (
      <div key={transaction.id} className="excel-table-row group">
        <div className="excel-table-cell col-icon">
          <div className={`icon-cell ${transaction.type === 'income' ? 'icon-income' : 'icon-expense'}`}>
            {category?.icon || '💰'}
          </div>
        </div>
        <div className="excel-table-cell col-vendor">
          <span className="font-semibold">{transaction.vendor}</span>
        </div>
        <div className="excel-table-cell col-category hide-on-mobile">
          <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
        </div>
        <div className="excel-table-cell col-date hide-on-tablet">
          <span className="text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
        </div>
        <div className="excel-table-cell col-type hide-on-mobile">
          <div className={transaction.type === 'income' ? 'status-income' : 'status-expense'}>
            {transaction.type === 'income' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {transaction.type}
          </div>
        </div>
        <div className="excel-table-cell col-amount">
          <span className={`amount font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </span>
        </div>
      </div>
    );
  })}
</div>
```

---

### Step 4: Update Transactions Page
**File:** `src/features/transactions/Transactions.tsx`

Replace the transactions list with a table layout (similar to Dashboard but with all transactions and edit/delete actions):

```tsx
{/* Table Header */}
<div className="excel-table-header">
  <div className="excel-table-header-cell col-icon"></div>
  <div className="excel-table-header-cell col-vendor">Vendor</div>
  <div className="excel-table-header-cell col-category">Category</div>
  <div className="excel-table-header-cell col-date">Date</div>
  <div className="excel-table-header-cell col-type">Type</div>
  <div className="excel-table-header-cell col-amount">Amount</div>
  <div className="excel-table-header-cell w-20 flex-shrink-0"></div>
</div>

{/* Table Body */}
<div className="excel-table-body">
  {filteredTransactions.map((transaction) => {
    const account = accounts.find((a) => a.id === transaction.accountId);
    const category = categories.find((c) => c.id === transaction.categoryId);
    return (
      <div key={transaction.id} className="excel-table-row group">
        <div className="excel-table-cell col-icon">
          <div className={`icon-cell ${transaction.type === 'income' ? 'icon-income' : 'icon-expense'}`}>
            {category?.icon || '💰'}
          </div>
        </div>
        <div className="excel-table-cell col-vendor">
          <span className="font-semibold">{transaction.vendor}</span>
        </div>
        <div className="excel-table-cell col-category">
          <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
        </div>
        <div className="excel-table-cell col-date">
          <span className="text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
        </div>
        <div className="excel-table-cell col-type">
          <div className={transaction.type === 'income' ? 'status-income' : 'status-expense'}>
            {transaction.type === 'income' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {transaction.type}
          </div>
        </div>
        <div className="excel-table-cell col-amount">
          <span className={`amount font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </span>
        </div>
        <div className="excel-table-cell w-20 flex-shrink-0">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={() => handleEdit(transaction)} className="h-7 w-7">
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(transaction.id)} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  })}
</div>
```

---

### Step 5: Update AccountDetails - Transactions Section
**File:** `src/features/accounts/AccountDetails.tsx`

Replace the transactions list with a table layout (similar to Transactions page):

```tsx
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

{/* Table Body */}
<div className="excel-table-body">
  {transactions.map((transaction) => {
    const category = categories.find((c) => c.id === transaction.categoryId);
    return (
      <div key={transaction.id} className="excel-table-row group">
        <div className="excel-table-cell col-icon">
          <div className={`icon-cell ${transaction.type === 'income' ? 'icon-income' : 'icon-expense'}`}>
            {category?.icon || '💰'}
          </div>
        </div>
        <div className="excel-table-cell col-vendor">
          <span className="font-semibold">{transaction.vendor}</span>
        </div>
        <div className="excel-table-cell col-category hide-on-mobile">
          <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
        </div>
        <div className="excel-table-cell col-date">
          <span className="text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
        </div>
        <div className="excel-table-cell col-type hide-on-mobile">
          <div className={transaction.type === 'income' ? 'status-income' : 'status-expense'}>
            {transaction.type === 'income' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {transaction.type}
          </div>
        </div>
        <div className="excel-table-cell col-amount">
          <span className={`amount font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </span>
        </div>
        <div className="excel-table-cell w-12 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleTransactionDelete(transaction.id)}
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  })}
</div>
```

---

## Design Principles

### Visual Elements Preserved
- **Icons:** Category and account type icons with colored backgrounds
- **Colors:** Success (green) for income, destructive (red) for expenses, amber for review alerts
- **Hover Effects:** Row hover highlighting, action buttons appear on hover
- **Status Indicators:** Arrow icons for transaction type, alert triangle for review needed

### Excel-like Characteristics
- **Clear Column Headers:** Bold, muted text with background color
- **Consistent Alignment:** Left-aligned text, right-aligned numbers
- **Grid Layout:** Flexbox-based columns with fixed widths for consistency
- **Border Separation:** Horizontal borders between rows
- **Compact Spacing:** Efficient use of space with consistent padding

### Responsive Behavior
- **Mobile (< 640px):** Hide category and type columns, show only essential info
- **Tablet (< 768px):** Hide last reviewed column, show most important columns
- **Desktop:** Show all columns

---

## Files to Modify

1. `src/index.css` - Add table utility classes
2. `src/features/dashboard/Dashboard.tsx` - Update accounts and transactions sections
3. `src/features/transactions/Transactions.tsx` - Update transactions list
4. `src/features/accounts/AccountDetails.tsx` - Update transactions section

---

## Testing Checklist

- [ ] Table headers display correctly
- [ ] Columns align properly in all views
- [ ] Icons and colors are preserved
- [ ] Hover effects work on rows
- [ ] Action buttons appear on hover
- [ ] Responsive behavior works on mobile
- [ ] Amounts use monospace font and align correctly
- [ ] Review alerts display properly
- [ ] Empty states still display correctly
- [ ] Links work correctly for account rows
