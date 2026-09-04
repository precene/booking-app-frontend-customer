import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

import { useAuthStore } from "#/features/auth/store/authStore";
import { Button } from "#/shared/components/ui";

import { BrandLogo } from "./BrandLogo";

function CustomerAppbar() {
  const customer = useAuthStore((state) => state.customer);

  return (
    <header className="bg-secondary border-background border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 pt-12 pb-10 sm:px-6 lg:px-8">
        <Link className="flex items-center" to="/" aria-label="977Cinema Home">
          <BrandLogo imageClassName="h-20" />
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
  );
}

export { CustomerAppbar };
