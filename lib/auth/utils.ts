"use server";

import { requireAdmin, requireAuth } from "./actions";

export async function withAuth<T extends unknown[], R>(
    action: (...args: T) => Promise<R>
): Promise<(...args: T) => Promise<R>> {
    return async (...args: T) => {
        await requireAuth();
        return action(...args);
    };
}

export async function withAdminAuth<T extends unknown[], R>(
    action: (...args: T) => Promise<R>
): Promise<(...args: T) => Promise<R>> {
    return async (...args: T) => {
        await requireAdmin();
        return action(...args);
    };
}
