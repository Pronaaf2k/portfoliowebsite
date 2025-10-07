import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'AI/ML & Full-Stack Development Blog | Samiyeel Alim Binaaf', // <-- CHANGED
    description: 'CSE undergraduate specializing in AI/ML, accessibility, and full-stack web development.', // <-- CHANGED
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>en-US</language>`, // Changed language from 'es' to 'en-US' for consistency with frontmatter
  });
}