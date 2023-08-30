export type RelativeDate =
  | { type: 'today' }
  | {
      type: 'exact';
      date: Date;
    }
  | {
      type: 'relative';
      number: number;
      unit: 'day' | 'week' | 'month' | 'year';
      direction: 'last' | 'next';
    };

export type RelativeDateRange = {
  start?: RelativeDate;
  end?: RelativeDate;
};
