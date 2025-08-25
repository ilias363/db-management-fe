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
  DatabaseTypeResponse,
  DatabaseStatsResponse,
} from "./index";

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
  UpdateColumnAutoIncrementDto,
  UpdateColumnNullableDto,
  UpdateColumnUniqueDto,
  UpdateColumnPrimaryKeyDto,
  UpdateColumnForeignKeyDto,
  RecordAdvancedSearchResponse,
} from "./database";

export interface ApiClient {
  auth: {
    login: (credentials: LoginRequestDto) => Promise<LoginResponse>;
    logout: (accessToken?: string) => Promise<LogoutResponse>;
    refreshToken: (refreshToken: string) => Promise<RefreshTokenResponse>;
    validateToken: (accessToken?: string) => Promise<ValidateTokenResponse>;
    getCurrentUser: (accessToken?: string) => Promise<CurrentUserResponse>;
    getCurrentUserPermissions: (accessToken?: string) => Promise<UserPermissionsResponse>;
    getDetailedPermissions: (
      schemaName?: string,
      tableName?: string,
      accessToken?: string
    ) => Promise<DetailedPermissionsResponse>;
  };
  users: {
    getAllUsers: (params?: PaginationParams & { search?: string }) => Promise<UserPageResponse>;
    getAllActiveUsers: (
      params?: PaginationParams & { search?: string }
    ) => Promise<UserPageResponse>;
    getUserById: (id: number) => Promise<UserResponse>;
    getUserByUsername: (username: string) => Promise<UserResponse>;
    createUser: (user: NewUserDto) => Promise<UserResponse>;
    updateUser: (user: UpdateUserDto) => Promise<UserResponse>;
    deactivateUser: (id: number) => Promise<VoidResponse>;
    activateUser: (id: number) => Promise<VoidResponse>;
    getUserStats: () => Promise<UserStatsResponse>;
  };
  roles: {
    getAllRoles: () => Promise<RolesResponse>;
    getAllRolesPaginated: (
      params?: PaginationParams & { search?: string }
    ) => Promise<RolePageResponse>;
    getUsersByRole: (roleId: number, params?: PaginationParams) => Promise<UserPageResponse>;
    getRoleById: (id: number) => Promise<RoleResponse>;
    createRole: (role: NewRoleDto) => Promise<RoleResponse>;
    updateRole: (role: UpdateRoleDto) => Promise<RoleResponse>;
    deleteRole: (id: number) => Promise<VoidResponse>;
    getRoleStats: () => Promise<RoleStatsResponse>;
  };
  audit: {
    getAuditLogs: (
      params?: PaginationParams & {
        search?: string;
        userId?: number;
        actionType?: ActionType;
        successful?: boolean;
        after?: Date;
        before?: Date;
      }
    ) => Promise<AuditLogPageResponse>;
    getAuditLogsByUserId: (
      userId: number,
      params?: PaginationParams
    ) => Promise<AuditLogPageResponse>;
    getAuditLogById: (id: number) => Promise<AuditLogResponse>;
    deleteAuditLog: (id: number) => Promise<VoidResponse>;
    getAuditStats: () => Promise<AuditStatsResponse>;
  };
  schema: {
    getAllSchemas(includeSystem: boolean): Promise<SchemasResponse>;
    getSchemaByName(schemaName: string): Promise<SchemaResponse>;
    createSchema(schema: NewSchemaDto): Promise<SchemaResponse>;
    deleteSchema(schemaName: string): Promise<VoidResponse>;
  };
  table: {
    getTable(schemaName: string, tableName: string): Promise<TableResponse>;
    getAllTablesInSchema(schemaName: string): Promise<TablesResponse>;
    createTable(table: NewTableDto): Promise<TableResponse>;
    renameTable(table: UpdateTableDto): Promise<TableResponse>;
    deleteTable(schemaName: string, tableName: string, force?: boolean): Promise<VoidResponse>;
  };
  view: {
    getView(schemaName: string, viewName: string): Promise<ViewResponse>;
    getAllViewsInSchema(schemaName: string): Promise<ViewsResponse>;
    renameView(View: UpdateViewDto): Promise<ViewResponse>;
    deleteView(schemaName: string, viewName: string): Promise<VoidResponse>;
  };
  column: {
    getColumn(schemaName: string, tableName: string, columnName: string): Promise<ColumnResponse>;
    getColumnsForTable(schemaName: string, tableName: string): Promise<ColumnsResponse>;
    createStandardColumn(column: NewStandardColumnDto): Promise<ColumnResponse>;
    createPrimaryKeyColumn(column: NewPrimaryKeyColumnDto): Promise<ColumnResponse>;
    createForeignKeyColumn(column: NewForeignKeyColumnDto): Promise<ColumnResponse>;
    deleteColumn(
      schemaName: string,
      tableName: string,
      columnName: string,
      force?: boolean
    ): Promise<VoidResponse>;
    renameColumn(renameCol: RenameColumnDto): Promise<ColumnResponse>;
    updateColumnDataType(updateCol: UpdateColumnDataTypeDto): Promise<ColumnResponse>;
    updateColumnAutoIncrement(updateCol: UpdateColumnAutoIncrementDto): Promise<ColumnResponse>;
    updateColumnNullable(
      updateCol: UpdateColumnNullableDto,
      populate?: boolean
    ): Promise<ColumnResponse>;
    updateColumnUnique(updateCol: UpdateColumnUniqueDto): Promise<ColumnResponse>;
    updateColumnDefault(updateCol: UpdateColumnDefaultDto): Promise<ColumnResponse>;
    updateColumnPrimaryKey(
      updateCol: UpdateColumnPrimaryKeyDto,
      force?: boolean
    ): Promise<ColumnsResponse>;
    updateColumnForeignKey(updateCol: UpdateColumnForeignKeyDto): Promise<ColumnResponse>;
  };
  index: {
    getindex(schemaName: string, tableName: string, indexName: string): Promise<IndexResponse>;
    getIndexesForTable(schemaName: string, tableName: string): Promise<IndexesResponse>;
    createIndex(index: NewIndexDto): Promise<IndexResponse>;
    deleteIndex(schemaName: string, tableName: string, indexName: string): Promise<VoidResponse>;
  };
  record: {
    getTableRecords(
      schemaName: string,
      tableName: string,
      params?: PaginationParams
    ): Promise<RecordPageResponse>;
    getViewRecords(
      schemaName: string,
      viewName: string,
      params?: PaginationParams
    ): Promise<ViewRecordPageResponse>;
    createRecord(record: NewRecordDto): Promise<RecordResponse>;
    updateRecord(upcateRecord: UpdateRecordDto): Promise<RecordResponse>;
    deleteRecord(deleteRecord: DeleteRecordDto): Promise<VoidResponse>;
    getTableRecordsByValues(
      schemaName: string,
      tableName: string,
      identifyingValues: Record<string, unknown>,
      paginationParams?: PaginationParams
    ): Promise<RecordPageResponse>;
    getViewRecordsByValues(
      schemaName: string,
      viewName: string,
      identifyingValues: Record<string, unknown>,
      paginationParams?: PaginationParams
    ): Promise<ViewRecordPageResponse>;
    updateRecordByValues(updateData: UpdateRecordByValuesDto): Promise<RecordsResponse>;
    deleteRecordByValues(deleteData: DeleteRecordByValuesDto): Promise<CountResponse>;
    createRecords(records: BatchNewRecordsDto): Promise<RecordsResponse>;
    updateRecords(records: BatchUpdateRecordsDto): Promise<RecordsResponse>;
    deleteRecords(records: BatchDeleteRecordsDto): Promise<CountResponse>;
    updateRecordsByValues(updateData: BatchUpdateRecordsByValuesDto): Promise<RecordsResponse>;
    deleteRecordsByValues(deleteData: BatchDeleteRecordsByValuesDto): Promise<CountResponse>;
    advancedSearchTable(search: RecordAdvancedSearchDto): Promise<RecordAdvancedSearchResponse>;
    advancedSearchView(search: RecordAdvancedSearchDto): Promise<RecordAdvancedSearchResponse>;
    getTableRecordCount(schemaName: string, tableName: string): Promise<CountResponse>;
    getViewRecordCount(schemaName: string, viewName: string): Promise<CountResponse>;
  };
  analytics: {
    getDatabaseType(): Promise<DatabaseTypeResponse>;
    getDatabaseStats(includeSystem: boolean): Promise<DatabaseStatsResponse>;
  };
}
