#!/usr/bin/env python3
"""Lounge Finder source watcher.

Runs daily on GitHub Actions (free for public repos). For each page in
sources.json it downloads the page, keeps only the lines that talk about
lounge access, compares them with the last saved copy, and records any
difference in changes.json. The weekly Claude check reads changes.json and
only researches what changed. Standard library only.
"""
import datetime, difflib, hashlib, html.parser, json, os, re, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SNAP = os.path.join(HERE, "snapshots")
STATE = os.path.join(HERE, "state.json")
CHANGES = os.path.join(HERE, "changes.json")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
KEYWORDS = re.compile(r"lounge|guest|access|card ?member|cardholder|member|status|visit|fee|\$\d|hour|child|infant|under 2|age|terminal|gate|concourse|boarding|departure|arriv|connect|spend|complimentary|priority pass|club|eligible|basic economy|premium|business|first", re.I)
NOISE = re.compile(r"^(share|tweet|advertis|sign up|subscribe|related|read more|comments?|cookie|©|copyright|go to home page|featured image|check your inbox)\b|^\d+\s+(min|minutes|hours?|days?)\s+ago$|compensate us|credit cards can transform|advertising policy|editorial content|not been reviewed, approved|newsletter", re.I)
BLOCK_TAGS = {"p","div","li","tr","td","th","h1","h2","h3","h4","h5","h6","br","section","article","dt","dd","table","ul","ol","header","footer"}
SKIP_TAGS = {"script","style","noscript","svg","iframe","template","nav"}

class Text(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.out=[]; self.skip=0
    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS: self.skip += 1
        elif tag in BLOCK_TAGS: self.out.append("\n")
    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and self.skip: self.skip -= 1
        elif tag in BLOCK_TAGS: self.out.append("\n")
    def handle_data(self, data):
        if not self.skip: self.out.append(data)

def page_lines(raw, keep_all):
    p = Text(); p.feed(raw); p.close()
    lines = []
    for ln in "".join(p.out).split("\n"):
        ln = re.sub(r"\s+", " ", ln.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')).strip()
        if len(ln) < 3 or NOISE.search(ln): continue
        if keep_all or KEYWORDS.search(ln): lines.append(ln)
    out, seen = [], set()
    for ln in lines:               # drop exact repeats (menus, footers)
        if ln not in seen: seen.add(ln); out.append(ln)
    return out

def fetch(url):
    last = None
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.status, r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")
        except Exception as e:
            last = e; time.sleep(5)
    raise last

def load(path, default):
    try:
        with open(path) as f: return json.load(f)
    except Exception: return default


# ---------- Automatic update: which US airports have Priority Pass lounges ----------
NUMWORDS = {"two":2,"three":3,"four":4,"five":5,"six":6,"seven":7,"eight":8,"nine":9,"ten":10}
def parse_pp_us(lines):
    """Return {CODE: number_of_locations} for the 'United States N Airports' section, or None if the page looks different."""
    try:
        start = next(i for i,l in enumerate(lines) if re.fullmatch(r"United States (\d+) Airports?", l))
    except StopIteration:
        return None
    expected = int(re.fullmatch(r"United States (\d+) Airports?", lines[start]).group(1))
    found = {}
    for l in lines[start+1:]:
        if re.fullmatch(r"[A-Z][A-Za-z ]+ \d+ Airports?", l): break      # next region header
        m = re.match(r"([A-Z]{3}) (.+)", l)
        if not m: continue
        n = re.search(r"\b(\d+|two|three|four|five|six|seven|eight|nine|ten) locations\b", l, re.I)
        found[m.group(1)] = (int(n.group(1)) if n.group(1).isdigit() else NUMWORDS[n.group(1).lower()]) if n else 1
    if len(found) != expected or expected < 20:
        return None
    return found

def apply_pp_update(found, today):
    """Add/remove Priority Pass airports in rules.json. Returns a list of plain-English notes, or [] if nothing changed."""
    path = os.path.join(HERE, "..", "rules.json")
    rules = load(path, None)
    if not rules or "lounges" not in rules: return []
    have = {}
    for l in rules["lounges"]:
        if l.get("network") == "prioritypass": have[l["airport"]] = have.get(l["airport"], 0) + 1
    notes, changed = [], False
    for code in sorted(set(have) - set(found)):
        rules["lounges"] = [l for l in rules["lounges"] if not (l.get("network") == "prioritypass" and l["airport"] == code)]
        notes.append(f"{code}: Priority Pass lounge no longer listed, removed"); changed = True
    for code in sorted(set(found) - set(have)):
        for i in range(found[code]):
            rules["lounges"].append({"airport": code, "network": "prioritypass", "location": "See the Priority Pass app for the location", "status": "open", "note": "Newly added by the daily check; details coming in the next weekly update."})
        notes.append(f"{code}: new Priority Pass lounge{'s' if found[code] > 1 else ''} added"); changed = True
    count_diffs = [f"{c}: {have[c]} listed in the app, {found[c]} on the source" for c in sorted(set(have) & set(found)) if have[c] != found[c]]
    pp = rules.get("networks", {}).get("prioritypass", {})
    scanned = set(pp.get("scannedAirports", [])) | set(found)
    if pp.get("venuesChecked") != today or set(pp.get("scannedAirports", [])) != scanned:
        pp["scannedAirports"] = sorted(scanned); pp["venuesChecked"] = today; changed = True
    if notes:
        rules.setdefault("meta", {}).setdefault("changelog", []).insert(0, {"date": today, "text": "Priority Pass lounges updated by the daily check: " + "; ".join(notes) + "."})
        rules["meta"]["changelog"] = rules["meta"]["changelog"][:30]
    if changed:
        with open(path, "w") as f: json.dump(rules, f, ensure_ascii=False, indent=1)
    return notes, count_diffs

def main():
    os.makedirs(SNAP, exist_ok=True)
    sources = load(os.path.join(HERE, "sources.json"), [])
    state = load(STATE, {})
    changes = load(CHANGES, {"pending": []})
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    report = []
    for s in sources:
        sid, url = s["id"], s["url"]
        st = state.get(sid, {})
        st["url"], st["networks"], st["lastChecked"] = url, s["networks"], now
        try:
            code, raw = fetch(url)
            lines = page_lines(raw, s.get("keepAll", False))
            if len(lines) < 8:
                st["status"] = "unreadable"; st["note"] = "Page loaded but had almost no readable text (it may need a full browser). Claude checks it instead."
                report.append(f"- {sid}: unreadable"); state[sid] = st; continue
        except Exception as e:
            st["status"] = "blocked"; st["note"] = f"Could not download: {str(e)[:120]}. Claude checks it instead."
            report.append(f"- {sid}: blocked ({str(e)[:60]})"); state[sid] = st; continue
        text = "\n".join(lines) + "\n"
        digest = hashlib.sha256(text.encode()).hexdigest()[:16]
        snap_path = os.path.join(SNAP, sid + ".txt")
        old = open(snap_path).read() if os.path.exists(snap_path) else None
        st["status"], st["lines"] = "ok", len(lines)
        st.pop("note", None)
        if old is None:
            st["baseline"] = now; report.append(f"- {sid}: first copy saved ({len(lines)} lines)")
        elif st.get("hash") != digest:
            # Compare as sets of lines, so lines that only moved around don't count as a change.
            old_set = set(old.splitlines())
            added = [l for l in lines if l not in old_set][:40]
            new_set = set(lines)
            removed = [l for l in old.splitlines() if l not in new_set][:40]
            if added or removed:
                changes["pending"].append({"source": sid, "networks": s["networks"], "url": url, "detected": now, "added": added, "removed": removed})
                st["lastChanged"] = now
                report.append(f"- {sid}: CHANGED (+{len(added)} / -{len(removed)} lines)")
        else:
            report.append(f"- {sid}: no change")
        if sid == "pp-us-venues":
            found = parse_pp_us(lines)
            if found is None:
                report.append("  (Priority Pass list layout not recognized; left for the weekly check)")
            else:
                notes, count_diffs = apply_pp_update(found, now[:10])
                for n in notes: report.append("  auto-updated: " + n)
                if count_diffs:
                    report.append("  location counts differ: " + "; ".join(count_diffs))
                    if st.get("countDiffs") != count_diffs:
                        changes["pending"].append({"source": sid, "networks": ["prioritypass"], "url": url, "detected": now, "added": ["Location counts differ from the app: " + "; ".join(count_diffs)], "removed": []})
                st["countDiffs"] = count_diffs
        st["hash"] = digest
        with open(snap_path, "w") as f: f.write(text)
        state[sid] = st
    changes["pending"] = changes["pending"][-200:]
    with open(STATE, "w") as f: json.dump(state, f, indent=1, sort_keys=True)
    with open(CHANGES, "w") as f: json.dump(changes, f, indent=1)
    summary = f"### Lounge Finder watcher {now}\n" + "\n".join(report) + f"\n\nPending changes for Claude: {len(changes['pending'])}\n"
    print(summary)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as f: f.write(summary)

if __name__ == "__main__":
    sys.exit(main())
