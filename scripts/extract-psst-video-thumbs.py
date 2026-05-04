"""
Extract one JPEG thumbnail per video in assets/psst/videos/ into assets/psst/images/,
using the same base name (e.g. DSC_0685.MOV -> DSC_0685.jpg) for the PSST carousel.

Requires: pip install imageio imageio-ffmpeg pillow
Run from repo root: python scripts/extract-psst-video-thumbs.py
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

def main() -> int:
    root = Path(__file__).resolve().parent.parent
    video_dir = root / "assets" / "psst" / "videos"
    image_dir = root / "assets" / "psst" / "images"
    ap = argparse.ArgumentParser(description="Extract PSST video thumbnails (JPEG).")
    ap.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing matching .jpg files.",
    )
    ap.add_argument(
        "--at",
        dest="at_ratio",
        type=float,
        default=0.08,
        help="Frame position as ratio of total frames (0-1), default 0.08 to skip black intro.",
    )
    args = ap.parse_args()

    try:
        import imageio.v2 as imageio
        from PIL import Image
    except ImportError as e:
        print("Install dependencies: python -m pip install --user imageio imageio-ffmpeg pillow", file=sys.stderr)
        return 1

    exts = {".mov", ".mp4", ".m4v", ".avi", ".webm", ".mkv"}
    image_dir.mkdir(parents=True, exist_ok=True)
    written = 0
    skipped = 0

    for vid_path in sorted(video_dir.iterdir()):
        if not vid_path.is_file():
            continue
        if vid_path.suffix.lower() not in exts:
            continue
        stem = vid_path.stem
        out_path = image_dir / f"{stem}.jpg"
        if out_path.is_file() and not args.force:
            skipped += 1
            continue

        reader = imageio.get_reader(str(vid_path), "ffmpeg")
        try:
            n = reader.count_frames()
            if n < 1:
                print(f"Skip (no frames): {vid_path.name}", file=sys.stderr)
                continue
            r = max(0.0, min(1.0, args.at_ratio))
            idx = min(max(0, int(n * r)), n - 1)
            frame = reader.get_data(idx)
        except Exception as ex:
            print(f"Failed {vid_path.name}: {ex}", file=sys.stderr)
            continue
        finally:
            reader.close()

        img = Image.fromarray(frame)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(out_path, "JPEG", quality=88, optimize=True)
        print(f"Wrote {out_path.relative_to(root)} ({out_path.stat().st_size // 1024} KB)")
        written += 1

    print(f"Done. Written: {written}, skipped (already exists): {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
