"""Controlla le regole di collaborazione di CLAUDE.md (D-020).

Lo lancia il workflow .github/workflows/controllo_regole.yml:
- push su main: ogni commit deve toccare solo team/<nome>/ del suo autore;
- pull request: il branch si chiama <nome>/<argomento>, i commit sono di <nome>
  e non toccano le cartelle team/ degli altri.

Una cartella team/<x>/ che non esisteva ancora si può creare (nuovo membro).
I commit fatti dal sito di GitHub (merge delle PR) non si controllano.
Esce con codice 1 se trova errori.
"""
import os
import re
import subprocess
import sys

ZERO = "0" * 40


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True).stdout.strip()


def exists(sha, path):
    return subprocess.run(["git", "cat-file", "-e", f"{sha}:{path}"],
                          capture_output=True).returncode == 0


def members():
    """Tabella Membri di CLAUDE.md: nome per git -> nome breve.
    Una persona può avere più nomi git, separati da virgola (es. "David, Kod113")."""
    rows = re.findall(r"^\|\s*`([a-z0-9_-]+)`\s*\|\s*([^|]+?)\s*\|", open("CLAUDE.md", encoding="utf-8").read(), re.M)
    return {name.strip(): short for short, names in rows for name in names.split(",")}


def commits(base, head, first_parent=False):
    """Commit normali (no merge, no commit fatti dal sito di GitHub) tra base e head.
    first_parent: segue solo la linea di main, così i commit arrivati con una PR
    (che sono sul branch, non su main) non si contano come fatti su main."""
    out = []
    extra = ["--first-parent"] if first_parent else []
    for line in git("log", *extra, "--no-merges", "--format=%H|%an|%cn", f"{base}..{head}").splitlines():
        sha, author, committer = line.split("|", 2)
        if committer != "GitHub":
            out.append((sha, author))
    return out


def files_of(sha):
    return git("diff-tree", "--no-commit-id", "--name-only", "-r", sha).splitlines()


def team_folder(path):
    parts = path.split("/")
    return parts[1] if len(parts) > 2 and parts[0] == "team" else None


errors = []
who = members()
event = os.environ["EVENT"]

if event == "push":
    before, after = os.environ["BEFORE"], os.environ["AFTER"]
    if before == ZERO or not exists(before, ""):
        before = git("rev-parse", f"{after}^")
    for sha, author in commits(before, after, first_parent=True):
        short = who.get(author)
        if not short:
            errors.append(f"{sha[:7]}: l'autore '{author}' non è nella tabella Membri di CLAUDE.md "
                          f"(controlla `git config user.name` su quel PC)")
            continue
        for f in files_of(sha):
            folder = team_folder(f)
            if folder == short or (folder and not exists(before, f"team/{folder}")):
                continue
            errors.append(f"{sha[:7]} di {short}: `{f}` è fuori da team/{short}/. "
                          f"Su main si committa solo nella propria cartella: per il resto serve branch + pull request")

else:  # pull_request
    base, head, branch = os.environ["BASE"], os.environ["HEAD"], os.environ["BRANCH"]
    base = git("merge-base", base, head)
    prefix = branch.split("/")[0] if "/" in branch else ""
    if prefix not in who.values():
        errors.append(f"Il branch '{branch}' deve chiamarsi <nome>/<argomento>, "
                      f"con <nome> tra: {', '.join(sorted(who.values()))}")
    for sha, author in commits(base, head):
        short = who.get(author)
        if not short:
            errors.append(f"{sha[:7]}: l'autore '{author}' non è nella tabella Membri di CLAUDE.md")
        elif prefix and short != prefix:
            errors.append(f"{sha[:7]}: commit di {short} sul branch di {prefix}")
    for f in git("diff", "--name-only", f"{base}...{head}").splitlines():
        folder = team_folder(f)
        if folder and folder != prefix and exists(base, f"team/{folder}"):
            errors.append(f"`{f}`: è nella cartella di {folder}, gli altri la leggono ma non la modificano")

summary = os.environ.get("GITHUB_STEP_SUMMARY")
lines = ["## Regole di CLAUDE.md", ""]
lines += [f"- ❌ {e}" for e in errors] or ["✅ Tutto in regola."]
if summary:
    with open(summary, "a", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
for e in errors:
    print(f"::error::{e}")
print("\n".join(lines))
sys.exit(1 if errors else 0)
