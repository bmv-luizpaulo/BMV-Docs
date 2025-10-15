import DashboardOverview from "@/components/app/dashboard-overview";
import AuthGuard from "@/components/auth/auth-guard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <DashboardOverview />
          </main>
      </div>
    </AuthGuard>
  )
}
