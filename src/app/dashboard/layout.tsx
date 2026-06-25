import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { UserMenu } from "@/components/UserMenu";
import { SemesterProvider } from "@/components/SemesterContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SemesterProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top Navbar */}
          <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shrink-0">
            {/* Spacer for hamburger button on mobile */}
            <div className="w-10 md:hidden" />
            
            <div className="flex-1 max-w-xl hidden sm:block">
              <input
                type="text"
                placeholder="Search research & papers..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-2 text-[#D9CBC2] focus:outline-none focus:border-[#E0C58F] transition-colors text-sm"
              />
            </div>
            <div className="ml-auto">
              <UserMenu
                name={session.user?.name || "User"}
                image={session.user?.image || undefined}
              />
            </div>
          </header>

          {/* Dashboard Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SemesterProvider>
  );
}
