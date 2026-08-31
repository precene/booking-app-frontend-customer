import { DateTime } from "luxon";

type DateStripProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export const showDates = Array.from({ length: 7 }, (_, index) =>
  DateTime.now().plus({ days: index }),
);

function DateStrip({ onSelectDate, selectedDate }: DateStripProps) {
  return (
    <div className="flex justify-end gap-2" aria-label="Show dates">
      {showDates.map((date, index) => {
        const value = date.toISODate();
        const isSelected = value === selectedDate;
        const dayLabel = index === 0 ? "Today" : index === 1 ? "Tomorrow" : date.toFormat("ccc");

        return (
          <button
            className={[
              "flex min-w-20 flex-col items-center rounded-md border px-3 py-2 text-sm transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-surface text-foreground hover:bg-surface-muted",
            ].join(" ")}
            key={value}
            type="button"
            onClick={() => onSelectDate(value)}
          >
            <span className="font-medium">{dayLabel}</span>
            <span className={isSelected ? "text-primary-foreground/85" : "text-muted-foreground"}>
              {date.toFormat("LLL d")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { DateStrip };
