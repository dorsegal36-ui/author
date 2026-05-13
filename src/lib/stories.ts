import { getCollection, type CollectionEntry } from 'astro:content';

export type Story = CollectionEntry<'stories'>;
export type StoryLanguage = Story['data']['language'];

export const languageLabels: Record<StoryLanguage, string> = {
  english: 'English',
  spanish: 'Spanish',
  hebrew: 'Hebrew'
};

export const languageOrder: StoryLanguage[] = ['english', 'spanish', 'hebrew'];

export function isRtl(language: StoryLanguage) {
  return language === 'hebrew';
}

export function getStorySlug(story: Story) {
  return story.id.replace(/\.md$/, '');
}

export async function getPublishedStories() {
  const stories = await getCollection('stories', ({ data }) => !data.draft);
  return stories.sort((a, b) => {
    const dateDiff = b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
    return dateDiff || a.data.title.localeCompare(b.data.title);
  });
}

export function storiesByLanguage(stories: Story[]) {
  return languageOrder.map((language) => ({
    language,
    label: languageLabels[language],
    stories: stories.filter((story) => story.data.language === language)
  }));
}
