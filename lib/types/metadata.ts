// Database metadata related interfaces

import { ApiResponse } from './index';
export * from './database';

export type SchemaResponse = ApiResponse<import('./database').SchemaMetadataDto>;
export type SchemasResponse = ApiResponse<import('./database').SchemaMetadataDto[]>;
export type TableResponse = ApiResponse<import('./database').TableMetadataDto>;
export type TablesResponse = ApiResponse<import('./database').TableMetadataDto[]>;
export type ViewResponse = ApiResponse<import('./database').ViewMetadataDto>;
export type ViewsResponse = ApiResponse<import('./database').ViewMetadataDto[]>;
export type ColumnResponse = ApiResponse<import('./database').BaseColumnMetadataDto>;
export type ColumnsResponse = ApiResponse<import('./database').BaseColumnMetadataDto[]>;
export type IndexResponse = ApiResponse<import('./database').IndexMetadataDto>;
export type IndexesResponse = ApiResponse<import('./database').IndexMetadataDto[]>;
