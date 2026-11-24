import {
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  Flame,
  Layers,
  ListChecks,
  type LucideIcon,
  Play,
  Rocket,
  ShieldCheck,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react-native";

export interface OnboardingFeature {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  features: OnboardingFeature[];
}

// Three slides, in the order a new install needs them: what this is, how a
// session works, then the one action that starts everything.
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welcome to Tally",
    description:
      "Log the work, keep the streak. No account, no cloud — everything stays on this phone.",
    icon: Dumbbell,
    features: [
      {
        icon: Layers,
        title: "Built around your split",
        body: "Six preset programs, including the 6-day home barbell plan, with targets and rest already set.",
      },
      {
        icon: Trophy,
        title: "Streaks with a safety net",
        body: "Earn XP, level up, and spend freeze tokens when life gets in the way.",
      },
      {
        icon: ShieldCheck,
        title: "Offline, always",
        body: "Your sets live in a local database. Nothing is uploaded anywhere.",
      },
    ],
  },
  {
    id: "logging",
    title: "Three taps per set.",
    description:
      "Weight, reps, log. The rest timer handles the gap, and the plan tells you what's next.",
    icon: ClipboardCheck,
    features: [
      {
        icon: ListChecks,
        title: "Today's plan is ready",
        body: "Open the app and the right day of your split is already waiting.",
      },
      {
        icon: Timer,
        title: "Rest that follows the plan",
        body: "90 seconds after a superset pair, 60 after the finisher — straight from the program.",
      },
      {
        icon: TrendingUp,
        title: "Progress you can see",
        body: "Volume, PRs and session history build up automatically as you train.",
      },
    ],
  },
  {
    id: "ready",
    title: "Ready when you are.",
    description:
      "Pick a split, start today's session, and let the streak build from day one.",
    icon: Rocket,
    features: [
      {
        icon: Play,
        title: "Start from Home",
        body: "Today's workout is always one tap away.",
      },
      {
        icon: CalendarDays,
        title: "Six days on, one off",
        body: "The 6-day plan keeps Wednesday free for recovery.",
      },
      {
        icon: Flame,
        title: "Day one counts",
        body: "Finishing your first session starts the streak and the XP.",
      },
    ],
  },
];
