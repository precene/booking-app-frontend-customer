import type { ComponentProps } from "react";

import { cn } from "#/shared/utils/cn";

function Alert({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-surface text-foreground rounded-md border px-4 py-3 text-sm", className)}
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("font-medium", className)} {...props} />;
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-muted-foreground mt-1", className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle };
