// Common interfaces and types for the database management system

export interface ApiResponse<T = unknown> {
    message: string;
    success: boolean;
    data?: T;
}

export type VoidResponse = ApiResponse<void>;

export interface PageDto<T = unknown> {
    items: T[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export enum ActionType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    CREATE_SCHEMA = 'CREATE_SCHEMA',
    DELETE_SCHEMA = 'DELETE_SCHEMA',
    CREATE_TABLE = 'CREATE_TABLE',
    UPDATE_TABLE = 'UPDATE_TABLE',
    DELETE_TABLE = 'DELETE_TABLE',
    CREATE_COLUMN = 'CREATE_COLUMN',
    UPDATE_COLUMN = 'UPDATE_COLUMN',
    DELETE_COLUMN = 'DELETE_COLUMN',
    CREATE_INDEX = 'CREATE_INDEX',
    DELETE_INDEX = 'DELETE_INDEX',
    CREATE_VIEW = 'CREATE_VIEW',
    UPDATE_VIEW = 'UPDATE_VIEW',
    DELETE_VIEW = 'DELETE_VIEW',
    CREATE_RECORD = 'CREATE_RECORD',
    UPDATE_RECORD = 'UPDATE_RECORD',
    DELETE_RECORD = 'DELETE_RECORD',
    CREATE_MULTIPLE_RECORDS = 'CREATE_MULTIPLE_RECORDS',
    UPDATE_MULTIPLE_RECORDS = 'UPDATE_MULTIPLE_RECORDS',
    DELETE_MULTIPLE_RECORDS = 'DELETE_MULTIPLE_RECORDS',
    CREATE_USER = 'CREATE_USER',
    UPDATE_USER = 'UPDATE_USER',
    DELETE_USER = 'DELETE_USER',
    ACTIVATE_USER = 'ACTIVATE_USER',
    DEACTIVATE_USER = 'DEACTIVATE_USER',
    CREATE_ROLE = 'CREATE_ROLE',
    UPDATE_ROLE = 'UPDATE_ROLE',
    DELETE_ROLE = 'DELETE_ROLE',
    CREATE_PERMISSION = 'CREATE_PERMISSION',
    UPDATE_PERMISSION = 'UPDATE_PERMISSION',
    DELETE_PERMISSION = 'DELETE_PERMISSION'
}

export enum PermissionType {
    READ = 'READ',
    WRITE = 'WRITE',
    DELETE = 'DELETE',
    CREATE = 'CREATE'
}

export enum DataType {
    VARCHAR = 'VARCHAR',
    CHAR = 'CHAR',
    TEXT = 'TEXT',
    INT = 'INT',
    INTEGER = 'INTEGER',
    SMALLINT = 'SMALLINT',
    BIGINT = 'BIGINT',
    DECIMAL = 'DECIMAL',
    NUMERIC = 'NUMERIC',
    FLOAT = 'FLOAT',
    REAL = 'REAL',
    DOUBLE = 'DOUBLE',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    TIME = 'TIME',
    TIMESTAMP = 'TIMESTAMP'
}

export const AUTO_INCREMENT_COMPATIBLE_TYPES = [
    DataType.INT,
    DataType.INTEGER,
    DataType.SMALLINT,
    DataType.BIGINT,
    DataType.FLOAT,
    DataType.REAL,
    DataType.DOUBLE,
];

export enum ColumnType {
    STANDARD = 'STANDARD',
    PRIMARY_KEY = 'PRIMARY_KEY',
    FOREIGN_KEY = 'FOREIGN_KEY',
    PRIMARY_KEY_FOREIGN_KEY = 'PRIMARY_KEY_FOREIGN_KEY'
}

export enum FKOnAction {
    CASCADE = 'CASCADE',
    NO_ACTION = 'NO ACTION',
    RESTRICT = 'RESTRICT',
    SET_NULL = 'SET NULL',
    SET_DEFAULT = 'SET DEFAULT'
}

export enum IndexType {
    BTREE = 'BTREE',
    HASH = 'HASH'
}

export enum FilterOperator {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',

    IS_NULL = 'IS_NULL',
    IS_NOT_NULL = 'IS_NOT_NULL',

    GREATER_THAN = 'GREATER_THAN',
    GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
    LESS_THAN = 'LESS_THAN',
    LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
    BETWEEN = 'BETWEEN',

    LIKE = 'LIKE',
    NOT_LIKE = 'NOT_LIKE',
    STARTS_WITH = 'STARTS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    CONTAINS = 'CONTAINS',

    IN = 'IN',
    NOT_IN = 'NOT_IN',
}

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

export interface PaginationParams {
    page?: number; // pages starts from 0
    size?: number;
    sortBy?: string;
    sortDirection?: SortDirection;
}

export interface ActionState<T = unknown> {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    data?: T;
}