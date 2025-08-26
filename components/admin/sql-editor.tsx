"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSqlExecution } from "@/lib/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Copy, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SqlResultSetDto } from "@/lib/types";

export function SqlEditor() {
  const [sql, setSql] = useState("SELECT 1");
  const [result, setResult] = useState<SqlResultSetDto | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useSqlExecution({
    onSuccess: res => {
      if (res.data) {
        setResult(res.data);
        const msg = `${res.data.rowCount} rows ${
          res.data.statementType === "SELECT" ? "returned" : "affected"
        } in ${res.data.executionTimeMs} ms`;
        setInfo(msg);
        setErrorMsg(null);
      }
    },
    onError: msg => {
      setErrorMsg(msg);
      setInfo(null);
    },
  });

  const execute = () => {
    if (!sql.trim()) return;
    setErrorMsg(null);
    setInfo(null);
    mutation.mutate({ sql, maxRows: 500 });
  };

  const clear = () => {
    setSql("");
    setResult(null);
    setInfo(null);
    setErrorMsg(null);
  };

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      toast.success("SQL copied to clipboard");
    } catch {}
  };

  const columns = result?.columns || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>SQL Editor</CardTitle>
              <CardDescription>Execute SQL statements</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copySql}
                disabled={!sql}
                title="Copy SQL"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clear}
                disabled={mutation.isPending}
                title="Clear editor"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={execute}
                disabled={mutation.isPending}
                title="Run (Ctrl+Enter)"
              >
                <Play className="h-4 w-4 mr-1" /> Run
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="relative">
            <Textarea
              value={sql}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSql(e.target.value)}
              className="font-mono text-sm min-h-[220px] pr-10"
              placeholder="Write your SQL here. Enter for new line, Ctrl+Enter to run."
              onKeyDown={e => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  execute();
                }
              }}
            />
            {mutation.isPending && (
              <div className="absolute inset-0 flex items-end justify-end p-2 pointer-events-none">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertTitle>Execution Error</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap text-sm max-h-40 overflow-auto">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          {info && !errorMsg && (
            <div className="text-xs font-medium text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
              {info}
            </div>
          )}

          {mutation.isPending && (
            <div className="space-y-1">
              <Progress value={70} className="h-1" />
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Executing...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>{info}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto max-h-[480px]">
            {columns.length === 0 ? (
              <div className="text-sm text-muted-foreground">No tabular output.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(col => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row, idx) => (
                    <TableRow key={idx}>
                      {columns.map(col => {
                        const value = (row as Record<string, unknown>)[col];
                        return (
                          <TableCell key={col}>
                            {value === null || value === undefined ? "" : String(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
