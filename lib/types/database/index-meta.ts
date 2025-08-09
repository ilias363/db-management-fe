import { TableMetadataDto } from './index';
import { SortDirection, IndexType, ApiResponse } from '../index';

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

export type IndexResponse = ApiResponse<IndexMetadataDto>;
export type IndexesResponse = ApiResponse<IndexMetadataDto[]>;
