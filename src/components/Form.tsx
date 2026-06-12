import { useState } from "react";
import type { ReactNode } from "react";
import type { FiscalParams, SimulationInput } from "../lib/params";
import { caAnnuel } from "../lib/params";
import type { StatutId } from "../lib/engine";
import { STATUT_COLORS, TEXT_ON } from "./Results";
import {
  Card,
  NumberField,
  SelectField,
  SliderField,
  Toggle,
  euro,
} from "./ui";

const TAGS: Record<StatutId, string> = {
  micro: "MICRO",
  ei: "EI",
  eurl: "EURL",
  sasu: "SASU",
  portage: "PORTAGE",
  cdi: "SALARIÉ",
};

const FREELANCE: StatutId[] = ["micro", "ei", "eurl", "sasu", "portage"];
const TOUS: StatutId[] = [...FREELANCE, "cdi"];

export type FocusStatuts = (s: StatutId[] | null) => void;

function Chips({ statuts, label }: { statuts: StatutId[]; label?: string }) {
  if (label) {
    return (
      <span className="border border-ink bg-tag-offwhite px-1 py-px text-[9px] font-extrabold uppercase tracking-[0.04em]">
        {label}
      </span>
    );
  }
  return (
    <span className="flex flex-wrap justify-end gap-1">
      {statuts.map((s) => (
        <span
          key={s}
          className="border border-ink px-1 py-px text-[9px] font-extrabold uppercase tracking-[0.04em]"
          style={{ backgroundColor: STATUT_COLORS[s], color: TEXT_ON[s] }}
          suppressHydrationWarning
        >
          {TAGS[s]}
        </span>
      ))}
    </span>
  );
}

/** Zone de champs : affiche les statuts impactés et les met en avant au survol/focus. */
function Impact({
  statuts,
  focus,
  leaveTo = null,
  children,
  className = "",
}: {
  statuts: StatutId[];
  focus: FocusStatuts;
  leaveTo?: StatutId[] | null; // statuts à restaurer en sortie (zones imbriquées)
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      onMouseEnter={() => focus(statuts)}
      onMouseLeave={() => focus(leaveTo)}
      onFocusCapture={() => focus(statuts)}
      onBlurCapture={() => focus(leaveTo)}
    >
      {children}
    </div>
  );
}

/** Sous-section repliable dédiée à un (groupe de) statut(s). */
function Group({
  title,
  statuts,
  headerColor,
  headerText,
  focus,
  defaultOpen = false,
  children,
}: {
  title: string;
  statuts: StatutId[];
  headerColor: string;
  headerText: string;
  focus: FocusStatuts;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Impact statuts={statuts} focus={focus}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="brutal-press flex w-full items-center justify-between gap-2 border-2 border-ink px-3 py-2 text-left shadow-brutal-sm"
        style={{ backgroundColor: headerColor, color: headerText }}
        suppressHydrationWarning
      >
        <span className="text-xs font-extrabold uppercase tracking-[0.06em]">
          {title}
        </span>
        <span className="flex items-center gap-2">
          <Chips statuts={statuts} />
          <span aria-hidden="true">{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && (
        <div className="anim-up space-y-4 border-2 border-t-0 border-ink bg-white p-3">
          {children}
        </div>
      )}
    </Impact>
  );
}

export function MainForm({
  input,
  setInput,
  onFocusStatuts = () => undefined,
}: {
  input: SimulationInput;
  setInput: (i: SimulationInput) => void;
  onFocusStatuts?: FocusStatuts;
}) {
  const set = <K extends keyof SimulationInput>(k: K, v: SimulationInput[K]) =>
    setInput({ ...input, [k]: v });
  const focus = onFocusStatuts;

  return (
    <Card className="p-5">
      <div className="space-y-5">
        <Impact statuts={FREELANCE} focus={focus}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.12em]">
              ▙ Votre activité
            </h3>
            <Chips statuts={FREELANCE} label="Tous les statuts freelance" />
          </div>
          <div className="space-y-4">
            <SliderField
              label="TJM (taux journalier HT)"
              value={input.tjm}
              onChange={(v) => set("tjm", v)}
              min={150}
              max={1500}
              step={10}
              unit="€/j"
            />
            <div className="grid grid-cols-2 gap-3">
              <SliderField
                label="Jours facturés / mois"
                value={input.joursParMois}
                onChange={(v) => set("joursParMois", v)}
                min={5}
                max={22}
                unit="j"
              />
              <SliderField
                label="Mois facturés / an"
                value={input.moisFactures}
                onChange={(v) => set("moisFactures", v)}
                min={6}
                max={12}
                unit="mois"
              />
            </div>
            <NumberField
              label="Frais professionnels / an"
              value={input.fraisPro}
              onChange={(v) => set("fraisPro", v)}
              step={500}
              suffix="€"
            />
            <div className="border-2 border-ink bg-tag-offwhite px-3 py-2 text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.06em] opacity-70">
                {"CA annuel — "}
              </span>
              <span className="text-lg font-extrabold">
                {euro(caAnnuel(input))}
              </span>
            </div>
          </div>
        </Impact>

        <Impact statuts={TOUS} focus={focus}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.12em]">
              ▙ Votre foyer fiscal
            </h3>
            <Chips statuts={TOUS} label="Tous les statuts" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Situation"
                value={input.situation}
                onChange={(v) => set("situation", v)}
                options={[
                  { value: "celibataire", label: "Célibataire" },
                  { value: "couple", label: "Marié·e / pacsé·e" },
                ]}
              />
              <NumberField
                label="Enfants à charge"
                value={input.enfants}
                onChange={(v) => set("enfants", Math.max(0, Math.round(v)))}
                max={10}
              />
            </div>
            {input.situation === "couple" && (
              <NumberField
                label="Revenu net imposable du conjoint / an"
                value={input.revenuConjoint}
                onChange={(v) => set("revenuConjoint", v)}
                step={1000}
                suffix="€"
              />
            )}
          </div>
        </Impact>

        <Group
          title="▙ Salarié de comparaison"
          statuts={["cdi"]}
          headerColor={STATUT_COLORS.cdi}
          headerText={TEXT_ON.cdi}
          focus={focus}
          defaultOpen
        >
          <SelectField
            label="Statut"
            value={input.statutSalarie}
            onChange={(v) => set("statutSalarie", v)}
            options={[
              { value: "cadre", label: "CDI cadre" },
              { value: "non-cadre", label: "CDI non-cadre" },
              { value: "fonctionnaire", label: "Fonctionnaire (titulaire)" },
            ]}
          />
          <SliderField
            label={
              input.statutSalarie === "fonctionnaire"
                ? "Traitement brut annuel (primes incluses)"
                : "Salaire brut annuel"
            }
            value={input.cdiBrutAnnuel}
            onChange={(v) => set("cdiBrutAnnuel", v)}
            min={25000}
            max={150000}
            step={1000}
            unit="€/an"
          />
          {input.statutSalarie === "fonctionnaire" && (
            <SliderField
              label="Part de primes/indemnités dans le brut"
              value={Math.round(input.partPrimes * 100)}
              onChange={(v) => set("partPrimes", v / 100)}
              min={0}
              max={50}
              step={1}
              unit="%"
            />
          )}
          <Toggle
            label="Saisir mon taux de prélèvement à la source"
            hint="Le taux affiché sur votre fiche de paie — sinon, estimation au barème 2026 du foyer"
            checked={input.pasManuel}
            onChange={(v) => set("pasManuel", v)}
          />
          {input.pasManuel && (
            <SliderField
              label="Taux de prélèvement à la source"
              value={Math.round(input.tauxPas * 1000) / 10}
              onChange={(v) => set("tauxPas", v / 100)}
              min={0}
              max={43}
              step={0.1}
              unit="%"
            />
          )}
        </Group>

        <Group
          title="▙ Micro-entreprise"
          statuts={["micro"]}
          headerColor={STATUT_COLORS.micro}
          headerText={TEXT_ON.micro}
          focus={focus}
        >
          <SelectField
            label="Nature de l'activité"
            value={input.activite}
            onChange={(v) => set("activite", v)}
            options={[
              { value: "bnc", label: "Libérale / conseil (BNC, abatt. 34 %)" },
              { value: "bic-service", label: "Services commerciaux (BIC, 50 %)" },
              { value: "bic-vente", label: "Vente de marchandises (BIC, 71 %)" },
            ]}
          />
          {input.activite === "bnc" && (
            <SelectField
              label="Caisse de retraite (BNC)"
              value={input.caisse}
              onChange={(v) => set("caisse", v)}
              options={[
                { value: "regime-general", label: "Régime général (25,6 %)" },
                { value: "cipav", label: "CIPAV (23,1 %)" },
              ]}
            />
          )}
          <Toggle
            label="ACRE (1ʳᵉ année)"
            hint="Exonération partielle des cotisations la première année"
            checked={input.acre}
            onChange={(v) => set("acre", v)}
          />
          <Toggle
            label="Versement libératoire"
            hint="IR payé en % du CA avec les cotisations (sous condition de revenu)"
            checked={input.versementLiberatoire}
            onChange={(v) => set("versementLiberatoire", v)}
          />
        </Group>

        <Group
          title="▙ Société (EURL / SASU)"
          statuts={["eurl", "sasu"]}
          headerColor={STATUT_COLORS.eurl}
          headerText={TEXT_ON.eurl}
          focus={focus}
        >
          <SliderField
            label="Part en rémunération (vs dividendes)"
            value={Math.round(input.partRemuneration * 100)}
            onChange={(v) => set("partRemuneration", v / 100)}
            min={0}
            max={100}
            step={5}
            unit="% rému"
          />
          <Impact statuts={["eurl"]} focus={focus} leaveTo={["eurl", "sasu"]}>
            <div className="mb-1 flex justify-end">
              <Chips statuts={["eurl"]} />
            </div>
            <NumberField
              label="Capital social"
              value={input.capitalSocial}
              onChange={(v) => set("capitalSocial", v)}
              step={500}
              suffix="€"
            />
          </Impact>
        </Group>
      </div>
    </Card>
  );
}

export function AdvancedParams({
  params,
  setParams,
  defaults,
}: {
  params: FiscalParams;
  setParams: (p: FiscalParams) => void;
  defaults: FiscalParams;
}) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof FiscalParams>(k: K, v: FiscalParams[K]) =>
    setParams({ ...params, [k]: v });

  const pct = (label: string, key: keyof FiscalParams, max = 100) => (
    <SliderField
      key={key}
      label={label}
      value={Math.round((params[key] as number) * 1000) / 10}
      onChange={(v) => set(key, (v / 100) as FiscalParams[typeof key])}
      min={0}
      max={max}
      step={0.1}
      unit="%"
    />
  );

  return (
    <Card className="p-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="brutal-press flex w-full items-center justify-between border-2 border-ink bg-ink px-3 py-2 text-left text-xs font-extrabold uppercase tracking-[0.06em] text-white shadow-brutal-sm"
      >
        <span>⚙ Paramètres avancés (taux 2026 modifiables)</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="anim-up mt-4 space-y-4">
          <p className="text-xs opacity-70">
            Tous les taux ci-dessous sont les valeurs officielles/usuelles 2026.
            Ajustez-les si votre situation diffère (convention, société de
            portage, mutuelle…).
          </p>
          {pct("Flat tax (PFU) sur dividendes", "flatTax", 50)}
          {pct("Frais de gestion portage", "portageFraisGestion", 20)}
          {pct("Charges patronales portage", "portagePatronales", 60)}
          {pct("Charges salariales portage", "portageSalariales", 35)}
          {pct("Charges patronales SASU", "sasuPatronales", 60)}
          {pct("Charges salariales SASU", "sasuSalariales", 35)}
          {pct("Charges patronales CDI", "cdiPatronales", 60)}
          {pct("CSG + CRDS salarié", "salCsgCrds", 15)}
          {pct("Pension civile (fonctionnaire)", "fonctPensionCivile", 20)}
          {pct("Abattement assiette TNS (réforme 2026)", "tnsAbattementAssiette", 40)}
          {pct("IS taux réduit", "isTauxReduit", 30)}
          {pct("IS taux normal", "isTauxNormal", 40)}
          <NumberField
            label="Seuil IS taux réduit"
            value={params.isSeuilTauxReduit}
            onChange={(v) => set("isSeuilTauxReduit", v)}
            step={500}
            suffix="€"
          />
          {pct("ACRE : part exonérée", "acreReduction", 100)}
          <button
            type="button"
            onClick={() => setParams(defaults)}
            className="brutal-press w-full border-2 border-ink bg-secondary px-3 py-2 text-xs font-extrabold uppercase tracking-[0.06em] text-white shadow-brutal-sm"
          >
            ↺ Réinitialiser les taux 2026
          </button>
        </div>
      )}
    </Card>
  );
}
