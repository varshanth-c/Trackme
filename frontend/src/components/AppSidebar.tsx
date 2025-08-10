import {
  LayoutDashboard,
  Plus,
  Wallet,
  TrendingUp,
  Bot,
  Settings,
  Receipt,
  ReceiptIndianRupee,
  Target,
  User as UserIcon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Add Transaction", url: "/add-transaction", icon: Plus },
  { title: "Transactions", url: "/transactions", icon: ReceiptIndianRupee },
  { title: "Budget Manager", url: "/budget", icon: Target },
  { title: "Insights", url: "/insights", icon: TrendingUp },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Profile", url: "/profile", icon: UserIcon },
];

const otherItems = [{ title: "Settings", url: "/settings", icon: Settings }];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-muted text-foreground font-medium border-r-2 border-foreground"
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  // ✅ CHANGED: This function now only takes the first character for consistency with the Profile page.
  const getInitials = (name: string | null | undefined) => (name ? name.charAt(0).toUpperCase() : 'U');

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="border-r flex flex-col">
        <div className="p-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
                {/* ✅ CHANGED: Using an absolute path for the logo is more robust. */}
                <img src="/favicon1.svg" alt="Rupee Coin Logo" width="100" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Track₹</h2>
                <p className="text-xs text-muted-foreground">
                  Financial Dashboard
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/favicon3.svg" alt="Rupee Coin Logo" width="100" />
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={getNavCls}
                      >
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {otherItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* User Profile Section at the bottom */}
        <div className="mt-auto">
          <Separator />
          <div className="p-4">
            {user && (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}