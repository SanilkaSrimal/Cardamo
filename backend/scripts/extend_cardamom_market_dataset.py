"""
Extend cardamom_raw_market_dataset.csv weekly from 2026-04-27 through 2027-04-26.

Method (matches existing source_calibrated_synthetic_recent_dea_anchor style):
- Anchor national LG farm-gate averages from DEA (exagri.info) when available
- Scale to commercial dried levels using the Apr-2026 DEA→dataset calibration ratio
- Spread by historical region / grade relativities
- Drive macros from CPC fuel revisions + CBSL/market USD-LKR path
- Fill Sep-2026 → Apr-2027 with seasonal pattern + mild trend (still tagged as DEA-anchored synthetic)
"""

from __future__ import annotations

import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "market" / "cardamom_raw_market_dataset.csv"
RNG = np.random.default_rng(20260427)

REGION_META = {
    "Kandy": ("Central highland", 900),
    "Matale": ("Central highland", 650),
    "Nuwara Eliya": ("Central highland", 1200),
    "Badulla": ("Uva highland", 750),
    "Ratnapura": ("Sabaragamuwa wet zone", 450),
    "Kegalle": ("Sabaragamuwa wet zone", 500),
}
GRADE_DESC = {
    "LG": "Lanka Green / premium green pods",
    "LLG1": "Lanka Light Green grade 1",
    "LLG2": "Lanka Light Green grade 2",
    "LB": "Lower/brown grade",
}
GRADE_ORDER = ["LG", "LLG1", "LLG2", "LB"]
REGION_ORDER = list(REGION_META.keys())


def season_for_month(m: int) -> str:
    if m in (9, 10, 11, 12, 1):
        return "main_harvest"
    if m in (2, 3):
        return "post_harvest"
    if m == 8:
        return "pre_harvest"
    return "off_season_tight_supply"


def fetch_dea_national(ds: str):
    url = f"http://exagri.info/mkt/2026/{ds}.html"
    try:
        text = urllib.request.urlopen(
            urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}),
            timeout=15,
        ).read().decode("utf-8", "ignore")
    except Exception:
        return None
    # Real section uses <center>CARDAMOM</center>; National cells wrap values in <b>
    start = text.find("<center>CARDAMOM</center>")
    if start < 0:
        return None
    chunk = text[start : start + 30000]
    m = re.search(
        r"<td>\s*(?:<b>)?\s*National\s*(?:</b>)?\s*</td>([\s\S]{0,2000}?)</tr>",
        chunk,
        re.I,
    )
    if not m:
        return None
    cells = re.findall(
        r">\s*(?:<b>)?\s*([0-9,]+\.[0-9]+|-)\s*(?:</b>)?\s*<",
        m.group(1),
    )
    cells = [c.strip() for c in cells if c.strip()]

    def f(x):
        if x == "-":
            return np.nan
        return float(x.replace(",", ""))

    vals = [f(c) for c in cells[:10]]
    # LG high, LG avg, LLG1 high, LLG1 avg, LLG2 high, LLG2 avg, LB high, LB avg
    while len(vals) < 8:
        vals.append(np.nan)
    return {
        "date": pd.to_datetime(ds, format="%d.%m.%Y"),
        "lg_avg": vals[1],
        "llg1_avg": vals[3],
        "llg2_avg": vals[5],
        "lb_avg": vals[7],
        "lg_high": vals[0],
    }


def collect_dea_anchors() -> pd.DataFrame:
    # Known/likely Tuesday collections Mar–Aug 2026
    dates = [
        "03.03.2026",
        "10.03.2026",
        "17.03.2026",
        "24.03.2026",
        "31.03.2026",
        "07.04.2026",
        "21.04.2026",
        "28.04.2026",
        "05.05.2026",
        "12.05.2026",
        "19.05.2026",
        "26.05.2026",
        "02.06.2026",
        "09.06.2026",
        "16.06.2026",
        "30.06.2026",
        "07.07.2026",
        "14.07.2026",
        "21.07.2026",
        "28.07.2026",
        "04.08.2026",
        "11.08.2026",
        "18.08.2026",
    ]
    # Manual fallbacks from fetched pages (used if scrape parse fails)
    manual = {
        "03.03.2026": 12083.33,
        "17.03.2026": 11833.33,
        "24.03.2026": 11000.00,
        "31.03.2026": 12500.00,
        "07.04.2026": 13250.00,
        "21.04.2026": 13250.00,
        "26.05.2026": 13000.00,
        "30.06.2026": 13166.50,
        "28.07.2026": 13000.00,
        "04.08.2026": 15000.00,
    }
    rows = []
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(fetch_dea_national, d): d for d in dates}
        for fut in as_completed(futs):
            ds = futs[fut]
            got = fut.result()
            if got and pd.notna(got["lg_avg"]):
                rows.append(got)
            elif ds in manual:
                rows.append(
                    {
                        "date": pd.to_datetime(ds, format="%d.%m.%Y"),
                        "lg_avg": manual[ds],
                        "llg1_avg": np.nan,
                        "llg2_avg": np.nan,
                        "lb_avg": np.nan,
                        "lg_high": np.nan,
                    }
                )
    # Ensure manuals present
    have = {r["date"] for r in rows}
    for ds, v in manual.items():
        dt = pd.to_datetime(ds, format="%d.%m.%Y")
        if dt not in have:
            rows.append(
                {
                    "date": dt,
                    "lg_avg": v,
                    "llg1_avg": np.nan,
                    "llg2_avg": np.nan,
                    "lb_avg": np.nan,
                    "lg_high": np.nan,
                }
            )
    df = pd.DataFrame(rows).drop_duplicates("date").sort_values("date")
    # Drop sparse-report outliers (e.g. 2026-08-11 national LG avg 6750 vs ~15k peers)
    df = df[df["lg_avg"].isna() | (df["lg_avg"] >= 10000)].reset_index(drop=True)
    return df


def diesel_path(d: pd.Timestamp) -> float:
    # CPC revisions (auto diesel LKR/L), with small weekly noise later applied
    # Mar 22 / Apr 1: 382; May 3: 392; May 31: 407; Jun 30: 382; hold through Aug+
    if d < pd.Timestamp("2026-05-03"):
        return 382.0
    if d < pd.Timestamp("2026-05-31"):
        return 392.0
    if d < pd.Timestamp("2026-06-30"):
        return 407.0
    return 382.0


def kerosene_path(d: pd.Timestamp) -> float:
    # Apr: 255; May 3: 265; May 31+: 285
    if d < pd.Timestamp("2026-05-03"):
        return 255.0
    if d < pd.Timestamp("2026-05-31"):
        return 265.0
    return 285.0


def usd_lkr_path(d: pd.Timestamp) -> float:
    """
    Smooth path anchored to:
    - dataset Apr 2026 ~305
    - market Aug 2026 ~328.5 (Trading Economics / bank selling ~333)
    - TE forward ~321 in 12m → mild appreciation into Apr 2027
    """
    t0 = pd.Timestamp("2026-04-20")
    t1 = pd.Timestamp("2026-08-25")
    t2 = pd.Timestamp("2027-04-26")
    v0, v1, v2 = 305.09, 328.53, 321.08
    if d <= t1:
        w = (d - t0).days / max((t1 - t0).days, 1)
        return v0 + (v1 - v0) * w
    w = (d - t1).days / max((t2 - t1).days, 1)
    return v1 + (v2 - v1) * min(max(w, 0), 1)


def build_extension(hist: pd.DataFrame, dea: pd.DataFrame) -> pd.DataFrame:
    last_date = hist["date"].max()
    start = last_date + pd.Timedelta(days=7)
    end = pd.Timestamp("2027-04-26")
    weeks = pd.date_range(start, end, freq="7D")

    # Calibration: Apr-2026 dataset national LG mean / DEA LG avg
    apr = hist[hist["date"] == last_date]
    ds_nat_lg = apr[apr["grade"] == "LG"]["dried_price_lkr_per_kg"].mean()
    dea_apr = float(dea.loc[dea["date"] <= last_date, "lg_avg"].iloc[-1])
    calib = ds_nat_lg / dea_apr  # ~1.40

    # Region & grade relativities from last 52 weeks
    last52 = hist[hist["date"] >= last_date - pd.Timedelta(days=365)]
    lg52 = last52[last52["grade"] == "LG"]
    region_mult = (
        lg52.groupby("region")["dried_price_lkr_per_kg"].mean()
        / lg52["dried_price_lkr_per_kg"].mean()
    ).to_dict()
    grade_mult = {
        g: last52[last52["grade"] == g]["dried_price_lkr_per_kg"].mean()
        / last52[last52["grade"] == "LG"]["dried_price_lkr_per_kg"].mean()
        for g in GRADE_ORDER
    }

    # Seasonal index from 2023-2025 LG
    seas = (
        hist[(hist["grade"] == "LG") & (hist["year"].between(2023, 2025))]
        .groupby("month")["dried_price_lkr_per_kg"]
        .mean()
    )
    seas = (seas / seas.mean()).to_dict()

    # Weather climatology by region-month (2023-2025)
    climate = (
        hist[(hist["grade"] == "LG") & (hist["year"].between(2023, 2025))]
        .groupby(["region", "month"])[["rainfall_mm_est", "temperature_c_est", "humidity_pct_est"]]
        .mean()
    )

    # Fresh ratio & drying cost baselines from last 26 weeks
    recent = hist[hist["date"] >= last_date - pd.Timedelta(days=182)]
    fresh_ratio = (
        recent.groupby("grade")
        .apply(lambda x: (x["fresh_price_lkr_per_kg_est"] / x["dried_price_lkr_per_kg"]).mean(), include_groups=False)
        .to_dict()
    )
    cost_means = recent.groupby("grade")[
        [
            "fuel_drying_cost_lkr_per_dried_kg_est",
            "labour_drying_cost_lkr_per_dried_kg_est",
            "electricity_drying_cost_lkr_per_dried_kg_est",
            "barn_rental_lkr_per_dried_kg_est",
            "packaging_transport_lkr_per_dried_kg_est",
            "fresh_to_dried_conversion_ratio_est",
        ]
    ].mean()

    # DEA weekly national LG series, interpolated to Mondays
    dea_s = dea.set_index("date")["lg_avg"].sort_index().astype(float)
    # Extend DEA with seasonal path after last observation
    last_dea_dt = dea_s.index.max()
    last_dea_val = float(dea_s.iloc[-1])
    # Through Aug 2026: use DEA; after: hold DEA level * seasonal relative to Aug
    aug_seas = seas.get(8, 1.0)

    # Labour / electricity drift from Apr 2026 anchors
    labour0 = float(apr["labour_cost_lkr_day_est"].iloc[0])
    elec0 = float(apr["electricity_price_lkr_kwh_est"].iloc[0])

    # Supply / demand base
    supply0 = float(apr["production_supply_index_est"].iloc[0])
    demand0 = float(apr["global_export_demand_index_est"].iloc[0])

    # Persist slight AR(1) noise for prices so series looks realistic
    # national commercial LG path
    nat_path = {}
    prev = ds_nat_lg
    for w in weeks:
        if w <= last_dea_dt + pd.Timedelta(days=3):
            # interpolate DEA around week
            dea_val = float(
                np.interp(
                    w.toordinal(),
                    dea_s.index.map(lambda x: x.toordinal()),
                    dea_s.values,
                    left=dea_s.iloc[0],
                    right=dea_s.iloc[-1],
                )
            )
            target = dea_val * calib
        else:
            # post-DEA: seasonal from Aug peak then harvest softening + mild FX drag
            m = w.month
            seasonal = seas.get(m, 1.0) / aug_seas
            # mild real appreciation after Aug reduces LKR prices slightly
            fx_factor = usd_lkr_path(w) / 328.53
            # harvest supply rise Sep–Jan softens prices
            harvest_soft = 1.0
            if m in (9, 10, 11, 12, 1):
                harvest_soft = 0.94 + 0.02 * np.sin((m / 12) * 2 * np.pi)
            if m in (4, 5, 6, 7):
                harvest_soft = 1.04  # tight supply
            target = last_dea_val * calib * seasonal * (0.55 + 0.45 * fx_factor) * harvest_soft

        # AR blend + weekly noise (~5.7% hist std)
        shock = RNG.normal(0, 0.028)
        cur = 0.55 * prev + 0.45 * target
        cur *= 1.0 + shock
        # clamp weekly move
        cur = float(np.clip(cur, prev * 0.88, prev * 1.12))
        nat_path[w] = cur
        prev = cur

    rows = []
    for w in weeks:
        nat_lg = nat_path[w]
        # supply: high in main harvest, low in off-season
        m = int(w.month)
        if m in (9, 10, 11, 12, 1):
            supply = 110 + RNG.normal(0, 4)
        elif m in (2, 3):
            supply = 100 + RNG.normal(0, 3.5)
        elif m == 8:
            supply = 95 + RNG.normal(0, 3)
        else:
            supply = 88 + RNG.normal(0, 3.5)
        demand = demand0 + (usd_lkr_path(w) - 305) * 0.05 + RNG.normal(0, 1.8)
        demand = float(np.clip(demand, 100, 130))
        supply = float(np.clip(supply, 80, 130))

        # weeks since Apr for labour/power inflation ~0.12%/week labour, ~0.08% power
        weeks_elapsed = (w - last_date).days / 7
        labour = labour0 * ((1.0012) ** weeks_elapsed) * (1 + RNG.normal(0, 0.004))
        elec = elec0 * ((1.0008) ** weeks_elapsed) * (1 + RNG.normal(0, 0.003))
        usd = usd_lkr_path(w) * (1 + RNG.normal(0, 0.002))
        diesel = diesel_path(w) * (1 + RNG.normal(0, 0.0015))
        kero = kerosene_path(w) * (1 + RNG.normal(0, 0.0015))

        iso = w.isocalendar()
        for region in REGION_ORDER:
            zone, alt = REGION_META[region]
            clim = climate.loc[(region, m)] if (region, m) in climate.index else None
            if clim is not None:
                rain = float(clim["rainfall_mm_est"] * (1 + RNG.normal(0, 0.08)))
                temp = float(clim["temperature_c_est"] + RNG.normal(0, 0.35))
                hum = float(np.clip(clim["humidity_pct_est"] + RNG.normal(0, 1.2), 60, 95))
            else:
                rain, temp, hum = 200.0, 23.0, 75.0

            for grade in GRADE_ORDER:
                dried = (
                    nat_lg
                    * region_mult.get(region, 1.0)
                    * grade_mult[grade]
                    * (1 + RNG.normal(0, 0.012))
                )
                fresh = dried * fresh_ratio[grade] * (1 + RNG.normal(0, 0.02))
                fuel_c = float(cost_means.loc[grade, "fuel_drying_cost_lkr_per_dried_kg_est"])
                lab_c = float(cost_means.loc[grade, "labour_drying_cost_lkr_per_dried_kg_est"])
                elec_c = float(cost_means.loc[grade, "electricity_drying_cost_lkr_per_dried_kg_est"])
                barn_c = float(cost_means.loc[grade, "barn_rental_lkr_per_dried_kg_est"])
                pack_c = float(cost_means.loc[grade, "packaging_transport_lkr_per_dried_kg_est"])
                # scale fuel/labour/elec drying costs with macro drift
                fuel_c *= (diesel / 381.25) * (1 + RNG.normal(0, 0.02))
                lab_c *= (labour / labour0) * (1 + RNG.normal(0, 0.02))
                elec_c *= (elec / elec0) * (1 + RNG.normal(0, 0.02))
                barn_c *= (1 + 0.0008 * weeks_elapsed) * (1 + RNG.normal(0, 0.02))
                pack_c *= (diesel / 381.25) ** 0.4 * (1 + RNG.normal(0, 0.02))
                total_c = fuel_c + lab_c + elec_c + barn_c + pack_c
                conv = float(cost_means.loc[grade, "fresh_to_dried_conversion_ratio_est"])
                conv = float(np.clip(conv + RNG.normal(0, 0.04), 3.7, 4.6))

                # source class: DEA-anchored through last DEA week; then projected
                if w <= last_dea_dt + pd.Timedelta(days=6):
                    src = "source_calibrated_synthetic_recent_dea_anchor"
                else:
                    src = "source_calibrated_synthetic_dea_seasonal_projection"

                rows.append(
                    {
                        "date": f"{w.month}/{w.day}/{w.year}",
                        "year": int(w.year),
                        "month": int(w.month),
                        "week_of_year": int(iso.week),
                        "quarter": int((w.month - 1) // 3 + 1),
                        "season": season_for_month(m),
                        "region": region,
                        "production_zone": zone,
                        "altitude_m": alt,
                        "grade": grade,
                        "grade_description": GRADE_DESC[grade],
                        "dried_price_lkr_per_kg": round(float(dried), 2),
                        "fresh_price_lkr_per_kg_est": round(float(fresh), 2),
                        "usd_lkr_rate_est": round(float(usd), 2),
                        "diesel_price_lkr_litre_est": round(float(diesel), 2),
                        "kerosene_price_lkr_litre_est": round(float(kero), 2),
                        "labour_cost_lkr_day_est": round(float(labour), 2),
                        "electricity_price_lkr_kwh_est": round(float(elec), 2),
                        "rainfall_mm_est": round(float(rain), 1),
                        "temperature_c_est": round(float(temp), 1),
                        "humidity_pct_est": round(float(hum), 1),
                        "production_supply_index_est": round(float(supply), 2),
                        "global_export_demand_index_est": round(float(demand), 2),
                        "fuel_drying_cost_lkr_per_dried_kg_est": round(float(fuel_c), 2),
                        "labour_drying_cost_lkr_per_dried_kg_est": round(float(lab_c), 2),
                        "electricity_drying_cost_lkr_per_dried_kg_est": round(float(elec_c), 2),
                        "barn_rental_lkr_per_dried_kg_est": round(float(barn_c), 2),
                        "packaging_transport_lkr_per_dried_kg_est": round(float(pack_c), 2),
                        "total_drying_cost_lkr_per_dried_kg_est": round(float(total_c), 2),
                        "fresh_to_dried_conversion_ratio_est": round(float(conv), 2),
                        "data_source_class": src,
                    }
                )
    return pd.DataFrame(rows)


def main():
    raw = pd.read_csv(CSV_PATH)
    raw["date_parsed"] = pd.to_datetime(raw["date"])
    # Idempotent: keep history through 2026-04-20 only, then rebuild extension
    cutoff = pd.Timestamp("2026-04-20")
    hist = raw[raw["date_parsed"] <= cutoff].drop(columns=["date_parsed"]).copy()
    hist["date"] = pd.to_datetime(hist["date"])
    print("Loading DEA anchors...")
    dea = collect_dea_anchors()
    print(dea.to_string(index=False))
    print(f"Calibration window end: {hist['date'].max().date()}")
    ext = build_extension(hist, dea)
    print(f"New rows: {len(ext)} weeks*panels={ext['date'].nunique()} weeks")
    print(f"New date range: {ext['date'].iloc[0]} -> {ext['date'].iloc[-1]}")

    hist_fmt = raw[raw["date_parsed"] <= cutoff].drop(columns=["date_parsed"])
    out = pd.concat([hist_fmt, ext], ignore_index=True)
    out.to_csv(CSV_PATH, index=False)
    print(f"Wrote {CSV_PATH} total rows={len(out)}")

    # sanity
    out["date_parsed"] = pd.to_datetime(out["date"])
    gaps = (
        out.drop_duplicates("date_parsed")
        .sort_values("date_parsed")["date_parsed"]
        .diff()
        .dropna()
    )
    assert (gaps == pd.Timedelta(days=7)).all(), "Week spacing broken"
    assert out.groupby("date_parsed").size().eq(24).all(), "Expected 24 rows/week"
    print("Validation OK")
    print(
        out[out["date_parsed"] >= "2026-04-20"]
        .groupby(out["date_parsed"].dt.to_period("M"))["dried_price_lkr_per_kg"]
        .mean()
        .round(1)
        .to_string()
    )


if __name__ == "__main__":
    main()
