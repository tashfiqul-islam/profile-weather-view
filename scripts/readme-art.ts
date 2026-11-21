/**
 * Builds the README and CONTRIBUTING art in light and dark pairs: the cover, the diagram of one
 * scheduled run and the delivery pipeline, all under `.github/assets/`. The style follows mdxcn
 * figures: dashed frames with `+` corners and a `[ TITLE ]` on the top edge, monospace labels and
 * one accent colour per GitHub mode. Run `bun run readme:art` after changing this file.
 *
 * @module
 */

/** Colour mode of a GitHub page. */
export type Mode = 'light' | 'dark';

/** Colours of one mode, matched to GitHub's light and dark Primer palettes. */
interface Ink {
  readonly bg: string;
  readonly dots: string;
  readonly frame: string;
  readonly corner: string;
  readonly ink: string;
  readonly muted: string;
  readonly faint: string;
  readonly accent: string;
  readonly ok: string;
  readonly node: string;
  readonly glow: number;
}

const INKS: Readonly<Record<Mode, Ink>> = {
  dark: {
    accent: '#f0883e',
    bg: '#0d1117',
    corner: '#6e7681',
    dots: '#1f242c',
    faint: '#6e7681',
    frame: '#30363d',
    glow: 0.14,
    ink: '#f0f6fc',
    muted: '#9198a1',
    node: '#151b23',
    ok: '#3fb950',
  },
  light: {
    accent: '#bc4c00',
    bg: '#ffffff',
    corner: '#8c959f',
    dots: '#dfe4ea',
    faint: '#8c959f',
    frame: '#d0d7de',
    glow: 0.09,
    ink: '#1f2328',
    muted: '#59636e',
    node: '#f6f8fa',
    ok: '#1a7f37',
  },
};

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";
const MONO_ADVANCE = 0.6;

/** Node size shared by both diagrams. */
const NODE = { height: 96, width: 196 } as const;
/** Left edges of the five node columns. */
const COLUMNS = [88, 315, 542, 769, 996] as const;

const round = (value: number): number => Math.round(value * 10) / 10;

/**
 * Escapes text for SVG character data and attributes.
 *
 * @param value - Raw text.
 * @returns The text with `&`, `<`, `>` and `"` escaped.
 */
export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** One text run. */
interface Text {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly fill: string;
  readonly size: number;
  readonly font?: 'sans' | 'mono';
  readonly weight?: number;
  readonly anchor?: 'start' | 'middle' | 'end';
  readonly tracking?: number;
  readonly italic?: boolean;
}

/** Renders one `<text>` element; the text is escaped. */
function text(t: Text): string {
  const attrs = [
    `x="${t.x}"`,
    `y="${t.y}"`,
    `font-family="${t.font === 'sans' ? SANS : MONO}"`,
    `font-size="${t.size}"`,
    t.weight === undefined ? '' : `font-weight="${t.weight}"`,
    t.italic === true ? 'font-style="italic"' : '',
    t.anchor === undefined || t.anchor === 'start' ? '' : `text-anchor="${t.anchor}"`,
    t.tracking === undefined ? '' : `letter-spacing="${t.tracking}"`,
    `fill="${t.fill}"`,
  ].filter(Boolean);
  return `<text ${attrs.join(' ')}>${escapeXml(t.text)}</text>`;
}

/** Width a `[ LABEL ]` takes on a frame edge, in px, with breathing room on both sides. */
const labelWidth = (label: string): number => label.length * (13 * MONO_ADVANCE + 1.5) + 16;

/** A dashed frame: `+` corners, `[ TITLE ]` left on the top edge, optional `[ NOTE ]` right. */
interface Frame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly note?: string;
}

/** Renders a frame; the top edge breaks around its labels so the dot grid shows through. */
function frame(ink: Ink, f: Frame): string {
  const title = `[ ${f.title} ]`;
  const note = f.note === undefined ? undefined : `[ ${f.note} ]`;
  const right = f.x + f.width;
  const bottom = f.y + f.height;
  const gaps: [number, number][] = [[f.x + 36, f.x + 36 + labelWidth(title)]];
  if (note !== undefined) gaps.push([right - 36 - labelWidth(note), right - 36]);
  let top = `M${f.x} ${f.y}`;
  for (const [from, to] of gaps) top += `H${round(from)}M${round(to)} ${f.y}`;
  const corners = [
    [f.x, f.y],
    [right, f.y],
    [f.x, bottom],
    [right, bottom],
  ].map(
    ([cx = 0, cy = 0]) =>
      `<path d="M${cx - 6} ${cy}h12M${cx} ${cy - 6}v12" stroke="${ink.corner}" stroke-width="1.5"/>`,
  );
  const parts = [
    `<path d="${top}H${right}V${bottom}H${f.x}V${f.y}" fill="none" stroke="${ink.frame}" stroke-dasharray="6 6"/>`,
    ...corners,
    text({ fill: ink.muted, size: 13, text: title, tracking: 1.5, x: f.x + 44, y: f.y + 5 }),
  ];
  if (note !== undefined) {
    parts.push(
      text({
        anchor: 'end',
        fill: ink.faint,
        size: 13,
        text: note,
        tracking: 1.5,
        x: right - 44,
        y: f.y + 5,
      }),
    );
  }
  return parts.join('');
}

/** The SVG shell: background, dot grid, an accent glow, arrowhead, accessible name. */
function sheet(
  ink: Ink,
  size: { readonly width: number; readonly height: number },
  glow: { readonly cx: number; readonly cy: number; readonly r: number },
  label: { readonly title: string; readonly desc: string },
  body: readonly string[],
): string {
  const { width, height } = size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(label.title)}</title>
<desc id="desc">${escapeXml(label.desc)}</desc>
<defs>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${ink.dots}"/></pattern>
<radialGradient id="glow"><stop offset="0" stop-color="${ink.accent}" stop-opacity="${ink.glow}"/><stop offset="1" stop-color="${ink.accent}" stop-opacity="0"/></radialGradient>
<marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${ink.muted}"/></marker>
<marker id="hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${ink.accent}"/></marker>
</defs>
<rect width="${width}" height="${height}" fill="${ink.bg}"/>
<rect width="${width}" height="${height}" fill="url(#dots)"/>
<circle cx="${glow.cx}" cy="${glow.cy}" r="${glow.r}" fill="url(#glow)"/>
${body.join('\n')}
</svg>
`;
}

/** A small accent dot followed by an uppercase mono eyebrow. */
function eyebrow(ink: Ink, x: number, y: number, label: string): string {
  return [
    `<circle cx="${x + 4}" cy="${y - 5}" r="4" fill="${ink.accent}"/>`,
    text({ fill: ink.accent, size: 13, text: label, tracking: 2, x: x + 18, y }),
  ].join('');
}

/** A horizontal hairline. */
const rule = (ink: Ink, x: number, y: number, length: number): string =>
  `<path d="M${x} ${y}h${length}" stroke="${ink.frame}"/>`;

/** A line with an arrowhead; `hot` paints it in the accent. */
const arrow = (ink: Ink, d: string, hot = false, dashed = false): string =>
  `<path d="${d}" fill="none" stroke="${hot ? ink.accent : ink.muted}" stroke-width="1.5"${dashed ? ' stroke-dasharray="5 5"' : ''} marker-end="url(#${hot ? 'hot' : 'head'})"/>`;

/** How a node is drawn: `core` is accented, `ghost` is dashed (external or fallback). */
type Kind = 'plain' | 'core' | 'ghost';

/** One numbered node: step, name, note. */
interface Node {
  readonly x: number;
  readonly y: number;
  readonly step: string;
  readonly name: string;
  readonly note: string;
  readonly kind?: Kind;
}

/** Renders a node box with its three text lines. */
function node(ink: Ink, n: Node): string {
  const kind = n.kind ?? 'plain';
  const stroke = kind === 'core' ? ink.accent : ink.frame;
  const box =
    kind === 'core'
      ? `<rect x="${n.x}" y="${n.y}" width="${NODE.width}" height="${NODE.height}" rx="10" fill="${ink.node}" stroke="${stroke}" stroke-width="1.5"/><rect x="${n.x}" y="${n.y}" width="${NODE.width}" height="${NODE.height}" rx="10" fill="${ink.accent}" fill-opacity="0.08"/>`
      : `<rect x="${n.x}" y="${n.y}" width="${NODE.width}" height="${NODE.height}" rx="10" fill="${kind === 'ghost' ? ink.bg : ink.node}" stroke="${stroke}"${kind === 'ghost' ? ' stroke-dasharray="5 4"' : ''}/>`;
  return [
    box,
    text({
      fill: kind === 'ghost' ? ink.faint : ink.accent,
      size: 12,
      text: n.step,
      tracking: 1,
      weight: 700,
      x: n.x + 18,
      y: n.y + 28,
    }),
    text({
      fill: ink.ink,
      font: 'sans',
      size: 19,
      text: n.name,
      weight: 700,
      x: n.x + 18,
      y: n.y + 58,
    }),
    text({ fill: ink.muted, size: 12, text: n.note, x: n.x + 18, y: n.y + 80 }),
  ].join('');
}

/** A small mono label beside an arrow. */
const tag = (
  ink: Ink,
  x: number,
  y: number,
  value: string,
  anchor: Text['anchor'] = 'start',
): string => text({ anchor, fill: ink.faint, size: 11, text: value, tracking: 1, x, y });

/** A sun: disc and eight rays, in the accent. */
function sun(ink: Ink, cx: number, cy: number): string {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4;
    const [x1, y1] = [cx + Math.cos(angle) * 11, cy + Math.sin(angle) * 11];
    const [x2, y2] = [cx + Math.cos(angle) * 15, cy + Math.sin(angle) * 15];
    return `M${round(x1)} ${round(y1)}L${round(x2)} ${round(y2)}`;
  }).join('');
  return `<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="${ink.accent}" stroke-width="2"/><path d="${rays}" stroke="${ink.accent}" stroke-width="2" stroke-linecap="round"/>`;
}

/** The example run shown on the cover, matching the README's sample table. */
const SAMPLE = {
  cells: ['29°C', '05:41', '18:02', '74%'],
  refresh: 'Last refresh: Friday, November 21, 2026 at 11:23:05 (UTC+6)',
  weather: 'Clear sky',
} as const;

/**
 * Renders the README cover: the pitch on the left, the patched table and its signed commit on
 * the right.
 *
 * @param mode - GitHub colour mode the image is for.
 * @returns A standalone 1280 × 600 SVG document.
 */
export function coverSvg(mode: Mode): string {
  const ink = INKS[mode];
  const stats = (
    [
      ['3×', 'runs a day'],
      ['0', 'api keys'],
      ['100 %', 'test coverage'],
    ] as const
  ).flatMap(([value, caption], i) => [
    text({
      fill: ink.ink,
      font: 'sans',
      size: 34,
      text: value,
      tracking: -0.5,
      weight: 700,
      x: 96 + i * 176,
      y: 470,
    }),
    text({ fill: ink.muted, size: 12, text: caption, tracking: 0.5, x: 96 + i * 176, y: 494 }),
  ]);
  const headers = (
    [
      ['WEATHER', 736, 'start'],
      ['TEMP', 884, 'start'],
      ['SUNRISE', 950, 'start'],
      ['SUNSET', 1024, 'start'],
      ['HUMIDITY', 1160, 'end'],
    ] as const
  ).map(([value, x, anchor]) =>
    text({ anchor, fill: ink.muted, size: 11, text: value, tracking: 1, x, y: 196 }),
  );
  const [temp, sunrise, sunset, humidity] = SAMPLE.cells;
  const values = [
    text({
      fill: ink.ink,
      font: 'sans',
      size: 17,
      text: SAMPLE.weather,
      weight: 600,
      x: 776,
      y: 246,
    }),
    text({ fill: ink.ink, font: 'sans', size: 17, text: temp, weight: 700, x: 884, y: 246 }),
    text({ fill: ink.ink, font: 'sans', size: 17, text: sunrise, weight: 600, x: 950, y: 246 }),
    text({ fill: ink.ink, font: 'sans', size: 17, text: sunset, weight: 600, x: 1024, y: 246 }),
    text({
      anchor: 'end',
      fill: ink.ink,
      font: 'sans',
      size: 17,
      text: humidity,
      weight: 600,
      x: 1160,
      y: 246,
    }),
  ];
  return sheet(
    ink,
    { height: 600, width: 1280 },
    { cx: 948, cy: 290, r: 430 },
    {
      desc: `Live weather from Open-Meteo, patched into a marked table in your profile README and pushed as a signed, Verified commit three times a day. Example: ${SAMPLE.weather}, ${temp}, sunrise ${sunrise}, sunset ${sunset}, humidity ${humidity}.`,
      title: 'Profile Weather View: live weather in your README',
    },
    [
      frame(ink, {
        height: 520,
        note: 'OPEN-METEO · NO API KEY',
        title: 'PROFILE WEATHER VIEW',
        width: 1200,
        x: 40,
        y: 40,
      }),
      eyebrow(ink, 96, 146, 'LIVE ON YOUR GITHUB PROFILE'),
      text({
        fill: ink.ink,
        font: 'sans',
        size: 62,
        text: 'Live weather,',
        tracking: -2,
        weight: 800,
        x: 92,
        y: 226,
      }),
      text({
        fill: ink.accent,
        font: 'sans',
        size: 62,
        text: 'in your README.',
        tracking: -2,
        weight: 800,
        x: 92,
        y: 300,
      }),
      text({
        fill: ink.muted,
        font: 'sans',
        size: 20,
        text: 'Fetched from Open-Meteo, patched into a marked table',
        x: 96,
        y: 356,
      }),
      text({
        fill: ink.muted,
        font: 'sans',
        size: 20,
        text: 'and pushed as a signed commit, three times a day.',
        x: 96,
        y: 384,
      }),
      rule(ink, 96, 420, 528),
      ...stats,
      frame(ink, { height: 408, title: 'README.md', width: 488, x: 704, y: 96 }),
      text({ fill: ink.faint, size: 12, text: '<!-- Hourly Weather Update -->', x: 736, y: 156 }),
      ...headers,
      rule(ink, 736, 210, 424),
      sun(ink, 750, 240),
      ...values,
      rule(ink, 736, 272, 424),
      text({
        fill: ink.muted,
        font: 'sans',
        italic: true,
        size: 13,
        text: SAMPLE.refresh,
        x: 736,
        y: 302,
      }),
      text({
        fill: ink.faint,
        size: 12,
        text: '<!-- End of Hourly Weather Update -->',
        x: 736,
        y: 334,
      }),
      `<rect x="736" y="372" width="424" height="52" rx="10" fill="${ink.node}" stroke="${ink.frame}"/>`,
      `<path d="M754 398l5 5 10-11" fill="none" stroke="${ink.ok}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
      text({ fill: ink.ok, size: 12, text: 'Verified', weight: 700, x: 780, y: 403 }),
      text({ fill: ink.ink, size: 12, text: 'update(weather): refresh data', x: 862, y: 403 }),
      text({
        anchor: 'end',
        fill: ink.faint,
        size: 12,
        text: 'DHAKA · 23.88°N 90.38°E',
        tracking: 1,
        x: 1160,
        y: 468,
      }),
    ],
  );
}

/**
 * Renders one scheduled run: the secret-free render job, then the publish job in the `profile`
 * environment.
 *
 * @param mode - GitHub colour mode the image is for.
 * @returns A standalone 1280 × 662 SVG document.
 */
export function architectureSvg(mode: Mode): string {
  const ink = INKS[mode];
  const [c1, c2, c3, c4, c5] = COLUMNS;
  const top = 140;
  const low = 290;
  const pub = 478;
  const mid = top + NODE.height / 2;
  const row1: Node[] = [
    { name: 'github cron', note: '23 5,13,21 * * *', step: '01', x: c1, y: top },
    { name: 'fetchWithRetry', note: '15 s × 4, jitter', step: '02', x: c2, y: top },
    { name: 'zod schema', note: 'json → weather', step: '03', x: c3, y: top },
    { kind: 'core', name: 'renderReadme', note: 'pure core', step: '04', x: c4, y: top },
    { name: 'updateReadme', note: 'Bun.write', step: '05', x: c5, y: top },
  ];
  const row2: Node[] = [
    {
      kind: 'ghost',
      name: 'render-retry',
      note: 'fresh runner',
      step: 'IF THROTTLED',
      x: c1,
      y: low,
    },
    {
      kind: 'ghost',
      name: 'open-meteo',
      note: 'api.open-meteo.com',
      step: 'EXTERNAL',
      x: c2,
      y: low,
    },
  ];
  const row3: Node[] = [
    { name: 'publish.sh', note: 'weather section only', step: '06', x: c5, y: pub },
    { name: 'sign + verify', note: 'ssh, verify-commit', step: '07', x: c4, y: pub },
    { name: 'git push', note: 'pat: contents only', step: '08', x: c3, y: pub },
    { name: 'README.md', note: 'profile repo', step: '09', x: c2, y: pub },
  ];
  const right = (x: number): number => x + NODE.width;
  const flow = [
    ...[c1, c2, c3, c4].map((x, i) =>
      arrow(ink, `M${right(x) + 2} ${mid}H${(COLUMNS[i + 1] ?? 0) - 4}`, i === 2 || i === 3),
    ),
    arrow(ink, `M${c2 + 78} ${top + NODE.height + 2}V${low - 4}`),
    arrow(ink, `M${c2 + 118} ${low - 2}V${top + NODE.height + 4}`, false, true),
    tag(ink, c2 + 70, 270, 'GET', 'end'),
    tag(ink, c2 + 126, 270, 'JSON'),
    arrow(ink, `M${c1 + 98} ${low - 2}V${top + NODE.height + 4}`, false, true),
    arrow(ink, `M${c5 + 98} ${top + NODE.height + 2}V${pub - 4}`, true),
    tag(ink, c5 + 110, 440, 'ARTIFACT'),
    ...[c4, c3, c2].map((x) =>
      arrow(ink, `M${right(x) + 29} ${pub + NODE.height / 2}H${right(x) + 4}`),
    ),
  ];
  const legend = [
    `<path d="M${c1} 512h40" stroke="${ink.muted}" stroke-width="1.5"/>`,
    text({ fill: ink.muted, size: 12, text: 'one run', x: c1 + 52, y: 516 }),
    `<path d="M${c1} 540h40" stroke="${ink.accent}" stroke-width="1.5"/>`,
    text({ fill: ink.muted, size: 12, text: 'weather path', x: c1 + 52, y: 544 }),
    `<path d="M${c1} 568h40" stroke="${ink.muted}" stroke-width="1.5" stroke-dasharray="5 5"/>`,
    text({ fill: ink.muted, size: 12, text: 'external, fallback', x: c1 + 52, y: 572 }),
  ];
  return sheet(
    ink,
    { height: 662, width: 1280 },
    { cx: 860, cy: 260, r: 520 },
    {
      desc: 'One scheduled run. Render job, no secrets: GitHub cron at 23 5,13,21 UTC, fetchWithRetry calls Open-Meteo (15 s timeout, four attempts, jitter), a Zod schema turns the JSON into weather, renderReadme (the pure core) rewrites the section, and updateReadme writes the file; if the runner is throttled, render-retry starts on a fresh runner. The README passes as an artifact to the publish job in the profile environment: publish.sh refuses changes outside the weather section, signs and verifies the commit with an SSH key, and pushes it to the profile README with a contents-only token.',
      title: 'One scheduled run of Profile Weather View',
    },
    [
      frame(ink, {
        height: 582,
        note: 'CRON 23 5,13,21 * * * UTC',
        title: 'ONE RUN',
        width: 1200,
        x: 40,
        y: 40,
      }),
      frame(ink, { height: 314, title: 'RENDER · NO SECRETS', width: 1152, x: 64, y: 96 }),
      frame(ink, {
        height: 144,
        title: 'PUBLISH · PROFILE ENVIRONMENT',
        width: 1152,
        x: 64,
        y: 454,
      }),
      ...flow,
      ...[...row1, ...row2, ...row3].map((n) => node(ink, n)),
      ...legend,
    ],
  );
}

/**
 * Renders the delivery pipeline: every change, human or Renovate, crosses one gate before a
 * tag-only release.
 *
 * @param mode - GitHub colour mode the image is for.
 * @returns A standalone 1280 × 440 SVG document.
 */
export function pipelineSvg(mode: Mode): string {
  const ink = INKS[mode];
  const [c1, c2, c3, c4, c5] = COLUMNS;
  const y = 236;
  const mid = y + NODE.height / 2;
  const nodes: Node[] = [
    { name: 'git commit', note: 'hk: fmt · lint · tsc', step: '01', x: c1, y },
    { name: 'pull request', note: 'title · labels', step: '02', x: c2, y },
    {
      kind: 'core',
      name: 'bun run check',
      note: '100 % coverage',
      step: '03 · THE GATE',
      x: c3,
      y,
    },
    { name: 'main', note: 'squash merge', step: '04', x: c4, y },
    { name: 'release', note: 'tag + GitHub Release', step: '05', x: c5, y },
    { kind: 'ghost', name: 'renovate', note: 'deps · actions · mise', step: 'BOT', x: c3, y: 92 },
  ];
  return sheet(
    ink,
    { height: 440, width: 1280 },
    { cx: 640, cy: 260, r: 460 },
    {
      desc: 'Delivery pipeline: a git commit passes hk hooks (format, lint, typecheck), opens a pull request with a conventional title and release labels, crosses the gate (bun run check at 100 % coverage), is squash-merged to main and released as a tag and GitHub Release by semantic-release. Renovate pull requests enter at the same gate and automerge when it is green.',
      title: 'Delivery pipeline of Profile Weather View',
    },
    [
      frame(ink, {
        height: 360,
        note: 'ONE GATE FOR EVERY CHANGE',
        title: 'DELIVERY',
        width: 1200,
        x: 40,
        y: 40,
      }),
      arrow(ink, `M${c1 + NODE.width + 2} ${mid}H${c2 - 4}`),
      arrow(ink, `M${c2 + NODE.width + 2} ${mid}H${c3 - 4}`),
      arrow(ink, `M${c3 + NODE.width + 2} ${mid}H${c4 - 4}`, true),
      arrow(ink, `M${c4 + NODE.width + 2} ${mid}H${c5 - 4}`),
      arrow(ink, `M${c3 + 98} ${92 + NODE.height + 2}V${y - 4}`, false, true),
      tag(ink, c3 + 110, 216, 'AUTOMERGE'),
      ...nodes.map((n) => node(ink, n)),
      text({
        fill: ink.faint,
        size: 12,
        text: 'types · type-aware lint · format · tests · actionlint · zizmor · shellcheck',
        tracking: 0.5,
        x: c1,
        y: 372,
      }),
    ],
  );
}

/**
 * Every committed art file, keyed by its path in the repository.
 *
 * @returns Path to SVG document.
 */
export function readmeArt(): Record<string, string> {
  const files: Record<string, string> = {};
  const pieces = { architecture: architectureSvg, cover: coverSvg, pipeline: pipelineSvg };
  for (const [name, render] of Object.entries(pieces)) {
    for (const mode of ['dark', 'light'] as const) {
      files[`.github/assets/${name}-${mode}.svg`] = render(mode);
    }
  }
  return files;
}

/**
 * Writes every art file.
 *
 * @param write - File writer; defaults to `Bun.write`.
 * @returns Resolves once every file is written.
 */
export async function writeReadmeArt(
  write: (path: string, data: string) => Promise<unknown> = Bun.write,
): Promise<void> {
  await Promise.all(Object.entries(readmeArt()).map(([path, svg]) => write(path, svg)));
}

if (import.meta.main) await writeReadmeArt();
