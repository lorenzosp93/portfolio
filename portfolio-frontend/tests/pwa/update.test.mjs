import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, extname, resolve } from "node:path";
import { createServer } from "node:http";
import { chromium } from "@playwright/test";

test("production worker upgrades without forced reload, removes old API cache and preserves offline shell", async () => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-pwa-"));
  let browser;
  let server;
  try {
    for (const release of ["A", "B"]) {
      execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build", "--outDir", join(directory, release)], {
        env: { ...process.env, VITE_HERO_COPY: `Release ${release}`, VITE_APP_BACKEND_URL: "" }, stdio: "pipe",
      });
    }
    let release = "A";
    let apiRevision = 1;
    server = createServer(async (request, response) => {
      const path = new URL(request.url, "http://localhost").pathname;
      response.setHeader("Cache-Control", "no-store");
      if (path.startsWith("/api/")) {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ revision: apiRevision, results: [], count: 0 }));
        return;
      }
      const file = path === "/" ? "index.html" : path.slice(1);
      const root = resolve(directory, release);
      const target = resolve(root, file);
      if (!target.startsWith(root + "/")) { response.writeHead(403).end(); return; }
      try {
        response.setHeader("Content-Type", ({ ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webmanifest": "application/manifest+json" })[extname(file)] || "application/octet-stream");
        response.end(await readFile(target));
      } catch { response.writeHead(404).end(); }
    });
    await new Promise((done) => server.listen(0, "127.0.0.1", done));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(origin);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    assert.match(await page.locator(".hero-copy").innerText(), /Release A/);
    const otherTab = await context.newPage();
    await otherTab.goto(origin);
    await otherTab.locator(".hero-copy").waitFor();
    await page.evaluate(async () => {
      await (await caches.open("api-cache")).put("/api/settings/1/", new Response('{"revision":0}'));
      await caches.open("unrelated-cache");
    });
    const fetchSettings = () => page.evaluate(() => fetch("/api/settings/1/").then((r) => r.json()));
    assert.equal((await fetchSettings()).revision, 1);
    apiRevision = 2;
    assert.equal((await fetchSettings()).revision, 2);
    release = "B";
    await page.evaluate(async () => {
      const initialController = navigator.serviceWorker.controller;
      const registration = await navigator.serviceWorker.getRegistration();
      const deadline = Date.now() + 30_000;

      while (navigator.serviceWorker.controller === initialController && Date.now() < deadline) {
        await registration.update();
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (navigator.serviceWorker.controller === initialController) {
        throw new Error("Service worker controller did not update to release B");
      }
    });
    await page.getByRole("button", { name: "Refresh", exact: true }).waitFor();
    await otherTab.getByRole("button", { name: "Refresh", exact: true }).waitFor();
    assert.match(await page.locator(".hero-copy").innerText(), /Release A/);
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await page.waitForFunction(() => document.querySelector(".hero-copy")?.textContent.includes("Release B"));
    assert.match(await otherTab.locator(".hero-copy").innerText(), /Release A/);
    await otherTab.close();
    const names = await page.evaluate(() => caches.keys());
    assert.equal(names.includes("api-cache"), false);
    assert.equal(names.includes("unrelated-cache"), true);
    await context.setOffline(true);
    await page.reload();
    assert.match(await page.locator(".hero-copy").innerText(), /Release B/);
    const offlineAPI = await page.evaluate(() => fetch("/api/settings/1/").then(() => "unexpected cache hit", () => "offline"));
    assert.equal(offlineAPI, "offline");
  } finally {
    await browser?.close();
    if (server) await new Promise((done) => server.close(done));
    await rm(directory, { recursive: true, force: true });
  }
});
