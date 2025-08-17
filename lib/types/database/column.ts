import { TableMetadataDto } from './index';
import { DataType, ColumnType, FKOnAction, ApiResponse } from '../index';

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
}

export interface BaseTableColumnMetadataDto extends BaseColumnMetadataDto {
    columnType: ColumnType;
    table: Omit<TableMetadataDto, 'columns' | 'indexes'>;
}

export interface StandardColumnMetadataDto extends BaseTableColumnMetadataDto {
    columnType: ColumnType.STANDARD;
}

export interface PrimaryKeyColumnMetadataDto extends BaseTableColumnMetadataDto {
    columnType: ColumnType.PRIMARY_KEY;
}

export interface ForeignKeyColumnMetadataDto extends BaseTableColumnMetadataDto {
    referencedSchemaName: string;
    referencedTableName: string;
    referencedColumnName: string;
    onUpdateAction: FKOnAction;
    onDeleteAction: FKOnAction;
    columnType: ColumnType.FOREIGN_KEY;
}

export interface PrimaryKeyForeignKeyColumnMetadataDto extends BaseTableColumnMetadataDto {
    referencedSchemaName: string;
    referencedTableName: string;
    referencedColumnName: string;
    onUpdateAction: FKOnAction;
    onDeleteAction: FKOnAction;
    columnType: ColumnType.PRIMARY_KEY_FOREIGN_KEY;
}

export type ColumnResponse = ApiResponse<BaseTableColumnMetadataDto>;
export type ColumnsResponse = ApiResponse<BaseTableColumnMetadataDto[]>;
