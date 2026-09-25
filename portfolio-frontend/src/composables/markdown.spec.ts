import { describe, expect, it } from "vitest";
import {
  readingMinutes,
  renderInlineMarkdown,
  renderMarkdown,
  renderRichMarkdown,
  safeUrl,
} from "./markdown";

describe("markdown rendering", () => {
  it("renders ordinary markdown", () => {
    expect(renderMarkdown("**bold** and `code`")).toContain(
      "<strong>bold</strong> and <code>code</code>"
    );
    expect(renderMarkdown("a\nb", { breaks: true })).toContain("a<br>b");
    expect(renderInlineMarkdown("*hi*")).toBe("<em>hi</em>");
  });

  it("escapes raw HTML instead of injecting it", () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)"><script>alert(2)</script>');
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<script");
    expect(html).toContain("&lt;script&gt;");
    expect(renderInlineMarkdown("<b onclick=1>x</b>")).not.toContain("<b");
  });

  it("keeps attribute-free formatting tags used in existing posts", () => {
    expect(renderMarkdown("Text.\n\n<sup>All opinions are my own.</sup>")).toContain(
      "<sup>All opinions are my own.</sup>"
    );
    expect(renderMarkdown('<sup onclick="x()">no</sup>')).not.toContain("<sup onclick");
    expect(renderMarkdown("`<ESC>` key")).toContain("<code>&lt;ESC&gt;</code>");
  });

  it("drops unsafe link and image URLs", () => {
    expect(renderMarkdown("[x](javascript:alert(1))")).not.toContain("href");
    expect(renderMarkdown("![x](data:text/html,boom)")).not.toContain("<img");
    expect(safeUrl("java\tscript:alert(1)")).toBeNull();
    expect(safeUrl("vbscript:x")).toBeNull();
  });

  it("keeps safe links and opens external ones in a new tab", () => {
    const html = renderMarkdown("[site](https://example.com) [local](/about) [mail](mailto:a@b.c)");
    expect(html).toContain('href="https://example.com" target="_blank" rel="noopener noreferrer"');
    expect(html).toContain('<a href="/about">local</a>');
    expect(html).toContain('href="mailto:a@b.c"');
  });

  it("renders without loading KaTeX when there is no math", async () => {
    await expect(renderRichMarkdown("plain *text*")).resolves.toContain("<em>text</em>");
  });

  it("estimates reading time", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("word ".repeat(660))).toBe(3);
  });
});
