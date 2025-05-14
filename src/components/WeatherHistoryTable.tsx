
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeatherHistoryRecord } from "@/utils/weatherHistoryUtils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

interface WeatherHistoryTableProps {
  historyData: WeatherHistoryRecord[];
  location: string;
}

type SortColumn = "date" | "temperature" | "condition";
type SortDirection = "asc" | "desc";

const WeatherHistoryTable = ({ historyData, location }: WeatherHistoryTableProps) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter data for the selected location
  const locationData = useMemo(() => {
    return historyData.filter(record => record.location === location);
  }, [historyData, location]);

  // Sort data based on selected column and direction
  const sortedData = useMemo(() => {
    return [...locationData].sort((a, b) => {
      if (sortColumn === "date") {
        return sortDirection === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortColumn === "temperature") {
        return sortDirection === "asc" 
          ? a.temperature - b.temperature
          : b.temperature - a.temperature;
      } else {
        return sortDirection === "asc"
          ? a.condition.localeCompare(b.condition)
          : b.condition.localeCompare(a.condition);
      }
    });
  }, [locationData, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-1 h-4 w-4 inline" />
      : <ArrowDown className="ml-1 h-4 w-4 inline" />;
  };

  // Format the date string to be more readable
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="w-full backdrop-blur-md bg-white/90 border border-white/30 rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black">Weather History Report</h3>
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-gray-600" />
          <span className="text-gray-600">
            {locationData.length} records for {location}
          </span>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Weather history data for {location}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                Date {getSortIcon("date")}
              </TableHead>
              <TableHead>Weather</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("condition")}>
                Condition {getSortIcon("condition")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("temperature")}>
                Temperature {getSortIcon("temperature")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((record) => (
                <TableRow key={record.date}>
                  <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                  <TableCell>
                    <img
                      src={`https://openweathermap.org/img/wn/${record.icon}.png`}
                      alt={record.condition}
                      className="w-8 h-8 inline-block"
                    />
                  </TableCell>
                  <TableCell className="capitalize">{record.condition}</TableCell>
                  <TableCell>{record.temperature}°C</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No weather history data available for {location}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WeatherHistoryTable;
