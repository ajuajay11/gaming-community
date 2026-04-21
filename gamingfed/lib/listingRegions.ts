/**
 * Classes for native `<option>` — improves contrast in light vs `html.dark` themes.
 * (Dropdown rendering still depends on the OS/browser.)
 */
export const SELECT_OPTION_CLASS =
  "text-slate-900 dark:text-white bg-white dark:bg-[#1a1d22]";

export const LISTING_REGION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select region (optional)" },
  { value: "EU", label: "Europe (EU)" },
  { value: "NA", label: "North America" },
  { value: "LATAM", label: "Latin America" },
  { value: "Asia", label: "Asia" },
  { value: "SEA", label: "Southeast Asia (SEA)" },
  { value: "ME", label: "Middle East" },
  { value: "OCE", label: "Oceania" },
  { value: "Africa", label: "Africa" },
  { value: "India", label: "India" },
  { value: "Global", label: "Global / any region" },
];

/** Preset list plus a synthetic row when the saved value is not in the list (legacy text). */
export function getListingRegionOptions(currentRegion?: string | null) {
  const opts = [...LISTING_REGION_OPTIONS];
  const c = (currentRegion ?? "").trim();
  if (c && !opts.some((o) => o.value === c)) {
    opts.splice(1, 0, { value: c, label: `${c} (saved)` });
  }
  return opts;
}
