# Loreine Portfolio

Static portfolio website with a PSST media gallery.

## GitHub Pages Emergency Checklist

Use this whenever the live page shows `404` or does not update.

### 5 Commands (PowerShell in `C:\Loreine-Portfolio`)

If media changed, run generator first:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\generate-psst-media-json.ps1"
```

Then run:

```powershell
git status
git add -A
git commit -m "Quick site update"
git push
```

### 4 Clicks (GitHub Pages reset)

1. Repo -> **Settings** -> **Pages**
2. Change Folder from `/ (root)` to `/docs`
3. Click **Save**
4. Change Folder back to `/ (root)` and **Save** again

Wait 2-5 minutes, hard refresh (`Ctrl+F5`), then open:

- `https://software-me.github.io/Loreine-Portfolio/`

### If push fails (quick fallback)

```powershell
git stash push -u -m "temp-fix"
git pull --rebase origin "Loreine-portfolio-pages-and-psst-gallery"
git push
git stash pop
```
