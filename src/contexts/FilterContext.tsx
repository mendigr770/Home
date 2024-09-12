import React, { createContext, useState, useContext, ReactNode } from 'react';
import { parseISO, startOfMonth, endOfMonth, format } from 'date-fns';

export type DateRange = 'currentMonth' | 'lastMonth' | 'lastThreeMonths' | 'lastSixMonths' | 'custom';

interface FilterContextType {
  startDate: Date | null;
  endDate: Date | null;
  dateRange: DateRange;
  categoryFilter: string | null;
  setDateRange: (range: DateRange, start: string | null, end: string | null) => void;
  setCategoryFilter: (category: string | null) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | null>(startOfMonth(now));
  const [endDate, setEndDate] = useState<Date | null>(endOfMonth(now));
  const [dateRange, setDateRangeState] = useState<DateRange>('currentMonth');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const setDateRange = (range: DateRange, start: string | null, end: string | null) => {
    setDateRangeState(range);
    setStartDate(start ? parseISO(start) : null);
    setEndDate(end ? parseISO(end) : null);
  };

  return (
    <FilterContext.Provider value={{ startDate, endDate, dateRange, categoryFilter, setDateRange, setCategoryFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};