# Weekly Claude check

Run every Monday from the Claude conversation that has push access to this repo. A reminder is scheduled there and re-schedules itself each week.

## 1. Get the latest
Pull or clone `MoveBeyondFPTP/lounge-finder` (branch `main`). Read `watcher/changes.json` (`pending`), `watcher/state.json`, `watcher/airport_scan.json` (`summary`) and `rules.json` (`meta.updatedAt`, each network's `verified`).

## 2. Pick the mode
- **Full:** today is the 1st–7th of the month, or `meta.updatedAt` is more than 35 days old.
- **Quick:** any other Monday.
- **Quick with nothing pending:** post a one-line note ("Weekly check: nothing changed"), schedule next week, and stop. Don't research or commit.

## 3. Research
- **Quick:** for each pending entry, decide whether it's a real change or page noise. Research only the networks behind real or unclear changes (`*guests` means every network's `guestPolicies`). Use the entry's url first, then official sources.
- **Airport-website finds** (`source: "airport-site"`): confirm each lounge is real and current and fill in its location. Then set `source` to `airport-site-verified`, or remove the entry if it's wrong.
- **Priority Pass entries** with the location "See the Priority Pass app for the location": fill in the name and location.
- **Full:** also research every network, every source the watcher marked `blocked` or `unreadable` (United's page needs this every month), and each network's `unverified` list.

What to check for each network: who gets in, entry windows and layovers, arrivals access, guest rules and fees by age (infants, immediate family), visit limits, spend thresholds, what to bring, and lounge locations, openings and closures. Prefer official pages, then reputable travel news and The Points Party directory.

## 4. Update `rules.json`
- Change only what sources support, and never invent card ids, network keys, route keys or field names.
- Update `verified`, `unverified` and `sources` (at most 4, https only) for each network you researched.
- Put upcoming changes in `notices`. Things the app can't express go in `notices` and in `meta.needsAppUpdate`, for a developer.
- If anything changed, set `meta.updatedAt`, `updatedBy: "Weekly research"`, and add one changelog line written for the traveler (keep 30). Full mode with no changes still adds "Checked all networks and airports; no changes".
- Validate the JSON, then set `watcher/changes.json` `pending` to `[]`.

## 5. Publish
- Commit only `rules.json` and `watcher/changes.json` and push to `main`. If the push is rejected, pull with rebase first.
- If `rules.json` changed, also write it to the Claude-hosted copy: ArtifactData `set` on `rules/current` of https://claude.ai/artifact/AuQm6Jfgb2WL9TP51Ga5fx, pinned to the current version.
- Post a short summary for the traveler. Schedule next Monday's reminder for 6:32 AM America/Denver.
