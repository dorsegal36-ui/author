function cleanLine(line) {
  return line.replace(/\s+/g, ' ').trim();
}

function looksLineBased(lines) {
  if (lines.length < 3) return false;

  const lengths = lines.map((line) => cleanLine(line).length).filter(Boolean);
  if (!lengths.length) return false;

  const average = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  const sentenceEndCount = lines.filter((line) =>
    /[.!?…]["')\]\u00bb\u201d\u2019]?$/.test(cleanLine(line))
  ).length;

  return average < 42 && sentenceEndCount < Math.ceil(lines.length / 2);
}

function normalizeBlock(block) {
  const lines = block.split('\n').map(cleanLine).filter(Boolean);
  if (!lines.length) return '';
  if (looksLineBased(lines)) return lines.join('\n');

  return lines.join(' ');
}

function isMergeableProse(paragraph) {
  return (
    !paragraph.includes('\n') &&
    paragraph.length < 420 &&
    /[.!?…]["')\]\u00bb\u201d\u2019]?$/.test(paragraph) &&
    !/^["'\u00ab\u201c]?[A-Z0-9][^.!?…]{0,80}$/.test(paragraph)
  );
}

function rebalanceParagraphs(paragraphs) {
  const balanced = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if (!isMergeableProse(paragraph)) {
      if (current) {
        balanced.push(current);
        current = '';
      }
      balanced.push(paragraph);
      continue;
    }

    const next = current ? `${current} ${paragraph}` : paragraph;
    if (current && next.length > 850) {
      balanced.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  }

  if (current) balanced.push(current);
  return balanced;
}

export function normalizeStoryText(raw, options = {}) {
  const paragraphs = raw
    .replace(/\r\n?/g, '\n')
    .trim()
    .split(/\n{2,}/)
    .map(normalizeBlock)
    .filter(Boolean);

  return (options.rebalanceParagraphs ? rebalanceParagraphs(paragraphs) : paragraphs).join('\n\n');
}
