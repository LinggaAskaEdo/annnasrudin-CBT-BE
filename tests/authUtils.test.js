import { generateDefaultPassword, generateToken } from '../src/utils/authUtils.js';

describe('authUtils', () => {
  test('generateDefaultPassword should return 6 characters by default', () => {
    const password = generateDefaultPassword();
    expect(password).toHaveLength(6);
    expect(password).toMatch(/^[A-Z0-9]+$/); // Uppercase and numbers
  });

  test('generateToken should return a string', () => {
    const token = generateToken({ id: '1', username: 'test' });
    expect(typeof token).toBe('string');
  });
});
