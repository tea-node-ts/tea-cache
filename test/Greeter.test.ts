import { Greeter } from '../src/index';

/* global test expect */
test('My Greeter', (): void => {
  expect(Greeter('Carl')).toBe('Hello Carl');
});
