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
