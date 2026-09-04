import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { loadCustomerSession } from "#/features/auth/services/customerSession";
import { useAuthStore } from "#/features/auth/store/authStore";

import { CustomerAppbar } from "./CustomerAppbar";
import { CustomerFooter } from "./CustomerFooter";

function CustomerLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const hasCheckedSession = useAuthStore((state) => state.hasCheckedSession);

  const isAuthPage = pathname === "/login";
  const isAccountPage = ["/dashboard", "/my-bookings", "/my-payments", "/settings"].includes(
    pathname,
  );

  useEffect(() => {
    if (!hasCheckedSession) {
      void loadCustomerSession();
    }
  }, [hasCheckedSession]);

  if (isAuthPage || isAccountPage) {
    return <Outlet />;
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <CustomerAppbar />

      <main>
        <Outlet />
      </main>

      <CustomerFooter />
    </div>
  );
}

export { CustomerLayout };
