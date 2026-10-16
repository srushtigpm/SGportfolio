import { getCollection } from 'astro:content';

// Published posts, newest first.
export async function getPosts() {
  return (await getCollection('blog', (p) => !p.data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export const readingTime = (body = '') => Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220));
export const formatDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
