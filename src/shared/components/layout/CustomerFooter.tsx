import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";

import { useAuthStore } from "#/features/auth/store/authStore";

import { BrandLogo } from "./BrandLogo";

function CustomerFooter() {
  const customer = useAuthStore((state) => state.customer);

  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <BrandLogo imageClassName="h-20" />
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            Book tickets for Nepali movies screening across UK cinemas and community venues, then
            keep every ticket ready in your account.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <nav className="mt-4 grid gap-2 text-sm text-white/70" aria-label="Footer">
            {customer ? null : (
              <Link className="hover:text-white" to="/login">
                Sign In
              </Link>
            )}
            <Link className="hover:text-white" to="/my-bookings">
              My Bookings
            </Link>
            {customer ? (
              <Link className="hover:text-white" to="/my-payments">
                My Payments
              </Link>
            ) : null}
            <a
              className="hover:text-white"
              href="https://977cinema.com/"
              rel="noreferrer"
              target="_blank"
            >
              977Cinema
            </a>
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
          <span>© {new Date().getFullYear()} 977Cinema. All rights reserved.</span>
          <span>Nepali cinema nights across the UK.</span>
        </div>
      </div>
    </footer>
  );
}

export { CustomerFooter };
