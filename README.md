# Accepted-horses mock

A stand-in for the carnival portal's `GET /api/accepted-horses`, the feed the
backend's `DrcSync` reads (`DrcCarnivalApiClient`). Same envelope as the real
API:

```json
{ "status": "success", "count": 20, "data": [ { "referenceno": "DWC2026/001", "Horse_Id": "1", "...": "..." } ] }
```

## Run

```bash
npm install
npm start                      # http://localhost:3001/api/accepted-horses
```

| Variable       | Default | What it does |
|----------------|---------|--------------|
| `PORT`         | `3001`  | Port to listen on. |
| `MOCK_API_KEY` | unset   | When set, requests must send it in `X-API-Key` (401 otherwise). |
| `MOCK_GROW`    | `5`     | Horses added per request. `0` keeps the feed fixed. |

PowerShell: `$env:MOCK_API_KEY='dev'; npm start`.

## Data

- `db.json` holds 20 fixed horses: ids, references (`DWC2026/001…`) and race
  numbers from 1, `Trainer` and `Agent` submitters, and Japan / Hong Kong / UAE
  among the countries.
- Each request then adds `MOCK_GROW` generated horses (`generate.js`), with ids
  carrying on from 21. A generated horse is seeded by its `Horse_Id`, so an id
  is the same horse on every request and after a restart.
- `?count=N` returns exactly N horses and does not grow the feed.
- The size is held in memory, so a restart starts again at 20.
- Only Japan and Hong Kong horses are submitted by an `Agent` (with a
  `Nominee_Name`). Horses from every other country are submitted by their
  `Trainer`.
- Every row is `horsestatus` 1 (Invite) and `Invitation_Status` 2 (Accepted).
- Countries are names (`UAE`, `Japan`, `Hong Kong`, …). The backend matches
  them against Country Master by exact name; a name it does not hold is left
  blank, with a warning in the sync summary.
- Anything other than GET is refused (405).

## Point the backend at it

In `Webotix.Drc.WebApi`:

```bash
dotnet user-secrets set "DubaiRacingClub:AcceptedHorsesEndpoint" "http://localhost:3001/api/accepted-horses"
dotnet user-secrets set "DubaiRacingClub:ApiKey" "dev"
```

`ApiKey` must be non-empty, or the client refuses to sync. It must also match
`MOCK_API_KEY` when that is set. Restart the API, then run "Fetch from nomination
portal" (`POST /api/v1/DrcSync`); an active or upcoming season has to exist.

To go back to the real feed, run
`dotnet user-secrets remove "DubaiRacingClub:AcceptedHorsesEndpoint"`.

A shared server (e.g. the test API) can only use this if the mock is reachable
from it. Run the mock on that machine, or host it somewhere public.
