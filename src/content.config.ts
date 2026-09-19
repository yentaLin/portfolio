import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const common = {
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
};
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/writing' }),
  schema: z.object({
    ...common,
    relatedProjects: z.array(reference('projects')).default([]),
  }),
});
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/projects' }),
  schema: z.object({
    ...common,
    order: z.number().default(99),
    role: z.string().optional(),
    period: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    relatedWriting: z.array(reference('writing')).default([]),
  }),
});
export const collections = { writing, projects };
