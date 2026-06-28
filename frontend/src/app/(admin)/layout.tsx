import { Breadcrumb } from "@/components/common/breadcrumb";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopNav } from "@/components/admin/admin-top-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopNav />
          <div className="flex-1 px-4 py-6 md:px-8">
            <div className="mb-6 lg:hidden">
              <Breadcrumb items={[{ label: "Admin" }]} />
            </div>
            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
