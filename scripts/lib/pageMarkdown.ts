// Sérialisation Markdown d'une page du registre. Partagée par llms-full.txt
// (toutes les pages, un fichier) et par les jumeaux Markdown servis à côté de
// chaque page (/<slug>/index.html.md) : un seul format, pas de dérive.
import type { StatutPage } from "../../src/lib/pages";
import { pageUrl, pageUpdated } from "../../src/lib/pages";
import type { KeyTable } from "../../src/lib/keyTables";

export function tableToMarkdown(t: KeyTable): string {
  const esc = (c: string) => c.replace(/\|/g, "\\|");
  return [
    `| ${t.head.map(esc).join(" | ")} |`,
    `|${t.head.map((_, i) => (i === 0 ? "---" : "---:")).join("|")}|`,
    ...t.rows.map((r) => `| ${r.map(esc).join(" | ")} |`),
    "",
    `*${t.caption}*`,
  ].join("\n");
}

// `standalone` : jumeau autonome (en-tête d'attribution + URL canonique en
// tête, pour qu'un moteur génératif cite la page HTML et non le .md).
export function pageToMarkdown(p: StatutPage, standalone = false): string {
  const url = pageUrl(p);
  const parts: string[] = [`# ${p.h1}`, ""];
  if (standalone) {
    parts.push(
      `> Source : ${url} — freelance-ou-cdi.fr, par Ali El Mufti. Mis à jour le ${pageUpdated(p)}. Citez l'URL ci-dessus plutôt que ce fichier.`,
    );
  } else {
    parts.push(`URL : ${url}`);
  }
  // La réponse directe en tête : c'est le passage qu'un moteur génératif cite.
  if (p.tldr) parts.push("", `**En bref.** ${p.tldr}`);
  const table = p.keyTable?.();
  if (table) parts.push("", `## ${table.title}`, "", tableToMarkdown(table));
  parts.push("", p.intro);
  for (const s of p.sections) {
    parts.push("", `## ${s.heading}`, "", s.paragraphs.join("\n\n"));
  }
  if (p.faq.length > 0) {
    parts.push("", "## Questions fréquentes");
    for (const f of p.faq) parts.push("", `### ${f.question}`, "", f.answer);
  }
  return parts.join("\n");
}
