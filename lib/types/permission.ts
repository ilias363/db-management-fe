// Permission types

import { PermissionType } from "./index";

export interface PermissionDetailDto {
    schemaName: string | null;
    tableName: string | null;
    viewName: string | null;
    permissionType: PermissionType;
}