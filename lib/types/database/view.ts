import { ApiResponse, DataType } from '../index';
import { SchemaMetadataDto } from './index';

export interface ViewMetadataDto {
    viewName: string;
    viewDefinition: string;
    checkOption: boolean;
    isUpdatable: boolean;
    charachterSet?: string;
    collation?: string;
    schema: Omit<SchemaMetadataDto, 'views' | 'tables'>;
    columns: Omit<ViewColumnDto, 'table'>[];
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

export interface ViewListDto {
    views: Omit<ViewMetadataDto, "schema" | "columns">[];
}

export type ViewResponse = ApiResponse<ViewMetadataDto>;
export type ViewsResponse = ApiResponse<ViewListDto>;
