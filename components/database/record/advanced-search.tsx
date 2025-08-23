"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  X,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { FilterOperator, SortDirection, DataType } from "@/lib/types";
import {
  BaseTableColumnMetadataDto,
  RecordAdvancedSearchDto,
  RecordFilterCriteriaDto,
  RecordSortCriteriaDto,
  TableMetadataDto,
} from "@/lib/types/database";
import {
  formatColumnType,
  getOperatorsForDataType,
  needsMinMaxValues,
  needsMultipleValues,
  needsValue,
} from "./utils";

interface AdvancedSearchProps {
  table: TableMetadataDto;
  onSearch: (searchParams: RecordAdvancedSearchDto) => void;
  onClear: () => void;
  isLoading?: boolean;
  defaultExpanded?: boolean;
}

export function AdvancedSearch({
  table,
  onSearch,
  onClear,
  isLoading = false,
  defaultExpanded = false,
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [globalSearch, setGlobalSearch] = useState("");
  const [distinct, setDistinct] = useState(false);
  const [filters, setFilters] = useState<RecordFilterCriteriaDto[]>([]);
  const [sorts, setSorts] = useState<RecordSortCriteriaDto[]>([]);

  const handleAddFilter = useCallback(() => {
    const firstColumn = table.columns?.[0];
    if (firstColumn) {
      const newFilter: RecordFilterCriteriaDto = {
        columnName: firstColumn.columnName,
        operator: FilterOperator.EQUALS,
        value: "",
        caseSensitive: false,
      };
      setFilters(prev => [...prev, newFilter]);
    }
  }, [table.columns]);

  const handleUpdateFilter = useCallback(
    (index: number, updates: Partial<RecordFilterCriteriaDto>) => {
      setFilters(prev =>
        prev.map((filter, i) => (i === index ? { ...filter, ...updates } : filter))
      );
    },
    []
  );

  const handleRemoveFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddSort = useCallback(() => {
    const firstColumn = table.columns?.[0];
    if (firstColumn) {
      const newSort: RecordSortCriteriaDto = {
        columnName: firstColumn.columnName,
        direction: SortDirection.ASC,
      };
      setSorts(prev => [...prev, newSort]);
    }
  }, [table.columns]);

  const handleUpdateSort = useCallback((index: number, updates: Partial<RecordSortCriteriaDto>) => {
    setSorts(prev => prev.map((sort, i) => (i === index ? { ...sort, ...updates } : sort)));
  }, []);

  const handleRemoveSort = useCallback((index: number) => {
    setSorts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSearch = useCallback(() => {
    const searchParams: RecordAdvancedSearchDto = {
      schemaName: table.schema.schemaName,
      objectName: table.tableName,
      globalSearch: globalSearch.trim() || undefined,
      distinct,
      filters: filters.length > 0 ? filters : undefined,
      sorts: sorts.length > 0 ? sorts : undefined,
    };
    onSearch(searchParams);
  }, [table.schema.schemaName, table.tableName, globalSearch, distinct, filters, sorts, onSearch]);

  const handleClear = useCallback(() => {
    setGlobalSearch("");
    setDistinct(false);
    setFilters([]);
    setSorts([]);
    onClear();
  }, [onClear]);

  const hasActiveFilters = globalSearch || filters.length > 0 || sorts.length > 0 || distinct;

  const renderFilterValue = (filter: RecordFilterCriteriaDto, index: number) => {
    if (!needsValue(filter.operator)) {
      return null;
    }

    const column = table.columns?.find(col => col.columnName === filter.columnName);
    if (!column) {
      return renderGenericInput(filter, index);
    }

    const dataType = column.dataType.toUpperCase() as DataType;

    if (needsMinMaxValues(filter.operator)) {
      return renderBetweenInputs(filter, index, column, dataType);
    }

    if (needsMultipleValues(filter.operator)) {
      return renderMultipleValuesInput(filter, index, column, dataType);
    }

    return renderSingleValueInput(filter, index, column, dataType);
  };

  const renderGenericInput = (filter: RecordFilterCriteriaDto, index: number) => {
    return (
      <Input
        placeholder="Filter value"
        value={(filter.value as string) || ""}
        onChange={e => handleUpdateFilter(index, { value: e.target.value })}
        className="flex-1"
      />
    );
  };

  const renderBetweenInputs = (
    filter: RecordFilterCriteriaDto,
    index: number,
    column: Omit<BaseTableColumnMetadataDto, "table">,
    dataType: DataType
  ) => {
    const isNumeric = [
      DataType.INT,
      DataType.INTEGER,
      DataType.SMALLINT,
      DataType.BIGINT,
      DataType.DECIMAL,
      DataType.NUMERIC,
      DataType.FLOAT,
      DataType.REAL,
      DataType.DOUBLE,
    ].includes(dataType);

    const isDate = dataType === DataType.DATE;
    const isTime = dataType === DataType.TIME;
    const isTimestamp = dataType === DataType.TIMESTAMP;

    const inputType = isNumeric
      ? "number"
      : isDate
      ? "date"
      : isTime
      ? "time"
      : isTimestamp
      ? "datetime-local"
      : "text";

    const handleNumericConversion = (value: string): unknown => {
      if (value === "" && column.isNullable) return null;
      if (value === "") return null;

      const num = Number(value);
      if (isNaN(num)) return value;

      if ([DataType.DECIMAL, DataType.NUMERIC].includes(dataType) && column.numericScale) {
        return parseFloat(num.toFixed(column.numericScale));
      } else if ([DataType.FLOAT, DataType.REAL, DataType.DOUBLE].includes(dataType)) {
        return parseFloat(String(num));
      } else {
        return parseInt(String(num), 10);
      }
    };

    return (
      <div className="flex gap-2">
        <Input
          type={inputType}
          placeholder="Min value"
          value={(filter.minValue as string) || ""}
          onChange={e => {
            let value: unknown = e.target.value;
            if (isNumeric) {
              value = handleNumericConversion(e.target.value);
            }
            handleUpdateFilter(index, { minValue: value });
          }}
          className="flex-1"
        />
        <Input
          type={inputType}
          placeholder="Max value"
          value={(filter.maxValue as string) || ""}
          onChange={e => {
            let value: unknown = e.target.value;
            if (isNumeric) {
              value = handleNumericConversion(e.target.value);
            }
            handleUpdateFilter(index, { maxValue: value });
          }}
          className="flex-1"
        />
      </div>
    );
  };

  const renderMultipleValuesInput = (
    filter: RecordFilterCriteriaDto,
    index: number,
    column: Omit<BaseTableColumnMetadataDto, "table">,
    dataType: DataType
  ) => {
    const isNumeric = [
      DataType.INT,
      DataType.INTEGER,
      DataType.SMALLINT,
      DataType.BIGINT,
      DataType.DECIMAL,
      DataType.NUMERIC,
      DataType.FLOAT,
      DataType.REAL,
      DataType.DOUBLE,
    ].includes(dataType);

    const isBoolean = dataType === DataType.BOOLEAN || dataType.toUpperCase() === "TINYINT";

    if (isBoolean) {
      return (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`true-${index}`}
              checked={Array.isArray(filter.values) && filter.values.includes(true)}
              onCheckedChange={checked => {
                let values = Array.isArray(filter.values) ? [...filter.values] : [];
                if (checked) {
                  values.push(true);
                } else {
                  values = values.filter(v => v !== true);
                }
                handleUpdateFilter(index, { values });
              }}
            />
            <Label htmlFor={`true-${index}`} className="text-sm font-normal">
              True
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`false-${index}`}
              checked={Array.isArray(filter.values) && filter.values.includes(false)}
              onCheckedChange={checked => {
                let values = Array.isArray(filter.values) ? [...filter.values] : [];
                if (checked) {
                  values.push(false);
                } else {
                  values = values.filter(v => v !== false);
                }
                handleUpdateFilter(index, { values });
              }}
            />
            <Label htmlFor={`false-${index}`} className="text-sm font-normal">
              False
            </Label>
          </div>
          {column.isNullable && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`null-${index}`}
                checked={Array.isArray(filter.values) && filter.values.includes(null)}
                onCheckedChange={checked => {
                  let values = Array.isArray(filter.values) ? [...filter.values] : [];
                  if (checked) {
                    values.push(null);
                  } else {
                    values = values.filter(v => v !== null);
                  }
                  handleUpdateFilter(index, { values });
                }}
              />
              <Label htmlFor={`null-${index}`} className="text-sm font-normal">
                NULL
              </Label>
            </div>
          )}
        </div>
      );
    }

    const hasInvalidNumbers =
      isNumeric && Array.isArray(filter.values)
        ? filter.values.some(v => typeof v === "string" && isNaN(Number(v)))
        : false;

    return (
      <div className="space-y-2">
        <Input
          placeholder={`Values (comma-separated)${isNumeric ? " - numbers only" : ""}`}
          onChange={e => {
            const values = e.target.value
              .split(",")
              .map(v => {
                const trimmed = v.trim();
                if (trimmed === "") return null;

                if (isNumeric) {
                  const num = Number(trimmed);
                  if (!isNaN(num)) {
                    if (
                      [DataType.DECIMAL, DataType.NUMERIC].includes(dataType) &&
                      column.numericScale
                    ) {
                      return parseFloat(num.toFixed(column.numericScale));
                    } else if (
                      [DataType.FLOAT, DataType.REAL, DataType.DOUBLE].includes(dataType)
                    ) {
                      return parseFloat(String(num));
                    } else {
                      return parseInt(String(num), 10);
                    }
                  }
                  // Keep the original trimmed string for invalid numbers in numeric columns
                  // This allows users to see their input and correct it
                  return trimmed;
                }
                return trimmed;
              })
              .filter(v => v !== null);

            handleUpdateFilter(index, { values });
          }}
          className={`flex-1 ${hasInvalidNumbers ? "border-destructive" : ""}`}
        />
        {hasInvalidNumbers && (
          <p className="text-xs text-destructive">
            Some values are not valid numbers and will be ignored in the search.
          </p>
        )}
      </div>
    );
  };

  const renderSingleValueInput = (
    filter: RecordFilterCriteriaDto,
    index: number,
    column: Omit<BaseTableColumnMetadataDto, "table">,
    dataType: DataType
  ) => {
    if (dataType === DataType.BOOLEAN || dataType.toUpperCase() === "TINYINT") {
      return (
        <Select
          value={
            filter.value === null || filter.value === undefined
              ? column.isNullable
                ? "null"
                : "false"
              : String(filter.value) === "true"
              ? "true"
              : "false"
          }
          onValueChange={newValue => {
            const actualValue = newValue === "null" ? null : newValue === "true";
            handleUpdateFilter(index, { value: actualValue });
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {column.isNullable && <SelectItem value="null">NULL</SelectItem>}
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (
      [
        DataType.INT,
        DataType.INTEGER,
        DataType.SMALLINT,
        DataType.BIGINT,
        DataType.DECIMAL,
        DataType.NUMERIC,
        DataType.FLOAT,
        DataType.REAL,
        DataType.DOUBLE,
      ].includes(dataType)
    ) {
      return (
        <Input
          type="number"
          placeholder={column.isNullable ? "Number or leave empty for NULL" : "Enter number"}
          value={filter.value === null || filter.value === undefined ? "" : String(filter.value)}
          onChange={e => {
            let value: unknown = e.target.value;

            if (value === "" && column.isNullable) {
              value = null;
            } else if (value !== "") {
              const num = Number(value);
              if (!isNaN(num)) {
                if (
                  [DataType.DECIMAL, DataType.NUMERIC].includes(dataType) &&
                  column.numericScale
                ) {
                  value = parseFloat(num.toFixed(column.numericScale));
                } else if ([DataType.FLOAT, DataType.REAL, DataType.DOUBLE].includes(dataType)) {
                  value = parseFloat(String(num));
                } else {
                  value = parseInt(String(num), 10);
                }
              }
            }

            handleUpdateFilter(index, { value });
          }}
          className="flex-1"
        />
      );
    }

    if (dataType === DataType.DATE) {
      return (
        <Input
          type="date"
          placeholder={column.isNullable ? "YYYY-MM-DD or leave empty for NULL" : "YYYY-MM-DD"}
          value={filter.value === null || filter.value === undefined ? "" : String(filter.value)}
          onChange={e => {
            let value: unknown = e.target.value;
            if (value === "" && column.isNullable) {
              value = null;
            }
            handleUpdateFilter(index, { value });
          }}
          className="flex-1"
        />
      );
    }

    if (dataType === DataType.TIME) {
      return (
        <Input
          type="time"
          placeholder={column.isNullable ? "HH:MM:SS or leave empty for NULL" : "HH:MM:SS"}
          value={filter.value === null || filter.value === undefined ? "" : String(filter.value)}
          onChange={e => {
            let value: unknown = e.target.value;
            if (value === "" && column.isNullable) {
              value = null;
            }
            handleUpdateFilter(index, { value });
          }}
          className="flex-1"
        />
      );
    }

    if (dataType === DataType.TIMESTAMP) {
      const formatTimestampValue = (value: unknown): string => {
        if (value === null || value === undefined) return "";
        if (value === "CURRENT_TIMESTAMP") return new Date().toISOString().slice(0, 16);

        try {
          const date = new Date(String(value));
          if (isNaN(date.getTime())) return "";
          return date.toISOString().slice(0, 16);
        } catch {
          return "";
        }
      };

      return (
        <Input
          type="datetime-local"
          placeholder={
            column.isNullable ? "Date and time or leave empty for NULL" : "Date and time"
          }
          value={formatTimestampValue(filter.value)}
          onChange={e => {
            let value: unknown = e.target.value;
            if (value === "" && column.isNullable) {
              value = null;
            }
            handleUpdateFilter(index, { value });
          }}
          className="flex-1"
        />
      );
    }

    if ([DataType.VARCHAR, DataType.CHAR, DataType.TEXT].includes(dataType)) {
      return (
        <Input
          type="text"
          placeholder={
            column.isNullable
              ? `Text${
                  column.characterMaxLength ? ` (max ${column.characterMaxLength} chars)` : ""
                } or leave empty for NULL`
              : `Enter text${
                  column.characterMaxLength ? ` (max ${column.characterMaxLength} chars)` : ""
                }`
          }
          maxLength={column.characterMaxLength || undefined}
          value={filter.value === null || filter.value === undefined ? "" : String(filter.value)}
          onChange={e => {
            let value: unknown = e.target.value;
            if (value === "" && column.isNullable) {
              value = null;
            }
            handleUpdateFilter(index, { value });
          }}
          className="flex-1"
        />
      );
    }

    return (
      <Input
        type="text"
        placeholder={column.isNullable ? "Value or leave empty for NULL" : "Enter value"}
        value={filter.value === null || filter.value === undefined ? "" : String(filter.value)}
        onChange={e => {
          let value: unknown = e.target.value;
          if (value === "" && column.isNullable) {
            value = null;
          }
          handleUpdateFilter(index, { value });
        }}
        className="flex-1"
      />
    );
  };

  return (
    <Card className="py-4">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            Advanced Search
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </CardTitle>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="global-search" className="text-sm font-medium">
              Global Search
            </Label>
            <Input
              id="global-search"
              placeholder="Search across all text columns..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Column Filters</Label>
              <Button size="sm" variant="outline" onClick={handleAddFilter}>
                <Plus className="h-3 w-3 mr-1" />
                Add Filter
              </Button>
            </div>

            {filters.map((filter, index) => {
              const column = table.columns?.find(col => col.columnName === filter.columnName);
              const availableOperators = column
                ? getOperatorsForDataType(column.dataType)
                : Object.values(FilterOperator);

              return (
                <div key={index} className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Select
                      value={filter.columnName}
                      onValueChange={value => handleUpdateFilter(index, { columnName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {table.columns?.map(column => (
                          <SelectItem key={column.columnName} value={column.columnName}>
                            <div className="flex items-center gap-2">
                              <span>{column.columnName}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatColumnType(column)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filter.operator}
                      onValueChange={value =>
                        handleUpdateFilter(index, {
                          operator: value as FilterOperator,
                          value: undefined,
                          minValue: undefined,
                          maxValue: undefined,
                          values: undefined,
                        })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOperators.map(operator => (
                          <SelectItem key={operator} value={operator}>
                            <span className="capitalize">
                              {operator.replace(/_/g, " ").toLocaleLowerCase()}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button size="sm" variant="ghost" onClick={() => handleRemoveFilter(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {renderFilterValue(filter, index)}

                  {column &&
                    [DataType.VARCHAR, DataType.CHAR, DataType.TEXT].includes(
                      column.dataType.toUpperCase() as DataType
                    ) &&
                    (filter.operator === FilterOperator.EQUALS ||
                      filter.operator === FilterOperator.NOT_EQUALS ||
                      filter.operator === FilterOperator.LIKE ||
                      filter.operator === FilterOperator.NOT_LIKE ||
                      filter.operator === FilterOperator.STARTS_WITH ||
                      filter.operator === FilterOperator.ENDS_WITH ||
                      filter.operator === FilterOperator.CONTAINS ||
                      filter.operator === FilterOperator.IN ||
                      filter.operator === FilterOperator.NOT_IN) && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`case-sensitive-${index}`}
                          checked={filter.caseSensitive || false}
                          onCheckedChange={checked =>
                            handleUpdateFilter(index, { caseSensitive: checked })
                          }
                        />
                        <Label htmlFor={`case-sensitive-${index}`} className="text-sm">
                          Case sensitive
                        </Label>
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Sorting</Label>
              <Button size="sm" variant="outline" onClick={handleAddSort}>
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Add Sort
              </Button>
            </div>

            {sorts.map((sort, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <span className="text-sm text-muted-foreground min-w-0">#{index + 1}</span>
                <Select
                  value={sort.direction}
                  onValueChange={value =>
                    handleUpdateSort(index, { direction: value as SortDirection })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SortDirection.ASC}>ASC</SelectItem>
                    <SelectItem value={SortDirection.DESC}>DESC</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sort.columnName}
                  onValueChange={value => handleUpdateSort(index, { columnName: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {table.columns?.map(column => (
                      <SelectItem key={column.columnName} value={column.columnName}>
                        <div className="flex items-center gap-2">
                          <span>{column.columnName}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatColumnType(column)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button size="sm" variant="ghost" onClick={() => handleRemoveSort(index)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Options</Label>
            <div className="flex items-center space-x-2">
              <Switch id="distinct" checked={distinct} onCheckedChange={setDistinct} />
              <Label htmlFor="distinct" className="text-sm">
                Return distinct records only
              </Label>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={isLoading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
