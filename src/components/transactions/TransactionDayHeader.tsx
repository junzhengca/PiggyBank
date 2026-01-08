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
