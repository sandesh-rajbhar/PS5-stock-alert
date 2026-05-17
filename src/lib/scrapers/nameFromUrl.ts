export function nameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segs = path.split('/').filter(Boolean);
    let slug = segs.find(s => /playstation|ps5/i.test(s)) || segs[segs.length - 1] || '';
    slug = slug
      .replace(/-[a-z0-9]{4,}-\d{6,}$/i, '')
      .replace(/-+$/, '');
    if (!slug || /^itm[a-z0-9]+$/i.test(slug) || /^\d+$/.test(slug)) return 'PS5 Console';
    const words = slug.split(/[-_]+/).filter(Boolean).map(w =>
      w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()
    );
    const name = words.join(' ').trim();
    return name || 'PS5 Console';
  } catch {
    return 'PS5 Console';
  }
}
