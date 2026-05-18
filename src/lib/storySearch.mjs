function normalizeSearchText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function storySearchText(story) {
  return normalizeSearchText(`${story.title} ${story.author}`);
}

export function storyMatchesSearch(story, query) {
  const normalizedQuery = normalizeSearchText(query);
  return !normalizedQuery || storySearchText(story).includes(normalizedQuery);
}
