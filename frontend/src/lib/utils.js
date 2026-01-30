import { clsx } from 'clsx';

/**
 * Merges class names. Used by shadcn-style components.
 * @param {...(string|undefined|null|boolean)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return clsx(inputs);
}
