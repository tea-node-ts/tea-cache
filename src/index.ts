import { promisify } from 'util';
import { RedisClient } from 'redis';
import { isFunction, isNumber } from 'lodash';
import { Caching, RedisError, CachingFn } from './types';

/* global Promise */
class Cache implements Caching {
  private client: RedisClient;

  private getAsync: Function;

  private setAsync: Function;

  private setexAsync: Function;

  public constructor(client: RedisClient) {
    this.client = client;

    this.getAsync = promisify(this.client.get).bind(this.client);

    this.setAsync = promisify(this.client.set).bind(this.client);

    this.setexAsync = promisify(this.client.setex).bind(this.client);
  }

  public async get<T>(key: string): Promise<T | RedisError> {
    const value: string = await this.getAsync(key);

    let v: T | RedisError;

    if (value) {
      try {
        v = JSON.parse(value);
      } catch (error) {
        v = value;
      }
    }

    return Promise.resolve(v);
  }

  public async set(key: string, value: string, life: number): Promise<string> {
    if (life === 0) {
      const v = await this.setAsync(key, value);
      return Promise.resolve(v);
    }

    const v = await this.setexAsync(key, life, value);

    return Promise.resolve(v);
  }

  public caching<T>(fn: Function, life: number, getKey: Function): CachingFn<T> {
    if (!isFunction(fn)) throw Error('The first argument must be a function');
    if (!isNumber(life)) throw Error('The second argument must be a number and great then 0');
    if (!isFunction(getKey)) throw Error('The third argument must be a function');

    return async (...args: any[]): Promise<T | RedisError> => {
      const key = getKey(...args);

      const data: T | RedisError = await this.get<T>(key);

      if (data) return Promise.resolve(data);

      const res: T = await fn(args);

      await this.set(key, JSON.stringify(res), life);

      return Promise.resolve(res);
    };
  }
}

export default Cache;
