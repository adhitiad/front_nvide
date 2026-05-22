import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500', { 'text-green-500': true });
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-green-500');
      expect(result).not.toContain('text-red-500'); // Assuming twMerge overrides text color
    });
  });
});
