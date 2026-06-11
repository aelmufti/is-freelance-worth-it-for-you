import { useState } from "react";
import type { FiscalParams, SimulationInput } from "../lib/params";
import { caAnnuel } from "../lib/params";
import {
  Card,
  NumberField,
  SelectField,
  SliderField,
  Toggle,
  euro,
} from "./ui";

export function MainForm({
  input,
  setInput,
}: {
  input: SimulationInput;
  setInput: (i: SimulationInput) => void;
}) {
  const set = <K extends keyof SimulationInput>(k: K, v: SimulationInput[K]) =>
    setInput({ ...input, [k]: v });

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.12em]">
        ▙ Votre activité
      </h3>
      <div className="space-y-4">
        <SliderField
          label="TJM (taux journalier HT)"
          value={input.tjm}
          onChange={(v) => set("tjm", v)}
          min={150}
          max={1500}
          step={10}
          format={(v) => `${v} €/j`}
        />
        <div className="grid grid-cols-2 gap-3">
          <SliderField
            label="Jours facturés / mois"
            value={input.joursParMois}
            onChange={(v) => set("joursParMois", v)}
            min={5}
            max={22}
            format={(v) => `${v} j`}
          />
          <SliderField
            label="Mois facturés / an"
            value={input.moisFactures}
            onChange={(v) => set("moisFactures", v)}
            min={6}
            max={12}
            format={(v) => `${v} mois`}
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
            CA annuel —{" "}
          </span>
          <span className="text-lg font-extrabold">{euro(caAnnuel(input))}</span>
        </div>

        <h3 className="pt-2 text-sm font-extrabold uppercase tracking-[0.12em]">
          ▙ Votre foyer fiscal
        </h3>
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

        <h3 className="pt-2 text-sm font-extrabold uppercase tracking-[0.12em]">
          ▙ CDI de comparaison
        </h3>
        <SliderField
          label="Salaire brut annuel (CDI)"
          value={input.cdiBrutAnnuel}
          onChange={(v) => set("cdiBrutAnnuel", v)}
          min={25000}
          max={150000}
          step={1000}
          format={(v) => euro(v)}
        />

        <h3 className="pt-2 text-sm font-extrabold uppercase tracking-[0.12em]">
          ▙ Options
        </h3>
        <SelectField
          label="Nature de l'activité (micro)"
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
          hint="Exonération partielle des cotisations micro la première année"
          checked={input.acre}
          onChange={(v) => set("acre", v)}
        />
        <Toggle
          label="Versement libératoire (micro)"
          hint="IR payé en % du CA avec les cotisations (sous condition de revenu)"
          checked={input.versementLiberatoire}
          onChange={(v) => set("versementLiberatoire", v)}
        />
        <SliderField
          label="EURL / SASU : part en rémunération"
          value={Math.round(input.partRemuneration * 100)}
          onChange={(v) => set("partRemuneration", v / 100)}
          min={0}
          max={100}
          step={5}
          format={(v) => `${v} % rému / ${100 - v} % dividendes`}
        />
        <NumberField
          label="Capital social EURL"
          value={input.capitalSocial}
          onChange={(v) => set("capitalSocial", v)}
          step={500}
          suffix="€"
        />
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
      format={(v) => `${v.toFixed(1).replace(".", ",")} %`}
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
          {pct("Charges salariales CDI (cadre)", "cdiSalariales", 35)}
          {pct("Charges patronales CDI", "cdiPatronales", 60)}
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
