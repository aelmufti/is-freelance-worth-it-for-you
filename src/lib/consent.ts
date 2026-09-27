// Opposition à la mesure d'audience (Vercel Web Analytics).
//
// La CNIL n'exempte de consentement la mesure d'audience que si le visiteur
// est informé ET peut s'y opposer facilement (lignes directrices « traceurs »,
// précisées le 4 juillet 2025). Deux voies d'opposition :
// - l'interrupteur de la page /confidentialite/ (choix mémorisé localement —
//   un traceur qui conserve un choix relatif aux traceurs est lui-même exempté) ;
// - le signal Global Privacy Control du navigateur, respecté d'office.
//
// Tout accès au stockage est protégé : navigation privée, stockage bloqué ou
// rendu serveur ne doivent jamais faire échouer la page.
const KEY = "fcdi:mesure-audience";

export function gpcActif(): boolean {
  try {
    return (
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true
    );
  } catch {
    return false;
  }
}

export function audienceRefusee(): boolean {
  if (gpcActif()) return true;
  try {
    return localStorage.getItem(KEY) === "refus";
  } catch {
    return false;
  }
}

export function definirRefusAudience(refus: boolean): void {
  try {
    if (refus) localStorage.setItem(KEY, "refus");
    else localStorage.removeItem(KEY);
  } catch {
    // Stockage indisponible : le refus ne pourra pas être mémorisé ; il reste
    // appliqué pour la page en cours (beforeSend relit audienceRefusee()).
  }
}
