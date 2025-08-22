import { BaseTableColumnMetadataDto } from "@/lib/types/database";

export const renderCellValue = (value: unknown): string => {
    if (value === null) return "NULL";
    if (value === undefined) return "";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

export const formatColumnType = (column: Omit<BaseTableColumnMetadataDto, "table">) => {
    let type = column.dataType.toUpperCase();
    if (column.characterMaxLength) {
        type += `(${column.characterMaxLength})`;
    } else if (column.numericPrecision) {
        type += `(${column.numericPrecision}${column.numericScale ? `, ${column.numericScale}` : ""
            })`;
    }
    return type;
};
