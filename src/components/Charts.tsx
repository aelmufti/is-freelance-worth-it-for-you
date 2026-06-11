import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FiscalParams, SimulationInput } from "../lib/params";
import {
  calcCdi,
  calcEi,
  calcEurl,
  calcMicro,
  calcPortage,
  calcSasu,
  tjmEquivalentCdi,
  type StatutResult,
} from "../lib/engine";
import { STATUT_COLORS } from "./Results";
import { Card, euro } from "./ui";

const MONO = "JetBrains Mono, monospace";

const tooltipStyle = {
  border: "3px solid #0d0d0d",
  borderRadius: 0,
  background: "#fff",
  fontFamily: MONO,
  fontSize: 12,
  fontWeight: 700,
  boxShadow: "4px 4px 0 0 #0d0d0d",
};

export function CompareBars({ results }: { results: StatutResult[] }) {
  const data = results.map((r) => ({
    name:
      r.label.replace(" SALARIAL", "").replace(" (CADRE)", "") +
      (r.eligible ? "" : " ✕"),
    id: r.id,
    eligible: r.eligible,
    net: r.eligible ? Math.round(r.netMensuel) : 0,
  }));
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.06em]">
        Net mensuel après impôt, par statut
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#0d0d0d" strokeOpacity={0.12} />
          <XAxis
            dataKey="name"
            tick={{ fontFamily: MONO, fontSize: 10, fontWeight: 700 }}
            stroke="#0d0d0d"
            interval={0}
          />
          <YAxis
            tick={{ fontFamily: MONO, fontSize: 10, fontWeight: 700 }}
            stroke="#0d0d0d"
            tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [euro(Number(v)), "Net/mois"]}
            cursor={{ fill: "rgb(13 13 13 / 0.06)" }}
          />
          <Bar dataKey="net" stroke="#0d0d0d" strokeWidth={2} isAnimationActive={false}>
            {data.map((d) => (
              <Cell
                key={d.id}
                fill={d.eligible ? STATUT_COLORS[d.id] : "hsl(0 0% 90%)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

const CALCS = [
  { id: "micro" as const, label: "Micro", fn: calcMicro },
  { id: "ei" as const, label: "EI réel", fn: calcEi },
  { id: "eurl" as const, label: "EURL", fn: calcEurl },
  { id: "sasu" as const, label: "SASU", fn: calcSasu },
  { id: "portage" as const, label: "Portage", fn: calcPortage },
];

export function BreakEvenChart({
  input,
  params,
}: {
  input: SimulationInput;
  params: FiscalParams;
}) {
  const cdiNet = calcCdi(input, params).netAnnuel / 12;
  const maxTjm = Math.max(900, input.tjm * 1.6);

  const data: Array<Record<string, number>> = [];
  for (let tjm = 100; tjm <= maxTjm; tjm += 25) {
    const row: Record<string, number> = { tjm };
    for (const c of CALCS) {
      const r = c.fn({ ...input, tjm }, params);
      if (r.eligible) row[c.id] = Math.round(r.netMensuel);
    }
    data.push(row);
  }

  const seuils = CALCS.map((c) => ({
    ...c,
    tjm: tjmEquivalentCdi(input, params, c.fn),
  }));

  return (
    <Card className="p-4">
      <h3 className="mb-1 text-sm font-extrabold uppercase tracking-[0.06em]">
        À partir de quel TJM battez-vous votre CDI ?
      </h3>
      <p className="mb-3 text-xs opacity-70">
        Net mensuel après impôt en fonction du TJM ({input.joursParMois} j/mois,{" "}
        {input.moisFactures} mois/an). La ligne noire = votre CDI à{" "}
        {euro(input.cdiBrutAnnuel)} brut/an.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#0d0d0d" strokeOpacity={0.12} />
          <XAxis
            dataKey="tjm"
            tick={{ fontFamily: MONO, fontSize: 10, fontWeight: 700 }}
            stroke="#0d0d0d"
            tickFormatter={(v: number) => `${v}€`}
          />
          <YAxis
            tick={{ fontFamily: MONO, fontSize: 10, fontWeight: 700 }}
            stroke="#0d0d0d"
            tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => [euro(Number(v)) + "/mois", String(name)]}
            labelFormatter={(l) => `TJM ${l} €`}
          />
          <ReferenceLine
            y={cdiNet}
            stroke="#0d0d0d"
            strokeWidth={3}
            strokeDasharray="8 4"
            label={{
              value: `CDI ${euro(cdiNet)}/mois`,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 800,
              fill: "#0d0d0d",
              position: "insideBottomRight",
            }}
          />
          {CALCS.map((c) => (
            <Line
              key={c.id}
              type="monotone"
              dataKey={c.id}
              name={c.label}
              stroke={STATUT_COLORS[c.id]}
              strokeWidth={3}
              strokeDasharray={c.id === "eurl" ? "6 4" : undefined}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {seuils.map((s) => (
          <div
            key={s.id}
            className="border-2 border-ink px-2 py-1 text-center"
            style={{ background: "var(--color-tag-offwhite)" }}
          >
            <div
              className="text-[10px] font-extrabold uppercase tracking-[0.06em]"
              style={{ color: STATUT_COLORS[s.id] }}
            >
              {s.label}
            </div>
            <div className="text-sm font-extrabold">
              {s.tjm === null ? "—" : `≥ ${Math.ceil(s.tjm / 5) * 5} €/j`}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
