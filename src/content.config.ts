import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Blog posts: one Markdown file per post in src/content/blog/
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// Work: one Markdown file per project in src/content/work/
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    year: z.string(),
    summary: z.string(),
    order: z.number().default(0),
    link: z.string().url().optional(),
  }),
});

// Books and songs: simple lists in JSON
const books = defineCollection({
  loader: file('./src/content/books.json'),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    note: z.string(),
    line: z.string().optional(),
    status: z.enum(['read', 'reading', 'quit']).default('read'),
  }),
});

const songs = defineCollection({
  loader: file('./src/content/songs.json'),
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    why: z.string(),
    link: z.string().url().optional(),
  }),
});

export const collections = { blog, work, books, songs };
