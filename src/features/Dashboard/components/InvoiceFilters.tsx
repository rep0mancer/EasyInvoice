interface InvoiceFiltersProps {
  search: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function InvoiceFilters({
  search,
  dateFrom,
  dateTo,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
}: InvoiceFiltersProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          type="text"
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Search invoice number or customer..."
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={event => onDateFromChange(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="date"
          value={dateTo}
          onChange={event => onDateToChange(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
