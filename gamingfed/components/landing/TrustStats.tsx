import { BadgeCheck, Users, Zap, Headphones } from "lucide-react";
import { Section } from "@/components/common/Section";
import { Card, CardIcon } from "@/components/ui/card";

/**
 * "Why players trust us" stat strip — four small cards with a number +
 * label + context. Pure static server component; if/when these numbers
 * come from the backend we can swap the array for props without touching
 * markup.
 */

interface Stat {
  icon: React.ReactNode;
  /**
   * Only on-palette tones are allowed — `brand` (cyan gradient), plain
   * `cyan`, or `slate`. Semantic colours (red/green/amber) are reserved
   * for functional states and must not be used decoratively here.
   */
  tone: "brand" | "cyan" | "slate";
  value: string;
  label: string;
  sub: string;
}

const STATS: Stat[] = [
  {
    icon: <BadgeCheck className="h-5 w-5" aria-hidden />,
    tone: "brand",
    value: "10k+",
    label: "IDs sold",
    sub: "Across every major title",
  },
  {
    icon: <Users className="h-5 w-5" aria-hidden />,
    tone: "cyan",
    value: "98%",
    label: "Happy buyers",
    sub: "Based on post-deal ratings",
  },
  {
    icon: <Zap className="h-5 w-5" aria-hidden />,
    tone: "cyan",
    value: "< 5 min",
    label: "Avg. handover",
    sub: "From payment to login",
  },
  {
    icon: <Headphones className="h-5 w-5" aria-hidden />,
    tone: "slate",
    value: "24 / 7",
    label: "Live support",
    sub: "Real humans, every hour",
  },
];

export function TrustStats() {
  return (
    <Section
      eyebrow="Trusted by players"
      title="Numbers that actually matter"
      description="We care about the boring metrics — dispute rate, response time, seller accuracy — because that's what keeps you safe."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {STATS.map((s) => (
          <Card key={s.label} padding="lg" className="flex flex-col gap-3">
            <CardIcon tone={s.tone}>{s.icon}</CardIcon>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white md:text-3xl">
                {s.value}
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                {s.label}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                {s.sub}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
