import { ChangeEvent } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type PasswordInputProps = {
  name: string;
  show: boolean;
  onToggle: () => void;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

export function PasswordInput({
  name,
  show,
  onToggle,
  value,
  onChange,
  autoComplete = "new-password",
  minLength = 8,
  required = true,
  invalid,
  describedBy,
}: PasswordInputProps) {
  return (
    <div className="input-wrap has-icon has-toggle">
      <Lock className="input-icon" size={16} />
      <input
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        value={value}
        onChange={onChange}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        className="input-toggle"
        onClick={onToggle}
        aria-label={show ? "Скрыть пароль" : "Показать пароль"}
        aria-pressed={show}
      >
        {show ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
      </button>
    </div>
  );
}
