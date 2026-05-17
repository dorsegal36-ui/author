export function formatWrittenYear(date) {
  return `Written in ${date.toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  })}`;
}
