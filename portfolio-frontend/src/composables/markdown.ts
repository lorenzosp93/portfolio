import { Marked, type MarkedExtension } from "marked";

/**
 * Single entry point for turning CMS markdown into HTML for `v-html`.
 *
 * Content comes from Django admin, but it is still rendered defensively so a
 * compromised account or a future user-generated field cannot inject script:
 * raw HTML is shown as text (except a few attribute-free formatting tags such
 * as <sup>) and links/images only accept safe URL schemes.
 * KaTeX is loaded on demand, only for content that contains math.
 */

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\.{0,2}\/|[^:]*$)/i;

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

// Attribute-free formatting tags that existing posts use; anything else is escaped.
const ALLOWED_TAGS = /&lt;(\/?)(sup|sub|br|kbd|mark|small|em|strong|b|i|u|s|del|ins)\s*(\/?)&gt;/gi;

export function sanitizeRawHtml(html: string): string {
  return escapeHtml(html).replace(ALLOWED_TAGS, (_m, close: string, tag: string, self: string) =>
    `<${close}${tag.toLowerCase()}${self ? " /" : ""}>`
  );
}

export function safeUrl(href: string | null | undefined): string | null {
  if (!href) return null;
  // Strip control/whitespace characters browsers ignore inside schemes.
  const normalized = href.replace(/[\u0000- \u007f]/g, "");
  return SAFE_URL.test(normalized) ? href : null;
}

const hardening: MarkedExtension = {
  renderer: {
    html(html: string) {
      return sanitizeRawHtml(html);
    },
    link(href: string, title: string | null | undefined, text: string) {
      const url = safeUrl(href);
      if (url === null) return text;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      const external = /^https?:/i.test(url)
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return `<a href="${escapeHtml(url)}"${titleAttr}${external}>${text}</a>`;
    },
    image(href: string, title: string | null, text: string) {
      const url = safeUrl(href);
      if (url === null) return escapeHtml(text);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async">`;
    },
  },
};

function createParser(breaks: boolean) {
  return new Marked({ async: false, breaks, gfm: true }, hardening);
}

const plain = createParser(false);
const withBreaks = createParser(true);

export function renderMarkdown(text: string | null | undefined, options: { breaks?: boolean } = {}): string {
  const parser = options.breaks ? withBreaks : plain;
  return parser.parse(text ?? "") as string;
}

export function renderInlineMarkdown(text: string | null | undefined): string {
  return plain.parseInline(text ?? "") as string;
}

const MATH = /\$[^$\n]+\$|\$\$[\s\S]+?\$\$/;
let mathParser: Promise<Marked> | undefined;

function loadMathParser(): Promise<Marked> {
  mathParser ??= Promise.all([
    import("marked-katex-extension"),
    import("katex/dist/katex.min.css"),
  ]).then(([{ default: markedKatex }]) => {
    return new Marked({ async: false, gfm: true }, hardening, markedKatex({ throwOnError: false }));
  });
  return mathParser;
}

/** Full renderer for detail views; pulls in KaTeX only when math is present. */
export async function renderRichMarkdown(text: string | null | undefined): Promise<string> {
  const source = text ?? "";
  if (!MATH.test(source)) return renderMarkdown(source);
  const parser = await loadMathParser();
  return parser.parse(source) as string;
}

const WORDS_PER_MINUTE = 220;

export function readingMinutes(text: string | null | undefined): number {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
