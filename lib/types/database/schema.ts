import { ApiResponse } from '../index';
import type { TableMetadataDto, ViewMetadataDto } from './index';

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

export interface SchemaListDto {
    schemas: Omit<SchemaMetadataDto, 'tables' | 'views'>[];
}

export type SchemaResponse = ApiResponse<SchemaMetadataDto>;
export type SchemasResponse = ApiResponse<SchemaListDto>;
