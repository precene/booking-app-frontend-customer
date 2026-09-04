import { cn } from "#/shared/utils/cn";

const logoUrl = "https://977cinema.com/wp-content/uploads/2026/08/977cinema_logo.png";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
};

function BrandLogo({ className, imageClassName }: BrandLogoProps) {
  return (
    <span className={cn("flex items-center", className)}>
      <img
        className={cn("h-10 w-auto object-contain", imageClassName)}
        src={logoUrl}
        alt="977Cinema"
      />
    </span>
  );
}

export { BrandLogo, logoUrl };
