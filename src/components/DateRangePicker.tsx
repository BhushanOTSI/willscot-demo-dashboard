import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useStore } from "@/stores/useStore";

export function DateRangePicker() {
  const { dateRange, setDateRange } = useStore();

  // Initialize with last 30 days if not set
  React.useEffect(() => {
    if (!dateRange) {
      const today = new Date();
      setDateRange({
        from: subDays(today, 30),
        to: today,
      });
    }
  }, [dateRange, setDateRange]);

  const handleQuickFilter = (days: number) => {
    const today = new Date();
    setDateRange({
      from: subDays(today, days),
      to: today,
    });
  };

  return (
    <div className="flex items-end gap-2">
      <Field className="w-[300px]">
        <FieldLabel htmlFor="date-picker-range">Date Range</FieldLabel>
        <Popover>
          <PopoverTrigger>
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal w-full"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter(7)}
          className={
            dateRange?.from && dateRange?.to
              ? Math.ceil(
                  (dateRange.to.getTime() - dateRange.from.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) === 7
                ? "bg-accent"
                : ""
              : ""
          }
        >
          Last 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter(30)}
          className={
            dateRange?.from && dateRange?.to
              ? Math.ceil(
                  (dateRange.to.getTime() - dateRange.from.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) === 30
                ? "bg-accent"
                : ""
              : ""
          }
        >
          Last 30 days
        </Button>
      </div>
    </div>
  );
}

