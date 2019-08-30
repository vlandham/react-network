import {
  snakeToCamel,
  capitalize,
  snakeToSentence,
  snakeToCapSentence,
  displayLabelFor,
} from './string';

describe('snakeToCamel', () => {
  test('converts snake strings', () => {
    expect(snakeToCamel('a_snake_string')).toBe('aSnakeString');

    // empty string
    expect(snakeToCamel('')).toBe('');
    // weird snake strings
    expect(snakeToCamel('_')).toBe('_');
    expect(snakeToCamel('_a')).toBe('A');
  });

  test('invalid strings', () => {
    expect(snakeToCamel('a sentence')).toBe('a sentence');
    // missing
    expect(snakeToCamel(null)).toBe(null);
    expect(snakeToCamel(undefined)).toBe(undefined);
  });
});

describe('capitalize', () => {
  test('capitalizes strings', () => {
    expect(capitalize('capitalize')).toBe('Capitalize');

    expect(capitalize('this is a sentence')).toBe('This is a sentence');

    // single letter
    expect(capitalize('z')).toBe('Z');
    expect(capitalize('Z')).toBe('Z');
    // empty string
    expect(capitalize('')).toBe('');
    // weird strings
    expect(capitalize('_')).toBe('_');
    expect(capitalize('_a')).toBe('_a');
    expect(capitalize('a_a')).toBe('A_a');
  });

  test('invalid strings', () => {
    // missing
    expect(capitalize(null)).toBe(null);
    expect(capitalize(undefined)).toBe(undefined);
  });
});

describe('snakeToSentence', () => {
  test('convert snake case to sentences', () => {
    expect(snakeToSentence('a_snake_is_here')).toBe('a snake is here');
    // empty string
    expect(snakeToSentence('')).toBe('');
    expect(snakeToSentence(' ')).toBe(' ');
    // not snake
    expect(snakeToSentence('not a snake-though')).toBe('not a snake-though');
  });

  test('invalid strings', () => {
    // missing
    expect(snakeToSentence(null)).toBe(null);
    expect(snakeToSentence(undefined)).toBe(undefined);
  });
});

describe('snakeToCapSentence', () => {
  test('convert snake case to sentences', () => {
    expect(snakeToCapSentence('a_snake_is_here')).toBe('A Snake Is Here');
    expect(snakeToCapSentence('dunder_&_mifflin')).toBe('Dunder & Mifflin');
    expect(snakeToCapSentence('not a snake')).toBe('Not A Snake');
    expect(snakeToCapSentence('double_snake__attack')).toBe('Double Snake Attack');
    expect(snakeToCapSentence('1_2_snake_3')).toBe('1 2 Snake 3');
  });
});

describe('displayLabelFor', () => {
  test('normal values', () => {
    const values = ['hello', 2.3, 'a sentence', 4];
    values.forEach(value => {
      expect(displayLabelFor(value)).toBe(value);
    });
  });
  test('array values', () => {
    expect(displayLabelFor(['king', 'kong'])).toBe('king / kong');
    expect(displayLabelFor([2.3, 4.0])).toBe('2.3 / 4');
  });
});
