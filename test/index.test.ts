/* eslint-disable no-undef */
import Cache from '../src/index';
import { CachingFn } from '../src/types';
import { RedisClient, Callback } from 'redis';

export interface User {
  name: string;
  gender: string;
}

/* global describe test expect Promise */
describe('Cache#get', (): void => {
  test('case1 - return a string', async (): Promise<void> => {
    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        cb(null, 'world');
        return true;
      },
      set(key: string, value: string, cb?: Callback<'OK'>): boolean {
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const key = 'hello';

    const value = await client.get<string>(key);

    expect(value).toBe('world');
  });

  test('case2 - return a user object', async (): Promise<void> => {
    const mockUser = {
      name: 'jason',
      gender: 'male',
    };
    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        cb(null, JSON.stringify(mockUser));
        return true;
      },
      set(key: string, value: string, cb?: Callback<'OK'>): boolean {
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const key = 'hello';

    const user = await client.get<User>(key);

    expect(user).toEqual(mockUser);
  });
});

describe('Cache#set', (): void => {
  test('Cache#set - set a string value when life is 0', async (): Promise<void> => {
    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
      set(key: string, value: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        expect(value).toBe('world');
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const value = await client.set('hello', 'world', 0);

    expect(value).toBe('OK');
  });

  test('Cache#set - set a object value when life is 0', async (): Promise<void> => {
    const mockUser: User = {
      name: 'jason',
      gender: 'male',
    };

    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
      set(key: string, value: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        expect(value).toBe('{"name":"jason","gender":"male"}');
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const value = JSON.stringify(mockUser);

    const result = await client.set('hello', value, 0);

    expect(result).toBe('OK');
  });

  test('Cache#set - set a string value when life is not 0', async (): Promise<void> => {
    const mockLife = 5 * 60 * 1000;

    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
      set(key: string, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        expect(seconds).toBe(mockLife);
        expect(value).toBe('world');
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const value = await client.set('hello', 'world', mockLife);

    expect(value).toBe('OK');
  });

  test('Cache#set - set a object value when life is not 0', async (): Promise<void> => {
    const mockUser: User = {
      name: 'jason',
      gender: 'male',
    };

    const mockLife = 5 * 60 * 1000;

    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
      set(key: string, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        expect(seconds).toBe(mockLife);
        expect(value).toBe('{"name":"jason","gender":"male"}');
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const value = JSON.stringify(mockUser);

    const result = await client.set('hello', value, mockLife);

    expect(result).toBe('OK');
  });
});

describe('Cache#caching', (): void => {
  test('Cache#caching - when this.get return a value', async (): Promise<void> => {
    const mockLife = 5 * 60 * 1000;

    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        cb(null, 'OK');
        return true;
      },
      set(key: string, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const fn = async (key: string): Promise<string> => {
      expect(key).toBe('hello');
      return Promise.resolve('Ok');
    };

    const getKey = (...args: any[]): string => {
      expect(args).toEqual(['hello']);
      return args.join();
    };

    const fnAsync: CachingFn<string> = client.caching<string>(fn, mockLife, getKey);

    const result = await fnAsync('hello');

    expect(result).toBe('OK');
  });

  test('Cache#caching - when this.get return null', async (): Promise<void> => {
    const mockLife = 5 * 60 * 1000;

    const mockUser: User = {
      name: 'jason',
      gender: 'male',
    };

    const mockClient = {
      get(key: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        cb(null, null);
        return true;
      },
      set(key: string, value: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        expect(value).toBe('{"name":"jason","gender":"male"}');
        cb(null, 'OK');
        return true;
      },
      setex(key: string, seconds: number, value: string, cb?: Callback<string>): boolean {
        expect(key).toBe('hello');
        expect(seconds).toBe(mockLife);
        expect(value).toBe('{"name":"jason","gender":"male"}');
        cb(null, 'OK');
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const fn = async (key: string): Promise<User> => {
      expect(key).toEqual(['hello']);
      return Promise.resolve(mockUser);
    };

    const getKey = (...args: any[]): string => {
      expect(args).toEqual(['hello']);
      return args.join();
    };

    const fnAsync: CachingFn<string> = client.caching<string>(fn, mockLife, getKey);

    const result = await fnAsync('hello');

    expect(result).toBe(mockUser);
  });
});
