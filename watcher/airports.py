#!/usr/bin/env python3
"""Nightly airport-website lounge scan for Lounge Finder.

For US airports that aren't in the main lounge directory, visit the airport's
own website (home page plus a few likely pages such as "amenities" or
"shop & dine") and look for well-known lounge names. Lounges found are added to
rules.json, marked as found on the airport's website, and flagged for the weekly
Claude review. Lounges that stop appearing for 3 scans in a row are removed.
Runs free on GitHub Actions. Standard library only.
"""
import concurrent.futures as cf, datetime, json, os, re, sys, time, urllib.parse, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from watch import page_lines, fetch, load, UA

HERE = os.path.dirname(os.path.abspath(__file__))
RULES = os.path.join(HERE, "..", "rules.json")
SITES = os.path.join(HERE, "airport_sites.json")
SCAN = os.path.join(HERE, "airport_scan.json")
CHANGES = os.path.join(HERE, "changes.json")

# Lounge brands the app has rules for. (Priority Pass, Capital One and Chase
# lists are already complete from other sources, so they're not searched here.)
BRANDS = [
    ("skyclub",     "Delta Sky Club",               re.compile(r"\bDelta Sky ?Club\b|\bSky Club\b", re.I)),
    ("united_club", "United Club",                  re.compile(r"\bUnited Club\b(?!\s*(?:card|infinite|business card|℠))", re.I)),
    ("admirals",    "Admirals Club",                re.compile(r"\bAdmirals'? Club\b", re.I)),
    ("alaska",      "Alaska Lounge",                re.compile(r"\bAlaska (?:Airlines )?Lounge\b|\bAlaska Board ?room\b", re.I)),
    ("centurion",   "The Centurion Lounge",         re.compile(r"\bCenturion Lounge\b", re.I)),
    ("amexpartner", "Escape Lounge",                re.compile(r"\bEscape Lounge", re.I)),
    ("amexpartner", "Plaza Premium Lounge",         re.compile(r"\bPlaza Premium\b", re.I)),
    ("starpartner", "Air Canada Maple Leaf Lounge", re.compile(r"\bMaple Leaf Lounge\b", re.I)),
]
WHERE = re.compile(r"\b(?:[Tt]erminal|[Cc]oncourse|[Gg]ate|[Pp]ier|[Ll]evel)\s+(?:[A-Z]{1,2}-?\d{0,3}|\d{1,3}[A-Z]?)\b")
LINK_HINT = re.compile(r"lounge|amenit|shop|dine|dining|services|facilit|terminal|concession|traveler|passenger|at-the-airport|airport-guide|map", re.I)
HREF = re.compile(r'<a\b[^>]*href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', re.I | re.S)
TAGS = re.compile(r"<[^>]+>")

def wikidata_sites(codes):
    """Fill in official websites for airports OurAirports has none for, from Wikidata (IATA code P238, website P856)."""
    found = {}
    codes = sorted(codes)
    for i in range(0, len(codes), 150):
        values = " ".join(f'"{c}"' for c in codes[i:i+150])
        q = f'SELECT ?iata ?site WHERE {{ VALUES ?iata {{ {values} }} ?a wdt:P238 ?iata; wdt:P17 wd:Q30; wdt:P856 ?site. }}'
        url = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(q)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "LoungeFinderAirportScan/1.0 (github.com/MoveBeyondFPTP/lounge-finder)", "Accept": "application/sparql-results+json"})
            with urllib.request.urlopen(req, timeout=60) as r:
                for b in json.load(r)["results"]["bindings"]:
                    found.setdefault(b["iata"]["value"], b["site"]["value"])
        except Exception as e:
            print("Wikidata lookup failed:", e)
        time.sleep(2)
    return found

import ssl
_LOOSE = ssl.create_default_context(); _LOOSE.check_hostname = False; _LOOSE.verify_mode = ssl.CERT_NONE
def fetch(url, _strict=fetch):
    """Like watch.fetch, but retries without certificate checks for sites with broken HTTPS setups (read-only, public pages)."""
    try:
        return _strict(url)
    except Exception as e:
        if "CERTIFICATE" not in str(e).upper() and "SSL" not in str(e).upper(): raise
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9"})
        with urllib.request.urlopen(req, timeout=40, context=_LOOSE) as r:
            return r.status, r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")

def scan_airport(code, site):
    pages, texts = [site], []
    try:
        status, raw = fetch(site)
    except Exception as e:
        return {"status": "blocked", "error": str(e)[:120]}
    texts.append((site, page_lines(raw, True)))
    base = urllib.parse.urlparse(site)
    seen = {site.rstrip("/")}
    cands = []
    for href, label in HREF.findall(raw):
        u = urllib.parse.urljoin(site, href.strip())
        p = urllib.parse.urlparse(u)
        if p.scheme not in ("http", "https") or p.netloc.replace("www.", "") != base.netloc.replace("www.", ""): continue
        if re.search(r"\.(pdf|jpe?g|png|gif|zip|docx?)$", p.path, re.I): continue
        key = u.split("#")[0].rstrip("/")
        if key in seen: continue
        if LINK_HINT.search(href) or LINK_HINT.search(TAGS.sub(" ", label)):
            seen.add(key); cands.append(u)
    cands.sort(key=lambda u: (0 if re.search(r"lounge", u, re.I) else 1 if re.search(r"amenit|dine|shop", u, re.I) else 2))
    for u in cands[:6]:
        try:
            _, r2 = fetch(u); texts.append((u, page_lines(r2, True)))
        except Exception:
            pass
    total_lines = sum(len(t) for _, t in texts)
    if total_lines < 15:
        return {"status": "unreadable", "pages": len(texts)}
    found = {}
    for url, lines in texts:
        for ln in lines:
            for net, name, rx in BRANDS:
                if rx.search(ln) and (net, name) not in found:
                    where = WHERE.findall(ln)
                    found[(net, name)] = {"network": net, "name": name, "evidence": ln[:240], "url": url, "where": ", ".join(dict.fromkeys(w.strip() for w in where))[:80]}
    return {"status": "ok", "pages": len(texts), "found": list(found.values())}

def main():
    rules = load(RULES, None)
    if not rules: print("rules.json missing"); return 1
    major = set(rules.get("airports", {}))
    us = rules.get("usAirports", {})
    sites = load(SITES, {})
    scan = load(SCAN, {"airports": {}})
    changes = load(CHANGES, {"pending": []})
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    today = now[:10]

    targets = sorted(c for c in us if c not in major)
    missing = [c for c in targets if c not in sites]
    # Look up missing websites on Wikidata at most once a week per airport list refresh.
    if missing and scan.get("wikidataChecked", "")[:10] < (datetime.date.today() - datetime.timedelta(days=7)).isoformat():
        extra = wikidata_sites(missing)
        sites.update(extra); scan["wikidataChecked"] = now
        print(f"Wikidata added {len(extra)} airport websites")
        with open(SITES, "w") as f: json.dump(sites, f, indent=0, sort_keys=True)

    todo = [(c, sites[c]) for c in targets if c in sites]
    results = {}
    with cf.ThreadPoolExecutor(max_workers=16) as ex:
        futs = {ex.submit(scan_airport, c, s): c for c, s in todo}
        for fu in cf.as_completed(futs):
            c = futs[fu]
            try: results[c] = fu.result()
            except Exception as e: results[c] = {"status": "error", "error": str(e)[:120]}

    lounges = rules["lounges"]
    added, removed = [], []
    for c, res in sorted(results.items()):
        prev = scan["airports"].get(c, {})
        entry = {"site": sites[c], "checked": now, "status": res["status"]}
        if res["status"] != "ok":
            entry.update({k: v for k, v in res.items() if k in ("error", "pages")})
            entry["misses"] = prev.get("misses", {})
            scan["airports"][c] = entry; continue
        found = {(f["network"], f["name"]): f for f in res["found"]}
        entry["found"] = res["found"]
        misses = dict(prev.get("misses", {}))
        # add new finds
        for (net, name), f in found.items():
            misses.pop(f"{net}|{name}", None)
            exists = any(l["airport"] == c and l["network"] == net and (l.get("name") or "") in ("", name) for l in lounges)
            if not exists:
                lounges.append({"airport": c, "network": net, "name": name, "location": f["where"] or "See the airport's website for the location", "status": "open", "source": "airport-site", "sourceUrl": f["url"], "note": "Found on the airport's website; confirm the details there."})
                added.append({"airport": c, "network": net, "name": name, "evidence": f["evidence"], "url": f["url"]})
        # remove auto-added lounges that disappeared from the site for 3 scans in a row
        for l in [l for l in lounges if l["airport"] == c and l.get("source") == "airport-site"]:
            k = f'{l["network"]}|{l.get("name","")}'
            if (l["network"], l.get("name", "")) in found: continue
            misses[k] = misses.get(k, 0) + 1
            if misses[k] >= 3:
                lounges.remove(l); removed.append(f'{c}: {l.get("name")}'); misses.pop(k)
        entry["misses"] = misses
        scan["airports"][c] = entry

    for a in added:
        rules["airports"].setdefault(a["airport"], us.get(a["airport"], a["airport"]))
    if added or removed:
        parts = [f'{a["airport"]}: {a["name"]}' for a in added]
        txt = []
        if parts: txt.append("Added from airport websites: " + "; ".join(parts))
        if removed: txt.append("No longer listed on airport websites: " + "; ".join(removed))
        rules.setdefault("meta", {}).setdefault("changelog", []).insert(0, {"date": today, "text": ". ".join(txt) + "."})
        rules["meta"]["changelog"] = rules["meta"]["changelog"][:30]
        with open(RULES, "w") as f: json.dump(rules, f, ensure_ascii=False, indent=1)
    if added:
        changes["pending"].append({"source": "airport-websites", "networks": sorted({a["network"] for a in added}), "url": "", "detected": now,
            "added": [f'{a["airport"]} {a["name"]}: "{a["evidence"]}" ({a["url"]})' for a in added][:40], "removed": [],
            "note": "New lounges found on airport websites and added automatically. Check each is real and current, fill in the location, or remove it."})
        changes["pending"] = changes["pending"][-200:]
        with open(CHANGES, "w") as f: json.dump(changes, f, indent=1)

    counts = {}
    for r in results.values(): counts[r["status"]] = counts.get(r["status"], 0) + 1
    scan["lastRun"] = now; scan["summary"] = counts
    with open(SCAN, "w") as f: json.dump(scan, f, indent=1, sort_keys=True)
    summary = f"### Airport website scan {now}\nScanned {len(todo)} of {len(targets)} airports (others have no known website). Results: {counts}\nAdded: {len(added)} lounges. Removed: {len(removed)}.\n" + "".join(f'- {a["airport"]} {a["name"]} ({a["url"]})\n' for a in added)
    print(summary)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as f: f.write(summary)

if __name__ == "__main__":
    sys.exit(main())
