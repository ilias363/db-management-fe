import { useCallback, useState } from "react";
import { PermissionDetailDto } from "../types";

export function usePermissions(initialPermissions: PermissionDetailDto[] = []) {
    const [permissions, setPermissions] = useState<PermissionDetailDto[]>(initialPermissions);

    const addPermission = useCallback((permission: PermissionDetailDto) => {
        setPermissions(prev => [...prev, permission]);
    }, []);

    const removePermission = useCallback((index: number) => {
        setPermissions(prev => prev.filter((_, i) => i !== index));
    }, []);

    const hasPermission = useCallback(
        (permission: PermissionDetailDto) => {
            return permissions.some(
                p =>
                    p.schemaName === permission.schemaName &&
                    p.tableName === permission.tableName &&
                    p.viewName === permission.viewName &&
                    p.permissionType === permission.permissionType
            );
        },
        [permissions]
    );

    const resetPermissions = useCallback((newPermissions: PermissionDetailDto[]) => {
        setPermissions(newPermissions);
    }, []);

    return {
        permissions,
        addPermission,
        removePermission,
        hasPermission,
        resetPermissions,
    };
}