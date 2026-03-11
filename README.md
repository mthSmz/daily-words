# Daily Words

Projet Next.js (App Router) qui :
1. Récupère des titres RSS de médias français.
2. Extrait 5 mots-clés dominants.
3. Génère un poème quotidien (Vodak Engine) via OpenAI, avec fallback local.
4. Publie le poème du jour à heure fixe (15:00 Europe/Paris).

## Stack
- Next.js 14
- Vercel KV (`@vercel/kv`)
- OpenAI SDK (`openai`)
- RSS parsing (`fast-xml-parser`)

## Fonctionnement

### Endpoints
- `GET /api/cron`
  - Récupère les RSS et stocke les 5 mots du jour en KV (`latest` + `daily:YYYY-MM-DD`).
  - Autorisation :
    - appel Vercel Cron (`x-vercel-cron: 1`) **ou**
    - token manuel `?token=...` / `Authorization: Bearer ...` si `CRON_TOKEN` est défini.

- `GET /api/poem`
  - Utilise une date de publication basée sur `Europe/Paris` (avant 15h => poème de la veille).
  - Renvoie le poème déjà stocké (`poem:YYYY-MM-DD`) si présent.
  - Sinon, génère un nouveau poème (OpenAI puis fallback local), le stocke et le retourne.

### Crons Vercel
`vercel.json` configure 2 jobs (UTC) :
- `13:00 UTC` → `/api/cron` (collecte mots)
- `13:05 UTC` → `/api/poem` (génération poème)

> Note: Vercel Cron est en UTC. `13:00 UTC` correspond à `15:00` en été (CEST) et `14:00` en hiver (CET). Ajuster les schedules selon votre besoin métier strict.

## Variables d'environnement (Vercel)

### Obligatoires
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

> Le plus simple est de créer/attacher une base Vercel KV au projet : Vercel injecte ces variables automatiquement.

### Recommandées
- `OPENAI_API_KEY` : clé API OpenAI pour la génération IA.
- `OPENAI_MODEL` : optionnel, défaut `gpt-4o-mini`.
- `CRON_TOKEN` : optionnel mais conseillé pour sécuriser les appels manuels à `/api/cron`.
- `SYSTEM_PROMPT` : optionnel pour surcharger le prompt Vodak Engine sans redéployer.
- `CMC_PRO_API_KEY` : optionnel, fallback Fear/Greed CoinMarketCap Pro.

## Setup local

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Vérification rapide en prod
1. Appeler `GET /api/cron?token=...` (si `CRON_TOKEN` activé).
2. Appeler `GET /api/poem`.
3. Vérifier en KV les clés :
   - `latest`
   - `daily:YYYY-MM-DD`
   - `poem:YYYY-MM-DD`

## Symptôme "poème figé"
Si vous voyez toujours un poème fallback/ancien :
- vérifier que KV est bien attaché,
- vérifier `OPENAI_API_KEY` (sinon fallback local, mais il doit tout de même changer chaque jour),
- vérifier l'exécution de Cron Vercel,
- vérifier que `/api/cron` ne renvoie pas `401`.
