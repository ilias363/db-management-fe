
import type {
  LoginRequestDto,
  LoginResponse,
  LogoutResponse,
  CurrentUserResponse,
  UserPermissionsResponse,
  DetailedPermissionsResponse,
  UserPageResponse,
  UserResponse,
  NewUserDto,
  UpdateUserDto,
  VoidResponse,
  RolePageResponse,
  RoleResponse,
  NewRoleDto,
  UpdateRoleDto,
  AuditLogPageResponse,
  AuditLogResponse,
  AuditStatsResponse,
  PaginationParams,
  UserStatsResponse,
  RoleStatsResponse,
  RefreshTokenResponse,
  ValidateTokenResponse,
  ActionType,
  RolesResponse,
} from "./index"

import type {
  SchemasResponse,
  SchemaResponse,
  NewSchemaDto,
  UpdateRecordDto,
  NewRecordDto,
  TableResponse,
  TablesResponse,
  NewTableDto,
  UpdateTableDto,
  ViewResponse,
  ViewsResponse,
  UpdateViewDto,
  ColumnResponse,
  ColumnsResponse,
  NewStandardColumnDto,
  NewPrimaryKeyColumnDto,
  ViewRecordPageResponse,
  NewForeignKeyColumnDto,
  RenameColumnDto,
  UpdateColumnDataTypeDto,
  UpdateColumnDefaultDto,
  IndexResponse,
  IndexesResponse,
  NewIndexDto,
  RecordPageResponse,
  RecordResponse,
  DeleteRecordDto,
  UpdateRecordByValuesDto,
  RecordsResponse,
  DeleteRecordByValuesDto,
  CountResponse,
  BatchNewRecordsDto,
  BatchUpdateRecordsDto,
  BatchDeleteRecordsDto,
  BatchUpdateRecordsByValuesDto,
  BatchDeleteRecordsByValuesDto,
  RecordAdvancedSearchDto,
  RecordAdvancedSearchResponseDto,
  DatabaseTypeResponse,
  DatabaseStatsResponse,
} from "./database"

export interface ApiClient {
  auth: {
    login: (credentials: LoginRequestDto) => Promise<LoginResponse>
    logout: () => Promise<LogoutResponse>
    refreshToken: (refreshToken: string) => Promise<RefreshTokenResponse>
    validateToken: () => Promise<ValidateTokenResponse>
    getCurrentUser: () => Promise<CurrentUserResponse>
    getCurrentUserPermissions: () => Promise<UserPermissionsResponse>
    getDetailedPermissions: (schemaName?: string, tableName?: string) => Promise<DetailedPermissionsResponse>
  }
  users: {
    getAllUsers: (params?: PaginationParams & { search?: string }) => Promise<UserPageResponse>
    getAllActiveUsers: (params?: PaginationParams & { search?: string }) => Promise<UserPageResponse>
    getUserById: (id: number) => Promise<UserResponse>
    getUserByUsername: (username: string) => Promise<UserResponse>
    createUser: (user: NewUserDto) => Promise<UserResponse>
    updateUser: (user: UpdateUserDto) => Promise<UserResponse>
    deactivateUser: (id: number) => Promise<VoidResponse>
    activateUser: (id: number) => Promise<VoidResponse>
    getUserStats: () => Promise<UserStatsResponse>
  }
  roles: {
    getAllRoles: () => Promise<RolesResponse>
    getAllRolesPaginated: (params?: PaginationParams & { search?: string }) => Promise<RolePageResponse>
    getUsersByRole: (roleId: number, params?: PaginationParams) => Promise<UserPageResponse>
    getRoleById: (id: number) => Promise<RoleResponse>
    createRole: (role: NewRoleDto) => Promise<RoleResponse>
    updateRole: (role: UpdateRoleDto) => Promise<RoleResponse>
    deleteRole: (id: number) => Promise<VoidResponse>
    getRoleStats: () => Promise<RoleStatsResponse>
  }
  audit: {
    getAuditLogs: (params?: PaginationParams & {
      search?: string;
      userId?: number;
      actionType?: ActionType;
      successful?: boolean;
      after?: Date;
      before?: Date;
    }) => Promise<AuditLogPageResponse>
    getAuditLogsByUserId: (userId: number, params?: PaginationParams) => Promise<AuditLogPageResponse>
    getAuditLogById: (id: number) => Promise<AuditLogResponse>
    deleteAuditLog: (id: number) => Promise<VoidResponse>
    getAuditStats: () => Promise<AuditStatsResponse>
  }
  database: {
    getDatabaseType(): Promise<DatabaseTypeResponse>;
    getDatabaseStats(includeSystem: boolean): Promise<DatabaseStatsResponse>;
  }
  schema: {
    getAllSchemas(includeSystem: boolean): Promise<SchemasResponse>;
    getSchemaByName(schemaName: string): Promise<SchemaResponse>;
    createSchema(schema: NewSchemaDto): Promise<SchemaResponse>;
    deleteSchema(schemaName: string): Promise<VoidResponse>;
  }
  table: {
    getTable(schemaName: string, tableName: string): Promise<TableResponse>;
    getAllTablesInSchema(schemaName: string): Promise<TablesResponse>;
    createTable(table: NewTableDto): Promise<TableResponse>;
    renameTable(table: UpdateTableDto): Promise<TableResponse>;
    deleteTable(schemaName: string, tableName: string, force?: boolean): Promise<VoidResponse>;
  }
  view: {
    getView(schemaName: string, viewName: string): Promise<ViewResponse>;
    getAllViewsInSchema(schemaName: string): Promise<ViewsResponse>;
    getViewRecords(schemaName: string, viewName: string, params?: PaginationParams): Promise<ViewRecordPageResponse>;
    renameView(View: UpdateViewDto): Promise<ViewResponse>;
    deleteView(schemaName: string, viewName: string): Promise<VoidResponse>;
  }
  column: {
    getColumn(schemaName: string, tableName: string, columnName: string): Promise<ColumnResponse>;
    getColumnsForTable(schemaName: string, tableName: string): Promise<ColumnsResponse>;
    createStandardColumn(column: NewStandardColumnDto): Promise<ColumnResponse>;
    createPrimaryKeyColumn(column: NewPrimaryKeyColumnDto): Promise<ColumnResponse>;
    createForeignKeyColumn(column: NewForeignKeyColumnDto): Promise<ColumnResponse>;
    deleteColumn(schemaName: string, tableName: string, columnName: string, force: boolean): Promise<VoidResponse>;
    renameColumn(renameCol: RenameColumnDto): Promise<ColumnResponse>;
    updateColumnDataType(updateCol: UpdateColumnDataTypeDto): Promise<ColumnResponse>;
    updateColumnAutoIncrement(updateCol: UpdateColumnDataTypeDto): Promise<ColumnResponse>;
    updateColumnNullable(updateCol: UpdateColumnDataTypeDto): Promise<ColumnResponse>;
    updateColumnUnique(updateCol: UpdateColumnDataTypeDto): Promise<ColumnResponse>;
    updateColumnDefault(updateCol: UpdateColumnDefaultDto): Promise<ColumnResponse>;
    updateColumnPrimaryKey(updateCol: UpdateColumnDataTypeDto): Promise<ColumnResponse>;
    updateColumnForeignKey(updateCol: UpdateColumnDataTypeDto): Promise<ColumnResponse>;
  }
  index: {
    getindex(schemaName: string, tableName: string, indexName: string): Promise<IndexResponse>;
    getIndexesForTable(schemaName: string, tableName: string): Promise<IndexesResponse>;
    createIndex(index: NewIndexDto): Promise<IndexResponse>;
    deleteIndex(schemaName: string, tableName: string, indexName: string): Promise<VoidResponse>;
  }
  record: {
    getRecords(schemaName: string, tableName: string, params?: PaginationParams): Promise<RecordPageResponse>;
    getRecord(schemaName: string, tableName: string, primaryKeyValues: Record<string, unknown>): Promise<RecordResponse>;
    createRecord(record: NewRecordDto): Promise<RecordResponse>;
    updateRecord(upcateRecord: UpdateRecordDto): Promise<RecordResponse>;
    deleteRecord(deleteRecord: DeleteRecordDto): Promise<RecordResponse>;
    getRecordByValues(schemaName: string, tableName: string, identifyingValues: Record<string, unknown>): Promise<RecordResponse>;
    getRecordsByValues(schemaName: string, tableName: string,
      identifyingValues: Record<string, unknown>, paginationParams?: PaginationParams): Promise<RecordPageResponse>;
    updateRecordByValues(updateData: UpdateRecordByValuesDto): Promise<RecordsResponse>;
    deleteRecordByValues(deleteData: DeleteRecordByValuesDto): Promise<CountResponse>;
    createRecords(records: BatchNewRecordsDto): Promise<RecordsResponse>;
    updateRecords(records: BatchUpdateRecordsDto): Promise<RecordsResponse>;
    deleteRecords(records: BatchDeleteRecordsDto): Promise<CountResponse>;
    updateRecordsByValues(updateData: BatchUpdateRecordsByValuesDto): Promise<RecordsResponse>;
    deleteRecordsByValues(deleteData: BatchDeleteRecordsByValuesDto): Promise<CountResponse>;
    advancedSearch(search: RecordAdvancedSearchDto): Promise<RecordAdvancedSearchResponseDto>;
    getRecordCount(schemaName: string, tableName: string): Promise<CountResponse>;
  }
}
