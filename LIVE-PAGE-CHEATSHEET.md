# Cheat sheet: update the live site (GitHub → GitHub Pages)

Use this when you add, remove, or replace **pictures** or **videos**, or change any other project files you want on the public site.

---

## 1. Know which branch goes live

- Your work often lives on a branch such as **`Loreine-portfolio-pages-and-psst-gallery`**.
- **GitHub Pages** is usually set to either **`main`** or a **feature branch**.  
  **Check:** GitHub repo → **Settings** → **Pages** → **Branch** (and folder, if any).
- If Pages builds from **`main`**, you need to **merge** your working branch into `main` after you push (Pull Request → Merge, or merge locally and push `main`).

---

## 2. General push (any file change)

In **PowerShell**, from your project folder (example: `C:\Loreine-Portfolio`):

```powershell
cd C:\Loreine-Portfolio
git status
```

Stage what you want in this update:

```powershell
git add path\to\file
```

Or stage everything that changed:

```powershell
git add -A
```

Commit with a short message:

```powershell
git commit -m "Describe what you changed"
```

Push your current branch:

```powershell
git push
```

First time pushing a **new** branch:

```powershell
git push -u origin your-branch-name
```

---

## 3. Pictures / videos used elsewhere on the site (not PSST gallery)

Examples: hero image, About photo, icons under `assets\`, paths in `index.html`, `about.html`, `css\styles.css`.

1. Add, delete, or replace files under **`assets\`** (or the path your HTML/CSS uses).
2. If you **rename** or **remove** a file, update the matching **`src=`** or **`url(...)`** in HTML/CSS.
3. Run **§2** so those files and edits are committed and pushed.

---

## 4. PSST gallery (pictures & videos on PSST pages)

**Folders**

| What        | Folder                         |
|------------|---------------------------------|
| PSST photos | `assets\psst\images\`          |
| PSST videos | `assets\psst\videos\`          |

Supported types (from the generator script): common image extensions (e.g. `.jpg`, `.png`) and video (e.g. `.mp4`, `.webm`, `.mov`).

**Manifest (required after folder changes)**

The gallery reads **`assets\psst\media.json`** (and **`media.js`**, which mirrors it). After you add or delete files in those folders, **regenerate** both from the project root:

```powershell
cd C:\Loreine-Portfolio
powershell -ExecutionPolicy Bypass -File .\scripts\generate-psst-media-json.ps1
```

Then stage and push the **media files** too (and any new/deleted binaries):

```powershell
git add assets\psst\images assets\psst\videos assets\psst\media.json assets\psst\media.js
git status
git commit -m "Update PSST gallery media"
git push
```

**Remove a photo or video:** delete the file from `images\` or `videos\`, run the script above, commit, push.

---

## 5. After you push

1. If your live site uses **`main`**, complete the **merge** to `main` (GitHub PR or local merge + `git push origin main`).
2. Wait **1–2 minutes** (sometimes longer) for GitHub Pages to rebuild.
3. Open your live URL and do a **hard refresh** (**Ctrl+F5**) or use a **private window** so you are not seeing an old cached CSS or image.

---

## 6. Quick checks if something looks wrong

| Issue | What to try |
|--------|-------------|
| Old image still shows | Hard refresh, private window, or wait for Pages deploy to finish. |
| PSST page empty / errors | Confirm you ran `generate-psst-media-json.ps1` and committed `media.json` + `media.js`. |
| Gallery works on live but not on disk | Open the site via a **local server** (not `file://`) when testing; see error text in `js\psst-*.js` if applicable. |

---

## 7. One-line reminder

**Change files → (PSST: run script) → `git add` → `git commit` → `git push` → merge to Pages branch if needed → hard-refresh the live site.**
