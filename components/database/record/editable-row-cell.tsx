import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataType } from "@/lib/types";
import { BaseColumnMetadataDto } from "@/lib/types/database";

interface EditableRowCellProps {
  recordId: string;
  value: unknown;
  column: BaseColumnMetadataDto;
  onUpdate: (recordId: string, columnName: string, value: unknown) => void;
}

export function EditableRowCell({ recordId, value, column, onUpdate }: EditableRowCellProps) {
  const dataType = column.dataType.toUpperCase() as DataType;

  const handleUpdate = useCallback(
    (newValue: unknown) => {
      onUpdate(recordId, column.columnName, newValue);
    },
    [onUpdate, recordId, column.columnName]
  );

  if ([DataType.VARCHAR, DataType.CHAR].includes(dataType)) {
    return (
      <Input
        type="text"
        value={!value ? "" : String(value)}
        maxLength={column.characterMaxLength}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          handleUpdate(newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  if (dataType === DataType.TEXT) {
    return (
      <Input
        type="text"
        value={!value ? "" : String(value)}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          handleUpdate(newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  if (dataType === DataType.BOOLEAN || dataType.toUpperCase() === "TINYINT") {
    return (
      <Select
        value={
          value === null || value === undefined
            ? column.isNullable
              ? "null"
              : "false"
            : ["0", "false", "FALSE"].includes(String(value))
            ? "false"
            : "true"
        }
        onValueChange={newValue => {
          const actualValue = newValue === "null" ? null : newValue === "true";
          handleUpdate(actualValue);
        }}
      >
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {column.isNullable && <SelectItem value="null">NULL</SelectItem>}
          <SelectItem value="true">true</SelectItem>
          <SelectItem value="false">false</SelectItem>
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
        value={!value ? "" : String(value)}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          } else {
            const num = Number(newValue);
            newValue = isNaN(num)
              ? newValue
              : [DataType.FLOAT, DataType.REAL, DataType.DOUBLE].includes(dataType)
              ? num
              : num.toFixed(
                  [DataType.DECIMAL, DataType.NUMERIC].includes(dataType) && column.numericScale
                    ? column.numericScale
                    : 0
                );
          }

          handleUpdate(newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  if (dataType === DataType.DATE) {
    return (
      <Input
        type="date"
        value={!value ? "" : new Date(String(value)).toISOString().split("T")[0]}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          handleUpdate(newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  if (dataType === DataType.TIME) {
    return (
      <Input
        type="time"
        step={1}
        value={!value ? "" : String(value)}
        onChange={e => {
          let newValue: string | null = e.target.value;

          if (newValue.length == 5) {
            newValue += ":00";
          }
          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          handleUpdate(newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  if (dataType === DataType.TIMESTAMP) {
    return (
      <Input
        type="datetime-local"
        step={1}
        value={
          !value
            ? ""
            : value === "CURRENT_TIMESTAMP"
            ? new Date().toISOString().split("Z")[0]
            : new Date(String(value)).toISOString().split("Z")[0]
        }
        onChange={e => {
          let newValue: string | null = e.target.value;
          const parts = newValue.split("T");
          if (parts.length == 2) {
            if (parts[1].length == 5) {
              parts[1] += ":00";
            }
          }
          newValue = parts.join(" ");

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          handleUpdate(newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  return (
    <Input
      type="text"
      value={!value ? "" : String(value)}
      onChange={e => {
        let newValue: unknown = e.target.value;

        if (newValue === "" && column.isNullable) {
          newValue = null;
        }

        handleUpdate(newValue);
      }}
      className="h-8"
      placeholder={column.isNullable ? "NULL" : ""}
    />
  );
}
