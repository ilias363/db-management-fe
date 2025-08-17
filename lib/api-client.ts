import "server-only";

import type {
  ApiClient,
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
  RefreshTokenResponse,
  ValidateTokenResponse,
  isSystemAdminResponse,
  RoleStatsResponse,
  ActionType,
  RolesResponse,
} from "./types";
import type {
  DatabaseStatsResponse,
  DatabaseTypeResponse,
  SchemasResponse,
  SchemaResponse,
  NewSchemaDto,
  TableResponse,
  TablesResponse,
  NewTableDto,
  UpdateTableDto,
  IndexResponse,
  IndexesResponse,
  NewIndexDto,
} from "./types/database";
import { HttpError } from "./errors";

class ApiClientImpl implements ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  private async getAuthHeaders(accessToken?: string): Promise<Record<string, string>> {
    if (accessToken) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // If no access token is provided, fetch the session to get the token
    const { getSession } = await import("./auth/session");
    const session = await getSession();
    const token = session?.accessToken;

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { accessToken?: string }
  ): Promise<T> {
    const { accessToken, ...fetchOptions } = options || {};
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeaders(accessToken);

    const response = await fetch(url, {
      credentials: "include",
      ...fetchOptions,
      headers: {
        ...authHeaders,
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
      console.error(`API Error for ${url}:`, errorData);
      throw new HttpError(response.status, errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  auth = {
    login: async (credentials: LoginRequestDto): Promise<LoginResponse> => {
      const response = await this.request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      return response;
    },

    logout: async (accessToken?: string): Promise<LogoutResponse> => {
      const response = await this.request<LogoutResponse>("/auth/logout", {
        method: "POST",
        accessToken,
      });
      return response;
    },

    refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
      const response = await this.request<RefreshTokenResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
      return response;
    },

    validateToken: async (accessToken?: string): Promise<ValidateTokenResponse> => {
      const response = await this.request<ValidateTokenResponse>("/auth/validate", { accessToken });
      return response;
    },

    getCurrentUser: (accessToken?: string): Promise<CurrentUserResponse> =>
      this.request("/auth/current-user", { accessToken }),

    getIsCurrentUserSystemAdmin: (accessToken?: string): Promise<isSystemAdminResponse> =>
      this.request("/auth/current-user/is-system-admin", { accessToken }),

    getCurrentUserPermissions: (accessToken?: string): Promise<UserPermissionsResponse> =>
      this.request("/auth/current-user/permissions", { accessToken }),

    getDetailedPermissions: (
      schemaName?: string,
      tableName?: string,
      accessToken?: string
    ): Promise<DetailedPermissionsResponse> => {
      const params = new URLSearchParams();
      if (schemaName) params.append("schemaName", schemaName);
      if (tableName) params.append("tableName", tableName);
      const query = params.toString() ? `?${params.toString()}` : "";
      return this.request(`/auth/current-user/detailed-permissions${query}`, { accessToken });
    },
  };

  users = {
    getAllUsers: (params?: PaginationParams & { search?: string }): Promise<UserPageResponse> => {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : "";
      return this.request(`/users${query}`);
    },

    getAllActiveUsers: (
      params?: PaginationParams & { search?: string }
    ): Promise<UserPageResponse> => {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : "";
      return this.request(`/users/active${query}`);
    },

    getUserById: (id: number): Promise<UserResponse> => this.request(`/users/${id}`),

    getUserByUsername: (username: string): Promise<UserResponse> =>
      this.request(`/users/username/${username}`),

    createUser: (user: NewUserDto): Promise<UserResponse> =>
      this.request("/users", {
        method: "POST",
        body: JSON.stringify(user),
      }),

    updateUser: (user: UpdateUserDto): Promise<UserResponse> =>
      this.request(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(user),
      }),

    deactivateUser: (id: number): Promise<VoidResponse> =>
      this.request(`/users/${id}/deactivate`, { method: "PUT" }),

    activateUser: (id: number): Promise<VoidResponse> =>
      this.request(`/users/${id}/activate`, { method: "PUT" }),

    getUserStats: (): Promise<UserStatsResponse> => this.request("/users/stats"),
  };

  roles = {
    getAllRoles: () => this.request<RolesResponse>("/roles/all"),

    getAllRolesPaginated: (
      params?: PaginationParams & { search?: string }
    ): Promise<RolePageResponse> => {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : "";
      return this.request(`/roles${query}`);
    },

    getRoleById: (id: number): Promise<RoleResponse> => this.request(`/roles/${id}`),

    getUsersByRole: (roleId: number, params?: PaginationParams): Promise<UserPageResponse> => {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : "";
      return this.request(`/roles/${roleId}/users${query}`);
    },

    createRole: (role: NewRoleDto): Promise<RoleResponse> =>
      this.request("/roles", {
        method: "POST",
        body: JSON.stringify(role),
      }),

    updateRole: (role: UpdateRoleDto): Promise<RoleResponse> =>
      this.request(`/roles/${role.id}`, {
        method: "PUT",
        body: JSON.stringify(role),
      }),

    deleteRole: (id: number): Promise<VoidResponse> =>
      this.request(`/roles/${id}`, { method: "DELETE" }),

    getRoleStats: (): Promise<RoleStatsResponse> => this.request("/roles/stats"),
  };

  audit = {
    getAuditLogs: (
      params?: PaginationParams & {
        search?: string;
        userId?: number;
        actionType?: ActionType;
        successful?: boolean;
        after?: Date;
        before?: Date;
      }
    ): Promise<AuditLogPageResponse> => {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : "";
      return this.request(`/audit-logs${query}`);
    },

    getAuditLogsByUserId: (
      userId: number,
      params?: PaginationParams
    ): Promise<AuditLogPageResponse> => {
      const query = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : "";
      return this.request(`/audit-logs/user/${userId}${query}`);
    },

    getAuditLogById: (id: number): Promise<AuditLogResponse> => this.request(`/audit-logs/${id}`),

    deleteAuditLog: (id: number): Promise<VoidResponse> =>
      this.request(`/audit-logs/${id}`, { method: "DELETE" }),

    getAuditStats: (): Promise<AuditStatsResponse> => this.request("/audit-logs/stats"),
  };

  database = {
    getDatabaseType: (): Promise<DatabaseTypeResponse> => this.request("/database/type"),
    getDatabaseStats: (includeSystem: boolean): Promise<DatabaseStatsResponse> =>
      this.request(`/database/stats?includeSystem=${includeSystem}`),
  };

  schema = {
    getAllSchemas: (includeSystem: boolean): Promise<SchemasResponse> =>
      this.request(`/schemas?includeSystem=${includeSystem}`),
    getSchemaByName: (schemaName: string): Promise<SchemaResponse> =>
      this.request(`/schemas/${schemaName}`),
    createSchema: (schema: NewSchemaDto): Promise<SchemaResponse> =>
      this.request("/schemas", {
        method: "POST",
        body: JSON.stringify(schema),
      }),
    deleteSchema: (schemaName: string): Promise<VoidResponse> =>
      this.request(`/schemas/${schemaName}`, { method: "DELETE" }),
  };

  table = {
    getTable: (schemaName: string, tableName: string): Promise<TableResponse> =>
      this.request(`/tables/${schemaName}/${tableName}`),
    getAllTablesInSchema: (schemaName: string): Promise<TablesResponse> =>
      this.request(`/tables/${schemaName}`),
    createTable: (table: NewTableDto): Promise<TableResponse> =>
      this.request("/tables", {
        method: "POST",
        body: JSON.stringify(table),
      }),
    renameTable: (table: UpdateTableDto): Promise<TableResponse> =>
      this.request(`/tables`, {
        method: "PUT",
        body: JSON.stringify(table),
      }),
    deleteTable: (schemaName: string, tableName: string, force?: boolean): Promise<VoidResponse> =>
      this.request(`/tables/${schemaName}/${tableName}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      }),
  };

  view = {
    getView: () => Promise.reject(new Error("Not implemented")),
    getAllViewsInSchema: () => Promise.reject(new Error("Not implemented")),
    renameView: () => Promise.reject(new Error("Not implemented")),
    deleteView: () => Promise.reject(new Error("Not implemented")),
  };

  column = {
    getColumn: () => Promise.reject(new Error("Not implemented")),
    getColumnsForTable: () => Promise.reject(new Error("Not implemented")),
    createStandardColumn: () => Promise.reject(new Error("Not implemented")),
    createPrimaryKeyColumn: () => Promise.reject(new Error("Not implemented")),
    createForeignKeyColumn: () => Promise.reject(new Error("Not implemented")),
    deleteColumn: () => Promise.reject(new Error("Not implemented")),
    renameColumn: () => Promise.reject(new Error("Not implemented")),
    updateColumnDataType: () => Promise.reject(new Error("Not implemented")),
    updateColumnAutoIncrement: () => Promise.reject(new Error("Not implemented")),
    updateColumnNullable: () => Promise.reject(new Error("Not implemented")),
    updateColumnUnique: () => Promise.reject(new Error("Not implemented")),
    updateColumnDefault: () => Promise.reject(new Error("Not implemented")),
    updateColumnPrimaryKey: () => Promise.reject(new Error("Not implemented")),
    updateColumnForeignKey: () => Promise.reject(new Error("Not implemented")),
  };

  index = {
    getindex: (schemaName: string, tableName: string, indexName: string): Promise<IndexResponse> =>
      this.request(`/indexes/${schemaName}/${tableName}/${indexName}`),
    getIndexesForTable: (schemaName: string, tableName: string): Promise<IndexesResponse> =>
      this.request(`/indexes/${schemaName}/${tableName}`),
    createIndex: (index: NewIndexDto): Promise<IndexResponse> =>
      this.request("/indexes", {
        method: "POST",
        body: JSON.stringify(index),
      }),
    deleteIndex: (
      schemaName: string,
      tableName: string,
      indexName: string
    ): Promise<VoidResponse> =>
      this.request(`/indexes/${schemaName}/${tableName}/${indexName}`, {
        method: "DELETE",
      }),
  };

  record = {
    getRecords: () => Promise.reject(new Error("Not implemented")),
    getViewRecords: () => Promise.reject(new Error("Not implemented")),
    createRecord: () => Promise.reject(new Error("Not implemented")),
    updateRecord: () => Promise.reject(new Error("Not implemented")),
    deleteRecord: () => Promise.reject(new Error("Not implemented")),
    getRecordsByValues: () => Promise.reject(new Error("Not implemented")),
    getViewRecordsByValues: () => Promise.reject(new Error("Not implemented")),
    updateRecordByValues: () => Promise.reject(new Error("Not implemented")),
    deleteRecordByValues: () => Promise.reject(new Error("Not implemented")),
    createRecords: () => Promise.reject(new Error("Not implemented")),
    updateRecords: () => Promise.reject(new Error("Not implemented")),
    deleteRecords: () => Promise.reject(new Error("Not implemented")),
    updateRecordsByValues: () => Promise.reject(new Error("Not implemented")),
    deleteRecordsByValues: () => Promise.reject(new Error("Not implemented")),
    advancedSearch: () => Promise.reject(new Error("Not implemented")),
    advancedSearchView: () => Promise.reject(new Error("Not implemented")),
    getRecordCount: () => Promise.reject(new Error("Not implemented")),
    getViewRecordCount: () => Promise.reject(new Error("Not implemented")),
  };
}

export const apiClient = new ApiClientImpl();
