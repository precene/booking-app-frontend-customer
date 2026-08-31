import type { FormEventHandler, ReactNode } from "react";

import { Alert, AlertDescription, Button, Form } from "#/shared/components/ui";

type SettingsFormCardProps = {
  title: string;
  description: string;
  submitLabel: string;
  status?: string | null;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

function SettingsFormCard({
  children,
  description,
  onSubmit,
  status,
  submitLabel,
  title,
}: SettingsFormCardProps) {
  return (
    <Form className="bg-surface rounded-md border p-5 shadow-sm sm:p-6" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h3 className="text-lg font-semibold tracking-normal">{title}</h3>
          <p className="text-muted-foreground text-sm leading-6">{description}</p>
        </div>

        <Button className="shrink-0" type="submit">
          {submitLabel}
        </Button>
      </div>

      <div className="mt-5 grid gap-5">{children}</div>

      {status ? (
        <Alert className="border-warning/30 bg-warning/5 text-warning mt-5">
          <AlertDescription className="text-warning mt-0">{status}</AlertDescription>
        </Alert>
      ) : null}
    </Form>
  );
}

export { SettingsFormCard };
