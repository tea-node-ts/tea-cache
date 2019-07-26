/* eslint-disable no-undef */
import Cache from '../src/index';
import { RedisClient, Callback, OverloadedCommand } from 'redis';
import { User } from './types';
import { stringLiteral } from '@babel/types';

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
      del(): boolean {
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
      del(): boolean {
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
      del(): boolean {
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
      del(): boolean {
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
      del(): boolean {
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
      del(): boolean {
        return true;
      },
    };

    const client = new Cache(mockClient as RedisClient);

    const value = JSON.stringify(mockUser);

    const result = await client.set('hello', value, mockLife);

    expect(result).toBe('OK');
  });
});
