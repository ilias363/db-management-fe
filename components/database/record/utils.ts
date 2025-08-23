import { FilterOperator } from "@/lib/types";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";

export const renderCellValue = (value: unknown): string => {
    if (value === null) return "NULL";
    if (value === undefined) return "";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "string" && !isNaN(Date.parse(value)) && value.includes("T")) {
        const date = new Date(value);
        return date.toLocaleString();
    }
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

export const getOperatorsForDataType = (dataType: string): FilterOperator[] => {
    const baseOperators = [
        FilterOperator.EQUALS,
        FilterOperator.NOT_EQUALS,
        FilterOperator.IS_NULL,
        FilterOperator.IS_NOT_NULL,
    ];

    if (
        dataType.toLowerCase().includes("char") ||
        dataType.toLowerCase().includes("text") ||
        dataType.toLowerCase().includes("string")
    ) {
        return [
            ...baseOperators,
            FilterOperator.LIKE,
            FilterOperator.NOT_LIKE,
            FilterOperator.STARTS_WITH,
            FilterOperator.ENDS_WITH,
            FilterOperator.CONTAINS,
            FilterOperator.IN,
            FilterOperator.NOT_IN,
        ];
    }

    if (
        dataType.toLowerCase().includes("int") ||
        dataType.toLowerCase().includes("decimal") ||
        dataType.toLowerCase().includes("float") ||
        dataType.toLowerCase().includes("double") ||
        dataType.toLowerCase().includes("numeric")
    ) {
        return [
            ...baseOperators,
            FilterOperator.GREATER_THAN,
            FilterOperator.GREATER_THAN_OR_EQUAL,
            FilterOperator.LESS_THAN,
            FilterOperator.LESS_THAN_OR_EQUAL,
            FilterOperator.BETWEEN,
            FilterOperator.IN,
            FilterOperator.NOT_IN,
        ];
    }

    if (
        dataType.toLowerCase().includes("date") ||
        dataType.toLowerCase().includes("time") ||
        dataType.toLowerCase().includes("timestamp")
    ) {
        return [
            ...baseOperators,
            FilterOperator.GREATER_THAN,
            FilterOperator.GREATER_THAN_OR_EQUAL,
            FilterOperator.LESS_THAN,
            FilterOperator.LESS_THAN_OR_EQUAL,
            FilterOperator.BETWEEN,
        ];
    }

    // Default operators
    return [...baseOperators, FilterOperator.IN, FilterOperator.NOT_IN];
};

export const needsValue = (operator: FilterOperator): boolean => {
    return ![FilterOperator.IS_NULL, FilterOperator.IS_NOT_NULL].includes(operator);
};

export const needsMinMaxValues = (operator: FilterOperator): boolean => {
    return operator === FilterOperator.BETWEEN;
};

export const needsMultipleValues = (operator: FilterOperator): boolean => {
    return [FilterOperator.IN, FilterOperator.NOT_IN].includes(operator);
};
