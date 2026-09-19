import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
export default defineConfig({
  site: process.env.SITE_URL || 'https://yentalin.github.io',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      remarkRehype: {
        footnoteLabel: 'Footnotes',
        footnoteBackLabel: 'Back to content',
      },
    }),
    shikiConfig: { theme: 'github-dark' },
  },
});
