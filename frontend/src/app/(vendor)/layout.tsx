import { VendorSidebar } from "@/components/vendor/vendor-sidebar";
import { VendorTopNav } from "@/components/vendor/vendor-top-nav";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <VendorSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <VendorTopNav />
          <div className="flex-1 px-4 py-6 md:px-8"><main>{children}</main></div>
        </div>
      </div>
    </div>
  );
}
