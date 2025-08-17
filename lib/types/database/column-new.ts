import { DataType, ColumnType, FKOnAction } from '../index';

export interface BaseNewColumnDto {
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: DataType;
    characterMaxLength?: number;
    numericPrecision?: number;
    numericScale?: number;
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
