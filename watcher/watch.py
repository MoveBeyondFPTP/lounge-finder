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
NOISE = re.compile(r"^(share|tweet|advertis|sign up|subscribe|related|read more|comments?|cookie|©|copyright)\b|^\d+\s+(min|minutes|hours?|days?)\s+ago$", re.I)
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
        ln = re.sub(r"\s+", " ", ln).strip()
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
            diff = [d for d in difflib.unified_diff(old.splitlines(), lines, lineterm="", n=0) if d[:1] in "+-" and d[:3] not in ("+++","---")]
            added = [d[1:] for d in diff if d.startswith("+")][:40]
            removed = [d[1:] for d in diff if d.startswith("-")][:40]
            if added or removed:
                changes["pending"].append({"source": sid, "networks": s["networks"], "url": url, "detected": now, "added": added, "removed": removed})
                st["lastChanged"] = now
                report.append(f"- {sid}: CHANGED (+{len(added)} / -{len(removed)} lines)")
        else:
            report.append(f"- {sid}: no change")
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
