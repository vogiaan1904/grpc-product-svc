import { generate } from 'rxjs';

export function generateSku(categoryIds?: string[]): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();

  let prefix = 'PRD';

  if (categoryIds && categoryIds.length > 0) {
    prefix = categoryIds[0].substring(0, 3).toUpperCase();

    if (categoryIds.length > 1) {
      prefix = `${prefix}M`;
    }
  }

  return `${prefix}-${timestamp}-${randomSuffix}`;
}
