import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type IconButtonProps<E extends ElementType = "button"> = {
  as?: E;
  icon: ReactNode;
  dot?: boolean;
  label: string;
} & Omit<ComponentPropsWithoutRef<E>, "children" | "aria-label">;

export function IconButton<E extends ElementType = "button">({
  as,
  icon,
  dot,
  label,
  className,
  ...rest
}: IconButtonProps<E>) {
  const Component = (as ?? "button") as ElementType;
  return (
    <Component
      aria-label={label}
      className={cn(
        "relative w-10 h-10 rounded-full flex items-center justify-center transition-colors",
        "bg-black/5 hover:bg-black/10 text-black",
        "dark:bg-[#1a1d22] dark:hover:bg-[#24282f] dark:text-white",
        className,
      )}
      {...rest}
    >
      {icon}
      {dot && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0f1114]"
        />
      )}
    </Component>
  );
}
