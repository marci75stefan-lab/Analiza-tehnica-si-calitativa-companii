const WARNINGS = [
  "Nu investi la bursa daca nu ai deja un fond de siguranta/urgenta (3-6 luni de cheltuieli) pus separat, in afara investitiilor.",
  "Nu investi decat bani pe care iti poti permite sa ii pierzi in totalitate - nu banii de care ai nevoie in curand.",
  "Nu investi cu bani imprumutati sau pe datorie (credite, cardul de credit).",
  "Nu pune toti banii intr-o singura companie sau intr-un singur sector - diversifica.",
  "Nu lua decizii de investitie pe baza de frica, lacomie sau FOMO (teama de a rata o ocazie).",
  "Nu urma \"sfaturi\" de pe retele sociale sau de la persoane fara verificare proprie a informatiei.",
  "Nu ignora orizontul de timp - bursa e potrivita pentru bani de care nu ai nevoie pe termen scurt (ideal 5+ ani).",
  "Nu confunda semnalele algoritmice din aceasta aplicatie cu recomandari de investitii reale - sunt generate educational, fara garantii.",
];

export default function FinancialWarnings() {
  return (
    <details className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
      <summary className="cursor-pointer select-none font-semibold text-amber-900">
        Important!
      </summary>
      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Ce sa NU faci cu banii la bursa
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-4">
          {WARNINGS.map((warning) => (
            <li key={warning} className="text-xs text-amber-900">
              {warning}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
