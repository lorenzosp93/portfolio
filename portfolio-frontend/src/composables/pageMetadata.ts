// Restore the portfolio's metadata before the SPA opens a server-rendered article.
// Opening/closing a dialog can then preserve the normal homepage values.
export function resetPortfolioMetadata() {
  const title = 'Lorenzo Spinelli — product leader, software & energy';
  const origin = new URL(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || window.location.href).origin;
  const values: Record<string, string> = {
    description: 'Lorenzo Spinelli is a product leader with a background in software and energy engineering. Résumé, projects, writing and contact.',
    'og:type': 'website', 'og:title': title,
    'og:description': 'Résumé, projects and writing from Lorenzo Spinelli.',
    'og:url': `${origin}/`, 'og:image': `${origin}/og-image.jpg`,
    'twitter:title': title, 'twitter:description': 'Résumé, projects and writing from Lorenzo Spinelli.',
    'twitter:image': `${origin}/og-image.jpg`,
  };
  document.title = title;
  for (const [key, content] of Object.entries(values)) {
    document.querySelector<HTMLMetaElement>(`meta[name="${key}"], meta[property="${key}"]`)?.setAttribute('content', content);
  }
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `${origin}/`);
  document.querySelector('meta[property="article:published_time"]')?.remove();
}
