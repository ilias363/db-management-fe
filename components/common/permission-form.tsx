import { PermissionDetailDto, PermissionType } from "@/lib/types";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { permissionSchema, type PermissionSchema } from "@/lib/schemas/permission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERMISSION_TYPES = Object.values(PermissionType);

interface PermissionFormProps {
  onAddPermission: (permission: PermissionDetailDto) => void;
  hasPermission: (permission: PermissionDetailDto) => boolean;
}

export function PermissionForm({ onAddPermission, hasPermission }: PermissionFormProps) {
  const form = useForm<PermissionSchema>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      schemaName: "",
      tableName: "",
      viewName: "",
      permissionType: PermissionType.READ,
    },
    mode: "onChange",
  });

  const { handleSubmit, reset } = form;

  const onSubmit = useCallback(
    (data: PermissionSchema) => {
      const permission: PermissionDetailDto = {
        schemaName: data.schemaName || null,
        tableName: data.tableName || null,
        viewName: data.viewName || null,
        permissionType: data.permissionType,
      };

      if (hasPermission(permission)) {
        toast.error("This permission already exists");
        return;
      }

      onAddPermission(permission);
      reset();
      toast.success("Permission added successfully");
    },
    [hasPermission, onAddPermission, reset]
  );

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h4 className="font-medium">Add Permission</h4>

      <Form {...form}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="schemaName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schema Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Schema name (optional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Leave empty to apply to all schemas</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Table name (optional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Leave empty to apply to all schema objects</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="viewName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>View Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="View name (optional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Leave empty to apply to all schema objects</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PERMISSION_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the type of access to grant</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            size="sm"
            className="gap-2"
            aria-label="Add new permission"
          >
            <Plus className="h-4 w-4" />
            Add Permission
          </Button>
        </div>
      </Form>
    </div>
  );
}
