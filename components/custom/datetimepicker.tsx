"use client";

import * as React from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DateTimePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date & time",
  className,
}: DateTimePickerProps) {
  const id = React.useId();

  const handleDateChange = (date?: Date) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }

    // Preserve time if already selected
    if (value) {
      date.setHours(value.getHours());
      date.setMinutes(value.getMinutes());
      date.setSeconds(value.getSeconds());
    }

    onChange?.(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!value) return;

    const [hours, minutes, seconds = "0"] = e.target.value.split(":");

    const updated = new Date(value);
    updated.setHours(+hours);
    updated.setMinutes(+minutes);
    updated.setSeconds(+seconds);

    onChange?.(updated);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP p") : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-72" align="start">
        <div className="w-full overflow-hidden">
          <Calendar
            className="w-full p-2"
            mode="single"
            selected={value}
            onSelect={handleDateChange}
          />

          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Label className="shrink-0 text-xs" htmlFor={id}>
                Time
              </Label>

              <div className="relative min-w-0 flex-1">
                <Input
                  id={id}
                  type="time"
                  step="1"
                  disabled={!value}
                  value={value ? format(value, "HH:mm:ss") : ""}
                  onChange={handleTimeChange}
                  className="w-full ps-9"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                  <ClockIcon size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
