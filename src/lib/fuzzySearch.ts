export interface SearchResult<T = any> {
  item: T;
  score: number;
  matches: number[];
}

export function fuzzySearch<T>(
  query: string,
  items: T[],
  getSearchableText: (item: T) => string,
  threshold: number = 0.6
): SearchResult<T>[] {
  if (!query.trim()) {
    return items.map((item, index) => ({
      item,
      score: 1 - (index / items.length) * 0.1, // Slight preference for earlier items
      matches: [],
    }));
  }

  const queryLower = query.toLowerCase();

  return items
    .map((item) => {
      const text = getSearchableText(item).toLowerCase();
      const result = calculateScore(queryLower, text);
      return {
        item,
        score: result.score,
        matches: result.matches,
      };
    })
    .filter((result) => result.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

function calculateScore(query: string, text: string): { score: number; matches: number[] } {
  let queryIndex = 0;
  let textIndex = 0;
  let score = 0;
  const matches: number[] = [];
  let consecutiveMatches = 0;

  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      matches.push(textIndex);
      score += 1 + consecutiveMatches * 0.5;
      consecutiveMatches++;
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
    textIndex++;
  }

  // Penalty for unmatched query characters
  const unmatchedChars = query.length - queryIndex;
  score -= unmatchedChars * 2;

  // Normalize score
  const maxScore = query.length * 1.5;
  const normalizedScore = Math.max(0, score / maxScore);

  return { score: normalizedScore, matches };
}

export function highlightMatches(text: string, matches: number[], highlightClass: string = 'search-highlight'): string {
  if (matches.length === 0) return text;

  let result = '';
  let lastIndex = 0;

  matches.forEach((index) => {
    result += text.slice(lastIndex, index);
    result += `<span class="${highlightClass}">${text[index]}</span>`;
    lastIndex = index + 1;
  });

  result += text.slice(lastIndex);
  return result;
}
