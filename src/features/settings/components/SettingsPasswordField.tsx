import { Lock } from "lucide-react";

import { Input, Label } from "#/shared/components/ui";

type SettingsPasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function SettingsPasswordField({ error, id, label, onChange, value }: SettingsPasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock
          className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          id={id}
          className="pl-9"
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {error ? (
        <p className="text-destructive text-sm" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { SettingsPasswordField };
