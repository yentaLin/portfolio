import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWriting } from '../lib/content';
import { site } from '../data/site';
export async function GET(context: APIContext) {
  return rss({
    title: `Writing by ${site.name}`,
    description: site.description,
    site: context.site!,
    items: (await getWriting()).map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.date,
      link: `/writing/${a.id}/`,
      categories: a.data.tags,
    })),
    customData: '<language>en-US</language>',
  });
}
