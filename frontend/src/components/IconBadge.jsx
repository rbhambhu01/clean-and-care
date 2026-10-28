import {
  Armchair,
  Baby,
  Briefcase,
  Car,
  Droplets,
  Flame,
  Footprints,
  Home,
  LayoutGrid,
  Scale,
  Shirt,
  Sparkles,
  SprayCan,
  SquareStack,
} from "lucide-react";
import { img } from "../lib/assets.js";

const ICONS = {
  shirt: Shirt,
  "washing-machine": Droplets,
  iron: Flame,
  briefcase: Briefcase,
  shoe: Footprints,
  carpet: LayoutGrid,
  curtains: SquareStack,
  toy: Baby,
  spray: SprayCan,
  car: Car,
  home: Home,
  sofa: Armchair,
  sparkles: Sparkles,
  scale: Scale,
};

// Slugs that have a real brand icon file downloaded from the site into /public/images/icons
const BRAND_ICON_SLUGS = new Set([
  "dry-cleaning",
  "wet-cleaning",
  "steam-ironing",
  "bag-cleaning",
  "shoe-cleaning",
  "carpet-cleaning",
  "curtain-cleaning",
  "toy-cleaning",
  "home-sanitize",
  "car-cleaning",
  "home-cleaning",
  "sofa-cleaning",
]);

export default function IconBadge({ icon, slug, size = "md", className = "" }) {
  const dims = size === "lg" ? "h-20 w-20" : "h-16 w-16";
  const iconDims = size === "lg" ? "h-8 w-8" : "h-7 w-7";

  if (slug && BRAND_ICON_SLUGS.has(slug)) {
    return (
      <div
        className={`flex ${dims} items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-ink/5 ${className}`}
      >
        <img
          src={img(`icons/icon-${slug}.png`)}
          alt=""
          className={`${iconDims} object-contain`}
        />
      </div>
    );
  }

  const Icon = ICONS[icon] || Sparkles;
  return (
    <div
      className={`flex ${dims} items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-ink/5 ${className}`}
    >
      <Icon className={`${iconDims} text-lime-dark`} strokeWidth={1.75} />
    </div>
  );
}
