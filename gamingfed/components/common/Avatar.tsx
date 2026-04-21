import { User } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  href?: string;
  size?: number;
  className?: string;
}

export function Avatar({
  src,
  alt = "Profile",
  href,
  size = 40,
  className,
}: AvatarProps) {
  const content = (
    <span
      className={cn(
        "rounded-full ring-2 ring-cyan-400 overflow-hidden bg-[#1a1d22]",
        "flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className="w-5 h-5 text-gray-300" aria-hidden />
      )}
    </span>
  );
  return href ? (
    <Link href={href} aria-label={alt}>
      {content}
    </Link>
  ) : (
    content
  );
}
