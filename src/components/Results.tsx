import type { StatutResult, StatutId } from "../lib/engine";
import { Badge, Card, euro, euroSigne } from "./ui";

export const STATUT_COLORS: Record<StatutId, string> = {
  micro: "#d4a800",
  ei: "#cc5200",
  eurl: "#cc1f66",
  sasu: "#1754cc",
  portage: "#0a9438",
  cdi: "#0d0d0d",
};

export const TEXT_ON: Record<StatutId, string> = {
  micro: "#0d0d0d",
  ei: "#fff",
  eurl: "#fff",
  sasu: "#fff",
  portage: "#fff",
  cdi: "#fff",
};

export function ResultCard({
  r,
  best,
  rank,
  spotlight = "none",
}: {
  r: StatutResult;
  best: boolean;
  rank: number;
  spotlight?: "none" | "on" | "off";
}) {
  return (
    <Card
      lift
      className={`anim-up flex flex-col transition-all duration-150 ${r.eligible ? "" : "opacity-60"} ${
        spotlight === "off" ? "opacity-30" : ""
      } ${spotlight === "on" ? "-translate-y-1 shadow-brutal-lg" : ""}`}
    >
      <div
        className="flex items-center justify-between border-b-[3px] border-ink px-4 py-2"
        style={{ backgroundColor: STATUT_COLORS[r.id], color: TEXT_ON[r.id] }}
        suppressHydrationWarning
      >
        <span className="text-sm font-extrabold uppercase tracking-[0.06em]">
          {r.label}
        </span>
        {!r.eligible ? (
          <span className="border-2 border-ink bg-tag-red px-2 text-xs font-extrabold text-white">
            ✕ NON ACCESSIBLE
          </span>
        ) : best ? (
          <span className="border-2 border-ink bg-white px-2 text-xs font-extrabold text-ink">
            ★ MEILLEUR NET ESTIMÉ
          </span>
        ) : (
          <span className="text-xs font-extrabold opacity-80">{`#${rank}`}</span>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="text-3xl font-extrabold tracking-tight">
          {euro(r.netMensuel)}
          <span className="text-sm font-bold opacity-70"> net/mois</span>
        </div>
        <div className="text-xs font-bold opacity-70">
          {`${euro(r.netAnnuel)} net/an après impôt — ${(r.tauxRestitution * 100).toFixed(0)} % du ${r.baseLabel ?? "CA"} conservé`}
        </div>

        {/* Barre de répartition */}
        <div className="mt-3 flex h-5 w-full border-2 border-ink">
          <div
            className="h-full"
            style={{
              backgroundColor: STATUT_COLORS[r.id],
              width: `${Math.max(0, r.tauxRestitution * 100).toFixed(2)}%`,
            }}
            title="Net"
            suppressHydrationWarning
          />
          <div
            className="h-full bg-muted"
            style={{
              width: `${Math.min(
                100,
                100 - Math.max(0, r.tauxRestitution * 100),
              ).toFixed(2)}%`,
            }}
            title="Prélèvements + frais"
          />
        </div>

        <table className="mt-3 w-full text-xs">
          <tbody>
            {r.details.map((d) => (
              <tr key={d.label} className="border-b border-ink/20">
                <td className="py-1 pr-2 opacity-70">{d.label}</td>
                <td
                  className={`py-1 text-right font-extrabold ${d.value < 0 ? "text-tag-red" : ""}`}
                >
                  {euroSigne(d.value)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-1 pr-2 font-extrabold uppercase">Net final</td>
              <td className="py-1 text-right font-extrabold">
                {euro(r.netAnnuel)}
              </td>
            </tr>
          </tbody>
        </table>

        {r.warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {r.warnings.map((w) => (
              <div
                key={w}
                className="border-2 border-ink bg-tag-offwhite px-2 py-1 text-[11px] font-bold"
              >
                {`⚠ ${w}`}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export function Podium({
  results,
  focusStatuts = null,
}: {
  results: StatutResult[];
  focusStatuts?: StatutId[] | null;
}) {
  const sorted = [...results]
    .filter((r) => r.eligible)
    .sort((a, b) => b.netAnnuel - a.netAnnuel);
  const bestId = sorted[0]?.id;
  const rank = new Map(sorted.map((r, i) => [r.id, i + 1]));
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {results.map((r, i) => (
        <div key={r.id} style={{ animationDelay: `${(i * 50) / 1000}s` }} className="anim-up">
          <ResultCard
            r={r}
            best={r.id === bestId}
            rank={rank.get(r.id) ?? 0}
            spotlight={
              focusStatuts === null
                ? "none"
                : focusStatuts.includes(r.id)
                  ? "on"
                  : "off"
            }
          />
        </div>
      ))}
    </div>
  );
}

export function BadgeStatut({ id, label }: { id: StatutId; label: string }) {
  return (
    <Badge color={STATUT_COLORS[id]} textColor={TEXT_ON[id]}>
      {label}
    </Badge>
  );
}
