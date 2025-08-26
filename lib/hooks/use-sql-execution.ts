"use client";

import { useMutation } from '@tanstack/react-query';
import { executeSql } from '@/lib/actions/sql';
import { SqlExecutionRequestDto, SqlExecutionResponse } from '@/lib/types';
import { toast } from 'sonner';

interface UseSqlExecutionOptions {
    onSuccess?: (response: SqlExecutionResponse) => void;
    onError?: (message: string) => void;
}

export function useSqlExecution({ onSuccess, onError }: UseSqlExecutionOptions = {}) {
    return useMutation<SqlExecutionResponse, Error, SqlExecutionRequestDto>({
        mutationFn: async (req: SqlExecutionRequestDto) => {
            const res = await executeSql(req);
            if (!res.success) {
                throw new Error(res.message || 'Execution failed');
            }
            return res;
        },
        onSuccess: res => {
            toast.success(res.message || 'Executed');
            onSuccess?.(res);
        },
        onError: error => {
            const msg = error.message || 'Execution failed';
            toast.error(msg);
            onError?.(msg);
        },
    });
}
