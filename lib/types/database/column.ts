import { TableMetadataDto } from './index';
import { DataType, ColumnType, FKOnAction } from '../index';

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
