export function createIssueSignature(title, description, categoryId) {
  return `${title.trim().toLowerCase()}|${description.trim().toLowerCase().slice(0, 120)}|${categoryId || 'na'}`;
}
