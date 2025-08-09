import { AuthProvider } from "@/components/auth/auth-provider";
import MainLayout from "@/components/layout/main-layout";
import QueryProvider from "@/components/react-query/query-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <MainLayout>{children}</MainLayout>
      </AuthProvider>
    </QueryProvider>
  );
}
