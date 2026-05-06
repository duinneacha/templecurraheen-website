"""Find grave codes with no associated photo and write to Excel."""
import csv
import os
from collections import OrderedDict
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

ROOT = os.path.join(os.path.dirname(__file__), "..")
CSV_PATH = os.path.join(ROOT, "assets", "list", "templecurraheen_stones_and_registers.csv")
GRAVES_DIR = os.path.join(ROOT, "assets", "imgs", "graves")
OUT_PATH = os.path.join(ROOT, "assets", "list", "graves_missing_photos.xlsx")


def main():
    # Build a case-insensitive set of available photo filenames
    available = {f.lower() for f in os.listdir(GRAVES_DIR) if os.path.isfile(os.path.join(GRAVES_DIR, f))}

    # Group rows by grave_code so we report one row per grave (even if many burials share it)
    graves = OrderedDict()
    with open(CSV_PATH, "r", encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            code = (row.get("grave_code") or "").strip()
            row_code = (row.get("row_code") or "").strip()
            plot_code = (row.get("plot_code") or "").strip()
            file_name = (row.get("file_name") or "").strip()
            last_name = (row.get("last_name") or "").strip()
            first_name = (row.get("first_name") or "").strip()
            full_name = " ".join(p for p in (first_name, last_name) if p).strip()

            key = (row_code, code, plot_code)
            entry = graves.setdefault(key, {
                "row_code": row_code,
                "grave_code": code,
                "plot_code": plot_code,
                "file_names": set(),
                "names": [],
            })
            if file_name:
                entry["file_names"].add(file_name)
            if full_name:
                entry["names"].append(full_name)

    missing = []
    for key, entry in graves.items():
        files = entry["file_names"]
        if not files:
            reason = "No file_name in register"
            listed = ""
        else:
            present = [f for f in files if f.lower() in available]
            if present:
                continue  # at least one referenced photo exists
            reason = "Referenced photo not found on disk"
            listed = "; ".join(sorted(files))
        missing.append({
            "row_code": entry["row_code"],
            "grave_code": entry["grave_code"],
            "plot_code": entry["plot_code"],
            "names": "; ".join(entry["names"]),
            "listed_file_name": listed,
            "reason": reason,
        })

    # Sort: by row_code letter, then numerically by grave_code where possible
    def sort_key(item):
        row = item["row_code"] or "ZZ"
        gc = item["grave_code"]
        try:
            n = int(gc)
        except (TypeError, ValueError):
            n = 10**9
        return (row, n, gc or "")

    missing.sort(key=sort_key)

    wb = Workbook()
    ws = wb.active
    ws.title = "Missing Photos"

    headers = ["Row", "Grave Code", "Plot Code", "Name(s)", "Listed File Name", "Reason"]
    ws.append(headers)
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="4F46E5")
    for cell in ws[1]:
        cell.font = header_font
        cell.fill = header_fill

    for item in missing:
        ws.append([
            item["row_code"],
            item["grave_code"],
            item["plot_code"],
            item["names"],
            item["listed_file_name"],
            item["reason"],
        ])

    widths = [8, 14, 14, 50, 28, 36]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[chr(64 + i)].width = w
    ws.freeze_panes = "A2"

    wb.save(OUT_PATH)

    total_graves = len(graves)
    print(f"Total unique graves in register: {total_graves}")
    print(f"Graves without an associated photo: {len(missing)}")
    print(f"Wrote: {OUT_PATH}")


if __name__ == "__main__":
    main()
