# Analiză Tehnică și Calitativă a Companiilor Listate la Bursă

Proiect educațional (curs de vibecoding). Specificațiile complete de arhitectură și decizii de produs sunt în [`SPECIFICATII.md`](./SPECIFICATII.md).

## Stack

- Frontend: Next.js (TypeScript) + Tailwind + `lightweight-charts`
- Backend: Python (Flask), deployat ca funcție serverless pe Vercel (`api/analyze.py`)
- Date: [`yfinance`](https://pypi.org/project/yfinance/) — gratuit, fără cheie API
- Persistență: doar `localStorage` în browser (fără bază de date)

## Rulare locală

Instalează dependențele Node:

```bash
npm install
```

Instalează dependențele Python (recomandat într-un virtualenv):

```bash
pip install -r api/requirements.txt
```

Pornește ambele servere (Next.js pe portul 3000 + Flask pe portul 5328, cu proxy automat între ele):

```bash
npm run dev
```

Deschide [http://localhost:3000](http://localhost:3000).

## Deploy

Repo-ul se conectează la [Vercel](https://vercel.com) (free tier) — la fiecare push pe `main`, Vercel construiește automat atât frontend-ul Next.js, cât și funcția Python din `api/analyze.py`.

## Disclaimer

Semnalele tehnice și verdictele calitative generate de aplicație sunt algoritmice, în scop educațional. **Nu constituie recomandare de investiții.**
