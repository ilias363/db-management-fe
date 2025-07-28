// Database metadata related interfaces

import { ApiResponse, ColumnType, DataType, FKOnAction, IndexType, SortDirection } from './index';

export interface SchemaMetadataDto {
    schemaName: string;
    isSystemSchema: boolean;
    creationDate: string | null;
    tables: Omit<TableMetadataDto, 'schema' | 'columns' | 'indexes'>[];
    views: Omit<ViewMetadataDto, 'schema' | 'columns'>[];
}

export interface NewSchemaDto {
    schemaName: string;
}

export interface TableMetadataDto {
    tableName: string;
    columnCount: number;
    rowCount: number;
    sizeInBytes: number;
    schema: Omit<SchemaMetadataDto, 'tables' | 'views'>;
    columns: Omit<BaseColumnMetadataDto, 'table'>[];
    indexes: Omit<IndexMetadataDto, 'table'>[];
}

export interface NewTableDto {
    schemaName: string;
    tableName: string;
    columns: Omit<BaseNewColumnDto, 'schemaName' | 'tableName'>[];
}

export interface UpdateTableDto {
    schemaName: string;
    tableName: string;
    updatedTableName: string;
}

export interface ViewMetadataDto {
    viewName: string;
    viewDefinition: string;
    checkOption: boolean;
    isUpdatable: boolean;
    charachterSet?: string;
    collation?: string;
    schema: Omit<SchemaMetadataDto, 'views' | 'tables'>;
    columns: Omit<BaseColumnMetadataDto, 'table'>[];
}

export interface UpdateViewDto {
    schemaName: string;
    viewName: string;
    updatedViewName: string;
}

export interface ViewColumnDto {
    columnName: string;
    ordinalPosition: number;
    dataType: DataType;
    characterMaxLength?: number;
    numericPrecision?: number;
    numericScale?: number;
    isNullable: boolean;
    isUnique: boolean;
    autoIncrement: boolean;
    columnDefault?: string;
    view: Omit<ViewMetadataDto, 'columns'>;
}


export interface BaseColumnMetadataDto {
    columnName: string;
    ordinalPosition: number;
    dataType: DataType;
    characterMaxLength?: number;
    numericPrecision?: number;
    numericScale?: number;
    isNullable: boolean;
    isUnique: boolean;
    autoIncrement: boolean;
    columnDefault?: string;
    columnType: ColumnType;
    table: Omit<TableMetadataDto, 'columns' | 'indexes'>;
}

export interface StandardColumnMetadataDto extends BaseColumnMetadataDto {
    columnType: ColumnType.STANDARD;
}

export interface PrimaryKeyColumnMetadataDto extends BaseColumnMetadataDto {
    columnType: ColumnType.PRIMARY_KEY;
}

export interface ForeignKeyColumnMetadataDto extends BaseColumnMetadataDto {
    referencedSchemaName: string;
    referencedTableName: string;
    referencedColumnName: string;
    onUpdateAction: FKOnAction;
    onDeleteAction: FKOnAction;
    columnType: ColumnType.FOREIGN_KEY;
}

export interface PrimaryKeyForeignKeyColumnMetadataDto extends BaseColumnMetadataDto {
    referencedSchemaName: string;
    referencedTableName: string;
    referencedColumnName: string;
    onUpdateAction: FKOnAction;
    onDeleteAction: FKOnAction;
    columnType: ColumnType.PRIMARY_KEY_FOREIGN_KEY;
}

export interface BaseNewColumnDto {
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: DataType;
    characterMaxLength?: number;
    numericPrecision?: number;
}

export interface BaseNewForeignKeyColumnDto extends BaseNewColumnDto {
    referencedSchemaName: string;
    referencedTableName: string;
    referencedColumnName: string;
    onUpdateAction?: FKOnAction;
    onDeleteAction?: FKOnAction;
}

export interface NewStandardColumnDto extends BaseNewColumnDto {
    isNullable?: boolean;
    isUnique?: boolean;
    columnDefault?: string;
    columnType: ColumnType.STANDARD;
}

export interface NewPrimaryKeyColumnDto extends BaseNewColumnDto {
    autoIncrement?: boolean;
    columnType: ColumnType.PRIMARY_KEY;
}

export interface NewForeignKeyColumnDto extends BaseNewForeignKeyColumnDto {
    columnDefault?: string;
    isNullable?: boolean;
    columnType: ColumnType.FOREIGN_KEY;
}

export interface NewPrimaryKeyForeignKeyColumnDto extends BaseNewForeignKeyColumnDto {
    columnType: ColumnType.PRIMARY_KEY_FOREIGN_KEY;
}

export interface BaseUpdateColumnDto {
    schemaName: string;
    tableName: string;
    columnName: string;
}

export interface RenameColumnDto extends BaseUpdateColumnDto {
    newColumnName: string;
}

export interface UpdateColumnDataTypeDto extends BaseUpdateColumnDto {
    dataType: DataType;
    characterMaxLength?: number;
    numericPrecision?: number;
    numericScale?: number;
}

export interface UpdateColumnNullableDto extends BaseUpdateColumnDto {
    isNullable: boolean;
}

export interface UpdateColumnDefaultDto extends BaseUpdateColumnDto {
    columnDefault: string;
}

export interface UpdateColumnUniqueDto extends BaseUpdateColumnDto {
    isUnique: boolean;
}

export interface UpdateColumnAutoIncrementDto extends BaseUpdateColumnDto {
    autoIncrement: boolean;
}

export interface UpdateColumnPrimaryKeyDto {
    schemaName: string;
    tableName: string;
    columnNames: string[];
    isPrimaryKey: boolean;
}

export interface UpdateColumnForeignKeyDto extends BaseUpdateColumnDto {
    isForeignKey: boolean;
    referencedSchemaName?: string;
    referencedTableName?: string;
    referencedColumnName?: string;
    onUpdateAction?: FKOnAction;
    onDeleteAction?: FKOnAction;
}

export interface IndexColumnMetadataDto {
    columnName: string;
    ordinalPosition: number;
    sortOder?: SortDirection;
}

export interface IndexMetadataDto {
    indexName: string;
    indexType: IndexType;
    isUnique: boolean;
    table: Omit<TableMetadataDto, 'columns' | 'indexes'>;
    indexColumns: IndexColumnMetadataDto[];
}

export interface NewIndexCOlumnDto {
    columnName: string;
    sortOrder?: SortDirection;
}

export interface NewIndexDto {
    indexName: string;
    schemaName: string;
    tableName: string;
    isUnique?: boolean;
    indexType: IndexType;
    indexColumns: NewIndexCOlumnDto[];
}

export type SchemaResponse = ApiResponse<SchemaMetadataDto>;
export type SchemasResponse = ApiResponse<SchemaMetadataDto[]>;
export type TableResponse = ApiResponse<TableMetadataDto>;
export type TablesResponse = ApiResponse<TableMetadataDto[]>;
export type ViewResponse = ApiResponse<ViewMetadataDto>;
export type ViewsResponse = ApiResponse<ViewMetadataDto[]>;
export type ColumnResponse = ApiResponse<BaseColumnMetadataDto>;
export type ColumnsResponse = ApiResponse<BaseColumnMetadataDto[]>;
export type IndexResponse = ApiResponse<IndexMetadataDto>;
export type IndexesResponse = ApiResponse<IndexMetadataDto[]>;
