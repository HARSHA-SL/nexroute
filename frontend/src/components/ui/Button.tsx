import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: Props) {
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white",

    secondary:
      "border border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-white",

    success:
      "bg-green-600 hover:bg-green-700 text-white",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      {...props}
      className={`
        rounded-xl
        px-5
        py-3
        font-semibold
        transition-all
        duration-300
        hover:scale-105
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${styles[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}