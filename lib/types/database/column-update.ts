import { DataType, FKOnAction } from '../index';

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
