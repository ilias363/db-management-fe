import { ApiResponse } from "../index";
import {
    SchemaMetadataDto,
    BaseColumnMetadataDto,
    IndexMetadataDto,
    BaseNewColumnDto,
} from "./index";

export interface TableMetadataDto {
    tableName: string;
    columnCount: number;
    rowCount: number;
    sizeInBytes: number;
    schema: Omit<SchemaMetadataDto, "tables" | "views">;
    columns: Omit<BaseColumnMetadataDto, "table">[];
    indexes: Omit<IndexMetadataDto, "table">[];
}

export interface NewTableDto {
    schemaName: string;
    tableName: string;
    columns: Omit<BaseNewColumnDto, "schemaName" | "tableName">[];
}

export interface UpdateTableDto {
    schemaName: string;
    tableName: string;
    updatedTableName: string;
}

export type TableResponse = ApiResponse<TableMetadataDto>;
export type TablesResponse = ApiResponse<Omit<TableMetadataDto, "schema" | "columns" | "indexes">[]>;
