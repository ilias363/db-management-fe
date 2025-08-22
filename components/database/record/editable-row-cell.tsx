import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataType } from "@/lib/types";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";

interface EditableRowCellProps {
  recordId: string;
  value: unknown;
  column: Omit<BaseTableColumnMetadataDto, "table">;
  onUpdate: (recordId: string, columnName: string, value: unknown) => void;
}

export function EditableRowCell({ recordId, value, column, onUpdate }: EditableRowCellProps) {
  const dataType = column.dataType.toUpperCase() as DataType;

  if ([DataType.VARCHAR, DataType.CHAR].includes(dataType)) {
    return (
      <Input
        type="text"
        value={value === null ? "" : String(value)}
        maxLength={column.characterMaxLength}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          onUpdate(recordId, column.columnName, newValue);
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
        value={value === null ? "" : String(value)}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          onUpdate(recordId, column.columnName, newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
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
    ].includes(dataType) ||
    dataType.includes("INT")
  ) {
    return (
      <Input
        type="number"
        value={value === null ? "" : String(value)}
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

          onUpdate(recordId, column.columnName, newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  if (dataType === DataType.BOOLEAN) {
    return (
      <Select
        value={value === null ? "null" : String(value)}
        onValueChange={newValue => {
          const actualValue = newValue === "null" ? null : newValue === "true";
          onUpdate(recordId, column.columnName, actualValue);
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

  if (dataType === DataType.DATE) {
    return (
      <Input
        type="date"
        value={value === null ? "" : String(value)}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          onUpdate(recordId, column.columnName, newValue);
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
        value={value === null ? "" : String(value)}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          onUpdate(recordId, column.columnName, newValue);
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
        value={value === null ? "" : String(value)}
        onChange={e => {
          let newValue: unknown = e.target.value;

          if (newValue === "" && column.isNullable) {
            newValue = null;
          }

          onUpdate(recordId, column.columnName, newValue);
        }}
        className="h-8"
        placeholder={column.isNullable ? "NULL" : ""}
      />
    );
  }

  return (
    <Input
      type="text"
      value={value === null ? "" : String(value)}
      onChange={e => {
        let newValue: unknown = e.target.value;

        if (newValue === "" && column.isNullable) {
          newValue = null;
        }

        onUpdate(recordId, column.columnName, newValue);
      }}
      className="h-8"
      placeholder={column.isNullable ? "NULL" : ""}
    />
  );
}
