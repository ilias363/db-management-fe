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

export function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== "object" || typeof b !== "object") return false;

    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const keysA = Object.keys(aObj);
    const keysB = Object.keys(bObj);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(aObj[key], bObj[key])) return false;
    }

    return true;
}