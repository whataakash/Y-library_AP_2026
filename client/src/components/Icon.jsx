import React from "react";
import {
  House,
  Search,
  Compass,
  Heart,
  Lock,
  MapPin,
  Star,
  Sun,
  Moon,
  Play,
  CloudDownload,
  CircleUser,
  Settings,
  MessageSquare,
  Tag,
  ClipboardList,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  BookBookmark,
  Repeat,
  CircleAlert,
  CircleCheck,
  X,
  ArrowRight,
  Plus,
  Minus,
} from "runeicons-react";

// Re-export popular Rune icons for direct named imports if desired
export {
  House,
  Search,
  Compass,
  Heart,
  Lock,
  MapPin,
  Star,
  Sun,
  Moon,
  Play,
  CloudDownload,
  CircleUser,
  Settings,
  MessageSquare,
  Tag,
  ClipboardList,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  BookBookmark,
  Repeat,
  CircleAlert,
  CircleCheck,
  X,
  ArrowRight,
  Plus,
  Minus,
};

// Map of canonical icon names to their respective runeicons-react component
const RUNE_ICON_MAP = {
  // Navigation & Core App
  home: House,
  house: House,
  search: Search,
  compass: Compass,
  explore: Compass,
  heart: Heart,
  favorites: Heart,
  library: BookBookmark,
  book: BookBookmark,
  bookmark: BookBookmark,
  books: BookBookmark,
  
  // Community & Social
  chat: MessageSquare,
  community: MessageSquare,
  message: MessageSquare,
  user: CircleUser,
  profile: CircleUser,

  // Commerce & Campus Services
  store: ShoppingBag,
  shop: ShoppingBag,
  tag: Tag,
  marketplace: Tag,
  clipboard: ClipboardList,
  requests: ClipboardList,
  settings: Settings,

  // States, Audio & Media
  play: Play,
  download: CloudDownload,
  lock: Lock,
  pin: MapPin,
  location: MapPin,
  star: Star,
  sparkles: Sparkles,
  check: Check,
  circleCheck: CircleCheck,
  repeat: Repeat,

  // Theme & Weather
  sun: Sun,
  moon: Moon,

  // Arrows & Chevrons
  arrowLeft: ArrowLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,

  // Alerts
  alert: CircleAlert,

  // Actions & Controls
  x: X,
  close: X,
  plus: Plus,
  minus: Minus,
  arrowRight: ArrowRight,
  "arrow-right": ArrowRight,
};

/**
 * Universal Icon component backed by runeicons-react
 * Preserves compatibility with existing props (name, size, color, style, className)
 */
export default function Icon({
  name,
  size = 18,
  color = "currentColor",
  style = {},
  className = "",
  ...rest
}) {
  const RuneComponent = RUNE_ICON_MAP[name];

  if (RuneComponent) {
    return (
      <RuneComponent
        size={size}
        color={color}
        style={{ display: "inline-block", verticalAlign: "middle", ...style }}
        className={className}
        {...rest}
      />
    );
  }

  // Graceful fallback for specific shapes like bell or custom svgs
  if (name === "bell") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "inline-block", verticalAlign: "middle", ...style }}
        className={className}
        {...rest}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  if (name === "maximize" || name === "expand") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "inline-block", verticalAlign: "middle", ...style }}
        className={className}
        {...rest}
      >
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="M21 3l-7 7" />
        <path d="M3 21l7-7" />
      </svg>
    );
  }

  if (name === "minimize" || name === "collapse") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: "inline-block", verticalAlign: "middle", ...style }}
        className={className}
        {...rest}
      >
        <path d="M4 14h6v6" />
        <path d="M20 10h-6V4" />
        <path d="M14 10l7-7" />
        <path d="M10 14l-7 7" />
      </svg>
    );
  }

  // Generic dot/star fallback
  return (
    <Star
      size={size}
      color={color}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      className={className}
      {...rest}
    />
  );
}
