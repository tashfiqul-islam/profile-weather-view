/**
 * Renders {@link Weather} into the README's marked weather section.
 *
 * {@link renderReadme} is the pure core: text in, text out, clock passed in. {@link updateReadme}
 * is the thin I/O shell around it. Two layouts are supported inside the
 * `<!-- Hourly Weather Update -->` markers, detected from the section itself: an HTML `<table>`
 * (first five `<td>`s rewritten in place, attributes kept) or a Markdown pipe table (every row
 * after the header and separator replaced).
 *
 * @module
 */

import { LOCATION } from './config';
import { log } from './log';
import { meteoconUrl } from './meteocons';
import { formatTimestamp } from './time';
import type { Weather } from './weather';

/** The marked weather section, markers included; lazy so a second section is never swallowed. */
const SECTION = /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/;
/** The "Last refresh" stamp, which may sit anywhere in the README. */
const REFRESH = /<em>Last refresh:.*?<\/em>/;
/** A table cell, capturing its attributes so they survive the rewrite. */
const TD = /<td([^>]*)>[\s\S]*?<\/td>/gi;

/** 24-hour (`h23`, so midnight is `00`, never `24`), long weekday and month. */
const REFRESH_FORMAT = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
} as const satisfies Intl.DateTimeFormatOptions;

/** HTML layout: rewrites the first five `<td>`s in place, keeping their attributes. */
function renderHtmlCells(section: string, w: Weather): string | undefined {
  const cells = [
    `${w.description} <img width="15" src="${meteoconUrl(w.icon)}" alt="${w.description} icon">`,
    `${w.temperatureC}°C`,
    w.sunrise,
    w.sunset,
    `${w.humidityPct}%`,
  ];
  if ([...section.matchAll(TD)].length < cells.length) return undefined;

  let index = 0;
  return section.replace(TD, (cell, attrs: string) =>
    index < cells.length ? `<td${attrs}>${cells[index++]}</td>` : cell,
  );
}

/** Markdown layout: every pipe-table row after the header and separator is a data row. */
function renderMarkdownRows(section: string, w: Weather): string | undefined {
  const icon = `<img src="${meteoconUrl(w.icon)}" alt="${w.description} icon" height="17" style="vertical-align: middle;">`;
  const row = `| ${icon} ${w.description} | ${w.temperatureC}°C | ${w.sunrise} | ${w.sunset} | ${w.humidityPct}% |`;
  let tableLine = 0;
  const lines = section.split('\n').map((line) => {
    if (!line.trim().startsWith('|')) return line;
    return tableLine++ < 2 ? line : row;
  });
  return tableLine > 2 ? lines.join('\n') : undefined;
}

/**
 * Returns `readme` with the weather section and the "Last refresh" stamp updated.
 *
 * Replacements use functions, so `$` sequences in values are inserted literally.
 *
 * @param readme - Full README text.
 * @param weather - Values to render.
 * @param now - Refresh time, in the zone it should be displayed in.
 * @returns The updated README; everything outside the section and the stamp is untouched.
 * @throws Error when the markers are missing or the section has no cells to fill, so stale
 *   weather never gets a fresh stamp.
 * @example
 * ```ts
 * const next = renderReadme(readme, weather, Temporal.Now.zonedDateTimeISO('Asia/Dhaka'));
 * ```
 */
export function renderReadme(
  readme: string,
  weather: Weather,
  now: Temporal.ZonedDateTime,
): string {
  const section = SECTION.exec(readme)?.[0];
  if (section === undefined) {
    throw new Error('Weather section markers not found in README');
  }

  const rendered = section.includes('<td')
    ? renderHtmlCells(section, weather)
    : renderMarkdownRows(section, weather);
  if (rendered === undefined) {
    throw new Error('Weather section has no table cells to fill (need 5 <td>s or a data row)');
  }

  return readme
    .replace(section, () => rendered)
    .replace(REFRESH, () => `<em>Last refresh: ${formatTimestamp(now, REFRESH_FORMAT)}</em>`);
}

/**
 * Patches the README at `path` in place with {@link renderReadme}.
 *
 * @param path - README file to rewrite.
 * @param weather - Values to render.
 * @param now - Refresh time; defaults to the current time in {@link LOCATION.timezone}.
 * @throws Error when the file is missing, or for any reason {@link renderReadme} throws.
 */
export async function updateReadme(
  path: string,
  weather: Weather,
  now = Temporal.Now.zonedDateTimeISO(LOCATION.timezone),
): Promise<void> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`README not found: ${path}`);
  }
  await Bun.write(file, renderReadme(await file.text(), weather, now));
  log(`Patched ${path}`, 'success');
}
