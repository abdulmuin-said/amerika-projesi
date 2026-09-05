/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const presetRanges = {
    "today": { from: new Date(), to: new Date() },
    "7days": { from: subDays(new Date(), 6), to: new Date() },
    "30days": { from: subDays(new Date(), 29), to: new Date() },
    "thisMonth": { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    "lastMonth": { 
      from: startOfMonth(subMonths(new Date(), 1)), 
      to: endOfMonth(subMonths(new Date(), 1)) 
    }
  };

  const handlePresetSelect = (preset: string) => {
    if (preset in presetRanges) {
      onDateRangeChange(presetRanges[preset as keyof typeof presetRanges]);
    }
  };

  return (
    <div className="flex gap-2">
      <Select onValueChange={handlePresetSelect}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Quick select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7days">Last 7 days</SelectItem>
          <SelectItem value="30days">Last 30 days</SelectItem>
          <SelectItem value="thisMonth">This month</SelectItem>
          <SelectItem value="lastMonth">Last month</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM dd")} -{" "}
                  {format(dateRange.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={{
              from: dateRange?.from,
              to: dateRange?.to,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange({ from: range.from, to: range.to });
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}