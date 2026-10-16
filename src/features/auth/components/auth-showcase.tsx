import { CalendarClock, FileText, Search, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";

type Stage = {
  name: string;
  dot: string;
  cards: { role: string; company: string; note?: string }[];
};

const STAGES: Stage[] = [
  {
    name: "Saved",
    dot: "bg-slate-400",
    cards: [{ role: "Product Designer", company: "Linear" }],
  },
  {
    name: "Applied",
    dot: "bg-sky-400",
    cards: [
      { role: "Frontend Engineer", company: "Vercel", note: "Follow up Fri" },
      { role: "Full-stack Developer", company: "Paystack" },
    ],
  },
  {
    name: "Interview",
    dot: "bg-amber-400",
    cards: [{ role: "Software Engineer", company: "Stripe", note: "Tue, 2:00 PM" }],
  },
  {
    name: "Offer",
    dot: "bg-emerald-400",
    cards: [{ role: "Web Engineer", company: "Notion" }],
  },
];

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Search,
    title: "Find roles that fit",
    body: "Browse and match jobs, then save the ones worth chasing.",
  },
  {
    icon: CalendarClock,
    title: "Never miss a follow-up",
    body: "Reminders and a calendar keep interviews and deadlines in view.",
  },
  {
    icon: FileText,
    title: "Sharpen your resume",
    body: "AI review gives concrete suggestions, tailored to each job.",
  },
];

export function AuthShowcase({ badge }: { badge?: string }) {
  return (
    <div className="relative hidden overflow-hidden bg-sidebar p-10 lg:flex lg:flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-[13px] font-semibold text-white/90">JobTrackr</span>
        </div>
        {badge && (
          <div className="inline-flex items-center gap-2 rounded-full bg-sidebar-accent px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-sidebar-foreground">{badge}</span>
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col justify-center space-y-8 py-8">
        <div className="max-w-md space-y-3">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Every application, from first save to signed offer.
          </h2>
          <p className="text-sm leading-relaxed text-sidebar-foreground">
            JobTrackr is your job search in one place: discover roles, track each
            application, and improve your resume along the way.
          </p>
        </div>

        <div
          aria-hidden
          className="grid grid-cols-4 gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-black/30"
        >
          {STAGES.map((stage) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-white/70">
                <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                {stage.name}
              </div>
              {stage.cards.map((card) => (
                <div
                  key={card.company}
                  className="rounded-lg border border-white/10 bg-white/[0.07] p-2.5"
                >
                  <p className="truncate text-[11px] font-medium text-white/90">{card.role}</p>
                  <p className="mt-0.5 truncate text-[11px] text-white/50">{card.company}</p>
                  {card.note && (
                    <p className="mt-2 truncate rounded bg-primary/25 px-1.5 py-0.5 text-[10px] text-indigo-200">
                      {card.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <ul className="grid gap-4">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-200">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-white/90">{title}</p>
                <p className="text-[13px] leading-relaxed text-sidebar-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
