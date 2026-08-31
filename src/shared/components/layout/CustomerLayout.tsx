import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Film, LogIn, Mail, Phone } from "lucide-react";

import { useAuthStore } from "#/features/auth/store/authStore";

import { Button } from "#/shared/components/ui";

function CustomerLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isAuthPage = pathname === "/login";
  const isAccountPage = ["/dashboard", "/my-bookings", "/my-payments", "/settings"].includes(
    pathname,
  );

  const customer = useAuthStore((state) => state.customer);

  if (isAuthPage || isAccountPage) {
    return <Outlet />;
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="bg-surface border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2 text-lg font-semibold" to="/">
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
              <Film className="size-5" aria-hidden="true" />
            </span>
            977Cinema
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild>
              <Link to={customer ? "/dashboard" : "/login"}>
                <LogIn aria-hidden="true" />
                {customer ? "My Account" : "Sign In"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-secondary text-secondary-foreground border-t">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
                <Film className="size-5" aria-hidden="true" />
              </span>
              977Cinema
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              Book tickets for Nepali movies screening across UK cinemas and community venues, then
              keep every ticket ready in your account.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Explore</h2>
            <nav className="mt-4 grid gap-2 text-sm text-white/70" aria-label="Footer">
              <Link className="hover:text-white" to="/">
                Movies
              </Link>
              <Link className="hover:text-white" to="/dashboard">
                My Bookings
              </Link>
              <Link className="hover:text-white" to="/login">
                Sign In
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Support</h2>
            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden="true" />
                help@977cinema.test
              </span>
              <span className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden="true" />
                +977 9800000000
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span>© 2026 977Cinema. All rights reserved.</span>
            <span>Nepali cinema nights across the UK.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { CustomerLayout };
