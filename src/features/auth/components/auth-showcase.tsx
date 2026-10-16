import { CalendarClock } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FUNNEL = [
  { label: "Saved", value: 24, width: "100%", tone: "from-slate-400/60 to-slate-400/20" },
  { label: "Applied", value: 12, width: "62%", tone: "from-sky-400/70 to-sky-400/20" },
  { label: "Interviews", value: 5, width: "34%", tone: "from-indigo-400/80 to-indigo-400/20" },
  { label: "Offers", value: 2, width: "16%", tone: "from-emerald-400/80 to-emerald-400/20" },
];

const SCORES = [
  { label: "ATS fit", value: 88 },
  { label: "Keywords", value: 74 },
  { label: "Clarity", value: 91 },
];

const glass =
  "rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40 backdrop-blur-xl";

function ScoreRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="5" className="stroke-white/10" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="stroke-indigo-400"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-semibold tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}

export function AuthShowcase({ badge }: { badge?: string }) {
  return (
    <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col">
      {/* Atmosphere: soft glows and a faded grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-[360px] w-[360px] rounded-full bg-violet-500/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="relative flex items-center justify-between p-10">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-[13px] font-semibold text-white/90">JobTrackr</span>
        </div>
        {badge && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-sidebar-foreground">{badge}</span>
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-14 px-14 pb-14 xl:px-20">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-6xl">
            Your whole job search, in one calm place.
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-white/55">
            Find roles, track every application, and get your resume sharper with each one.
          </p>
        </div>

        {/* Floating composition */}
        <div aria-hidden className="relative h-[400px] max-w-[760px]">
          {/* Funnel */}
          <div className={`${glass} absolute left-0 top-0 w-[56%] p-6`}>
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium text-white/80">Pipeline</p>
              <p className="text-[11px] text-white/40">This month</p>
            </div>
            <div className="mt-4 space-y-3">
              {FUNNEL.map((row) => (
                <div key={row.label}>
                  <div className="mb-1.5 flex justify-between text-[11px]">
                    <span className="text-white/60">{row.label}</span>
                    <span className="tabular-nums text-white/90">{row.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${row.tone}`}
                      style={{ width: row.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview */}
          <div className={`${glass} absolute right-0 top-10 w-[40%] p-5`}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-300">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white/90">Interview · Stripe</p>
                <p className="truncate text-[11px] text-white/45">Software Engineer</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.05] px-3 py-2 text-[11px]">
              <span className="text-white/55">Tuesday</span>
              <span className="font-medium tabular-nums text-white/90">2:00 PM</span>
            </div>
          </div>

          {/* Resume score */}
          <div className={`${glass} absolute bottom-0 right-[6%] w-[64%] p-5`}>
            <div className="flex items-center gap-4">
              <ScoreRing value={86} />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-xs font-medium text-white/90">Resume review</p>
                {SCORES.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-[10px] text-white/50">
                    <span className="w-14 shrink-0">{s.label}</span>
                    <div className="h-1 flex-1 rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-indigo-400/80"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
