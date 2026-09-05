import countryList from "react-select-country-list";

export type CountryOption = { value: string; label: string };

export const COUNTRY_OPTIONS: CountryOption[] = [...countryList().getData()].sort((a, b) =>
    a.label.localeCompare(b.label, "en")
);

/** Map legacy codes (e.g. old static lists) to ISO 3166-1 alpha-2. */
const STORED_COUNTRY_CODE_ALIASES: Record<string, string> = {
    UK: "GB",
};

export function normalizeStoredCountryCode(code: string | undefined): string {
    if (!code) return "";
    const upper = code.trim().toUpperCase();
    return STORED_COUNTRY_CODE_ALIASES[upper] ?? upper;
}
