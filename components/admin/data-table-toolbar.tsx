"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterLabel?: string;
  filterValue?: string;
  filterOptions?: { value: string; label: string }[];
  onFilterChange?: (value: string) => void;
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterLabel,
  filterValue = "all",
  filterOptions,
  onFilterChange,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          className="pl-9"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {filterOptions && onFilterChange && (
        <Select value={filterValue} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={filterLabel ?? "Filter"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
