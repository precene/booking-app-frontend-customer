import type { FormEventHandler, ReactNode } from "react";

import { Alert, AlertDescription, Button, Form } from "#/shared/components/ui";

type SettingsFormCardProps = {
  title: string;
  description: string;
  action?: ReactNode;
  submitLabel?: string;
  isSubmitting?: boolean;
  status?: string | null;
  statusTone?: "success" | "error" | "info";
  children: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

function SettingsFormCard({
  action,
  children,
  description,
  isSubmitting = false,
  onSubmit,
  status,
  statusTone = "info",
  submitLabel,
  title,
}: SettingsFormCardProps) {
  const statusClasses = {
    error: "border-destructive/30 bg-destructive/5 text-destructive",
    info: "border-warning/30 bg-warning/5 text-warning",
    success: "border-success/30 bg-success/5 text-success",
  };

  return (
    <Form className="bg-surface rounded-md border p-5 shadow-sm sm:p-6" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h3 className="text-lg font-semibold tracking-normal">{title}</h3>
          <p className="text-muted-foreground text-sm leading-6">{description}</p>
        </div>

        {action ??
          (submitLabel ? (
            <Button className="shrink-0" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          ) : null)}
      </div>

      {status ? (
        <Alert className={`${statusClasses[statusTone]} mt-5`}>
          <AlertDescription className="mt-0 text-inherit">{status}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-5 grid gap-5">{children}</div>
    </Form>
  );
}

export { SettingsFormCard };
