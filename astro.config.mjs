import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBaseLinks from './scripts/plugins/rehype-base-links.mjs';
const base = process.env.BASE_PATH || '/portfolio';
export default defineConfig({
  base,
  site: process.env.SITE_URL || 'https://yentalin.github.io',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, [rehypeBaseLinks, { base }]],
      remarkRehype: {
        footnoteLabel: 'Footnotes',
        footnoteBackLabel: 'Back to content',
      },
    }),
    shikiConfig: { theme: 'github-dark' },
  },
});
