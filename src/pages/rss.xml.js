import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'AI/ML & Full-Stack Development Blog | Samiyeel Alim Binaaf', // Updated for new owner
    description: 'CSE undergraduate specializing in AI/ML, accessibility, and full-stack web development.', // Updated for new owner
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>en-US</language>`, 
  });
}