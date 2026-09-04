import { useState } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Home,
  LogOut,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "#/shared/components/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/shared/components/ui/tooltip";
import { authApi } from "#/features/auth/services/authApi";
import { useAuthStore } from "#/features/auth/store/authStore";
import { cn } from "#/shared/utils/cn";

import { BrandLogo } from "./BrandLogo";

const accountNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: CalendarCheck, label: "My Bookings", to: "/my-bookings" },
  { icon: CreditCard, label: "My Payments", to: "/my-payments" },
  { icon: Settings, label: "Settings", to: "/settings" },
] as const;

function CustomerAccountLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();

  const customer = useAuthStore((state) => state.customer);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      useAuthStore.getState().logout();
      void navigate({ to: "/login" });
    }
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside
        className={cn(
          "bg-surface fixed inset-y-0 left-0 z-40 hidden flex-col border-r transition-[width] duration-200 lg:flex",
          isCollapsed ? "w-18" : "w-60",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <Link className="flex items-center gap-3" to="/">
            <BrandLogo imageClassName={isCollapsed ? "h-8" : "h-12"} />

            {!isCollapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">977Cinema</p>
                <p className="text-muted truncate text-xs">Customer Panel</p>
              </div>
            ) : null}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Customer Account">
          {accountNavItems.map((item) => (
            <AccountNavLink isCollapsed={isCollapsed} item={item} key={item.to} />
          ))}
        </nav>

        <div className="border-t p-4">
          <Button
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={cn("w-full", isCollapsed && "px-0")}
            onClick={() => setIsCollapsed((currentValue) => !currentValue)}
            type="button"
            variant="outline"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="size-4" aria-hidden="true" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-screen flex-1 transition-[padding-left] duration-200",
          isCollapsed ? "lg:pl-18" : "lg:pl-60",
        )}
      >
        <header className="bg-surface/95 sticky top-0 z-30 border-b backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link className="flex items-center gap-2 font-semibold lg:hidden" to="/">
                <BrandLogo imageClassName="h-9" />
              </Link>

              <div className="min-w-0 flex-1 lg:flex-none">
                <h1 className="max-w-80 truncate text-sm font-semibold tracking-normal">
                  {customer?.fullName ?? customer?.email}
                </h1>
                <p className="text-muted max-w-96 truncate text-xs">
                  {customer ? `${customer.email}` : null}
                </p>
              </div>

              <Button className="lg:hidden" size="sm" type="button" onClick={handleLogout}>
                <LogOut aria-hidden="true" />
                Logout
              </Button>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button asChild variant="outline">
                <Link to="/">
                  <Home aria-hidden="true" />
                  Browse Movies
                </Link>
              </Button>
              <Button type="button" onClick={handleLogout}>
                <LogOut aria-hidden="true" />
                Logout
              </Button>
            </div>

            <nav
              className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
              aria-label="Customer Account"
            >
              {accountNavItems.map((item) => (
                <MobileAccountNavLink item={item} key={item.to} />
              ))}
            </nav>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type AccountNavItem = (typeof accountNavItems)[number];

function AccountNavLink({ isCollapsed, item }: { isCollapsed: boolean; item: AccountNavItem }) {
  const Icon = item.icon;
  const link = (
    <Link
      activeProps={{
        className:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      }}
      className="text-muted-foreground hover:bg-primary/90 hover:text-primary-foreground flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors"
      to={item.to}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (!isCollapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger>{link}</TooltipTrigger>
      <TooltipContent>{item.label}</TooltipContent>
    </Tooltip>
  );
}

function MobileAccountNavLink({ item }: { item: AccountNavItem }) {
  const Icon = item.icon;

  return (
    <Link
      activeProps={{
        className: "border-primary bg-primary text-primary-foreground",
      }}
      className="bg-surface text-muted-foreground flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium"
      to={item.to}
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.label}
    </Link>
  );
}

export { CustomerAccountLayout };
