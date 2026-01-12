import React from 'react';
import { Transaction, Category, Tag } from '@/types';
import { formatDisplayDate, groupTransactionsByDate, sortDateKeysDesc, parseLocalDate } from '@/lib/utils';
import { TransactionDayHeader } from './TransactionDayHeader';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface TransactionTableColumn {
  key: 'icon' | 'vendor' | 'category' | 'tags' | 'date' | 'type' | 'amount' | 'actions';
  label: string;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

export interface TransactionTableAction {
  type: 'edit' | 'delete';
  onClick: (transaction: Transaction) => void;
  icon?: React.ReactNode;
}

export interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  tags?: Tag[];
  columns?: TransactionTableColumn[];
  actions?: TransactionTableAction[];
  groupByDate?: boolean;
  limit?: number;
  layout?: 'table' | 'excel';
  onAddTransactionForDate?: (dateString: string) => void;
  emptyMessage?: React.ReactNode;
  className?: string;
}

const DEFAULT_COLUMNS: TransactionTableColumn[] = [
  { key: 'icon', label: '', className: 'w-12' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'category', label: 'Category', hideOnMobile: true },
  { key: 'tags', label: 'Tags' },
  { key: 'date', label: 'Date' },
  { key: 'type', label: 'Type', hideOnMobile: true },
  { key: 'amount', label: 'Amount', className: 'text-right' },
  { key: 'actions', label: '', className: 'w-20 text-right' },
];

export function TransactionTable({
  transactions,
  categories,
  tags = [],
  columns = DEFAULT_COLUMNS,
  actions = [],
  groupByDate = false,
  limit,
  layout = 'table',
  onAddTransactionForDate,
  emptyMessage,
  className = '',
}: TransactionTableProps) {
  // Apply limit if specified
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  // Filter columns based on visibility
  const visibleColumns = columns.filter(col => {
    // Always show icon, vendor, and amount
    if (['icon', 'vendor', 'amount'].includes(col.key)) return true;
    // Show other columns based on their hide flags (simplified - you might want responsive logic)
    return true;
  });

  const renderTransactionRow = (transaction: Transaction) => {
    const category = categories.find((c) => c.id === transaction.categoryId);
    const transactionTags = tags.filter(tag => transaction.tagIds.includes(tag.id));

    if (layout === 'excel') {
      return (
        <div key={transaction.id} className="excel-table-row group">
          {visibleColumns.map((col) => {
            switch (col.key) {
              case 'icon':
                return (
                  <div key={col.key} className={`excel-table-cell col-icon ${col.className || ''}`}>
                    <div className={`icon-cell ${transaction.type === 'income' ? 'icon-income' : 'icon-expense'}`}>
                      {category?.icon || '💰'}
                    </div>
                  </div>
                );
              case 'vendor':
                return (
                  <div key={col.key} className={`excel-table-cell col-vendor ${col.className || ''}`}>
                    <span className="font-semibold">{transaction.vendor}</span>
                  </div>
                );
              case 'category':
                return (
                  <div key={col.key} className={`excel-table-cell col-category ${col.hideOnMobile ? 'hide-on-mobile' : ''} ${col.className || ''}`}>
                    <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
                  </div>
                );
              case 'tags':
                return (
                  <div key={col.key} className={`excel-table-cell col-tags ${col.className || ''}`}>
                    <div className="flex flex-wrap gap-1">
                      {transactionTags.length === 0 ? (
                        <span className="text-muted-foreground text-xs">-</span>
                      ) : (
                        transactionTags.map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              case 'date':
                return (
                  <div key={col.key} className={`excel-table-cell col-date ${col.className || ''}`}>
                    <span className="text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
                  </div>
                );
              case 'type':
                return (
                  <div key={col.key} className={`excel-table-cell col-type ${col.hideOnMobile ? 'hide-on-mobile' : ''} ${col.className || ''}`}>
                    <div className={`flex items-center gap-2 text-xs font-medium ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {transaction.type}
                    </div>
                  </div>
                );
              case 'amount':
                return (
                  <div key={col.key} className={`excel-table-cell col-amount ${col.className || ''}`}>
                    <span className={`amount font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                );
              case 'actions':
                return (
                  <div key={col.key} className={`excel-table-cell ${col.className || 'w-12 flex-shrink-0'}`}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {actions.map((action, idx) => {
                        if (action.type === 'edit') {
                          return (
                            <Button
                              key={idx}
                              size="icon"
                              variant="ghost"
                              onClick={() => action.onClick(transaction)}
                              className="h-7 w-7"
                            >
                              {action.icon || <Edit className="h-3.5 w-3.5" />}
                            </Button>
                          );
                        } else if (action.type === 'delete') {
                          return (
                            <Button
                              key={idx}
                              size="icon"
                              variant="ghost"
                              onClick={() => action.onClick(transaction)}
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {action.icon || <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      );
    } else {
      // HTML table layout
      return (
        <tr key={transaction.id} className="group hover:bg-accent transition-colors">
          {visibleColumns.map((col) => {
            switch (col.key) {
              case 'icon':
                return (
                  <td key={col.key} className={`px-6 py-3 ${col.className || ''}`}>
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                      <span className="text-sm">{category?.icon || '💰'}</span>
                    </div>
                  </td>
                );
              case 'vendor':
                return (
                  <td key={col.key} className={`px-6 py-3 ${col.className || ''}`}>
                    <span className="font-semibold text-sm">{transaction.vendor}</span>
                  </td>
                );
              case 'category':
                return (
                  <td key={col.key} className={`px-6 py-3 ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className || ''}`}>
                    <span className="text-sm text-muted-foreground">{category?.name || 'Unknown'}</span>
                  </td>
                );
              case 'tags':
                return (
                  <td key={col.key} className={`px-6 py-3 ${col.className || ''}`}>
                    <div className="flex flex-wrap gap-1">
                      {transactionTags.length === 0 ? (
                        <span className="text-muted-foreground text-xs">-</span>
                      ) : (
                        transactionTags.map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                );
              case 'date':
                return (
                  <td key={col.key} className={`px-6 py-3 ${col.hideOnTablet ? 'hidden lg:table-cell' : ''} ${col.className || ''}`}>
                    <span className="text-sm text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
                  </td>
                );
              case 'type':
                return (
                  <td key={col.key} className={`px-6 py-3 ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.className || ''}`}>
                    <div className={`inline-flex items-center gap-1 text-xs font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {transaction.type}
                    </div>
                  </td>
                );
              case 'amount':
                return (
                  <td key={col.key} className={`px-6 py-3 text-right ${col.className || ''}`}>
                    <span className={`amount font-semibold text-sm ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                );
              case 'actions':
                return (
                  <td key={col.key} className={`px-6 py-3 text-right ${col.className || 'w-20'}`}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {actions.map((action, idx) => {
                        if (action.type === 'edit') {
                          return (
                            <Button
                              key={idx}
                              size="icon"
                              variant="ghost"
                              onClick={() => action.onClick(transaction)}
                              className="h-7 w-7"
                            >
                              {action.icon || <Edit className="h-3.5 w-3.5" />}
                            </Button>
                          );
                        } else if (action.type === 'delete') {
                          return (
                            <Button
                              key={idx}
                              size="icon"
                              variant="ghost"
                              onClick={() => action.onClick(transaction)}
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {action.icon || <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </td>
                );
              default:
                return null;
            }
          })}
        </tr>
      );
    }
  };

  if (displayTransactions.length === 0) {
    return (
      <div className={className}>
        {emptyMessage || (
          <div className="flex flex-col items-center justify-center py-8 text-center px-6">
            <div className="p-3 bg-muted rounded-md mb-3">
              <span className="text-muted-foreground">No transactions</span>
            </div>
            <p className="text-sm text-muted-foreground">No transactions found.</p>
          </div>
        )}
      </div>
    );
  }

  if (layout === 'excel') {
    return (
      <div className={`excel-table ${className}`}>
        {/* Table Header */}
        <div className="excel-table-header">
          {visibleColumns.map((col) => (
            <div
              key={col.key}
              className={`excel-table-header-cell ${col.key === 'icon' ? 'col-icon' : col.key === 'vendor' ? 'col-vendor' : col.key === 'category' ? 'col-category' : col.key === 'tags' ? 'col-tags' : col.key === 'date' ? 'col-date' : col.key === 'type' ? 'col-type' : col.key === 'amount' ? 'col-amount' : ''} ${col.hideOnMobile ? 'hide-on-mobile' : ''} ${col.className || ''}`}
            >
              {col.label}
            </div>
          ))}
        </div>
        {/* Table Body */}
        <div className="excel-table-body">
          {groupByDate ? (
            (() => {
              const grouped = groupTransactionsByDate(displayTransactions);
              const sortedDates = sortDateKeysDesc(Array.from(grouped.keys()));
              
              return sortedDates.map((dateKey) => {
                const dayTransactions = grouped.get(dateKey)!;
                const date = parseLocalDate(dateKey);
                
                return (
                  <div key={dateKey}>
                    {/* Sticky Day Header */}
                    {onAddTransactionForDate && (
                      <TransactionDayHeader
                        date={date}
                        transactionCount={dayTransactions.length}
                        onAddClick={() => onAddTransactionForDate(dateKey)}
                      />
                    )}
                    
                    {/* Transactions for this day */}
                    {dayTransactions.map(renderTransactionRow)}
                  </div>
                );
              });
            })()
          ) : (
            displayTransactions.map(renderTransactionRow)
          )}
        </div>
      </div>
    );
  } else {
    // HTML table layout
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground ${col.key === 'amount' || col.key === 'actions' ? 'text-right' : ''} ${col.hideOnMobile ? 'hidden md:table-cell' : ''} ${col.hideOnTablet ? 'hidden lg:table-cell' : ''} ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groupByDate ? (
              (() => {
                const grouped = groupTransactionsByDate(displayTransactions);
                const sortedDates = sortDateKeysDesc(Array.from(grouped.keys()));
                
                return sortedDates.map((dateKey) => {
                  const dayTransactions = grouped.get(dateKey)!;
                  const date = parseLocalDate(dateKey);
                  
                  return (
                    <React.Fragment key={dateKey}>
                      {/* Sticky Day Header Row */}
                      {onAddTransactionForDate && (
                        <tr className="sticky-day-header">
                          <td colSpan={visibleColumns.length} className="px-6 py-2">
                            <TransactionDayHeader
                              date={date}
                              transactionCount={dayTransactions.length}
                              onAddClick={() => onAddTransactionForDate(dateKey)}
                            />
                          </td>
                        </tr>
                      )}
                      
                      {/* Transactions for this day */}
                      {dayTransactions.map(renderTransactionRow)}
                    </React.Fragment>
                  );
                });
              })()
            ) : (
              displayTransactions.map(renderTransactionRow)
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
