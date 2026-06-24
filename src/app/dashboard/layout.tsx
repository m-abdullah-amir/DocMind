import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-8">
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search research & papers..."
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-2 text-[#D9CBC2] focus:outline-none focus:border-[#E0C58F] transition-colors"
            />
          </div>
          <div className="ml-4 flex items-center gap-4">
            <span className="text-sm">{session.user?.name}</span>
            {session.user?.image ? (
              <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full border border-white/20" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full border border-white/20 bg-[#E0C58F] text-[#173450] flex items-center justify-center font-bold text-lg">
                {session.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
