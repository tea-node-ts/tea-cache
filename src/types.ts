export interface Caching {
  get<T>(key: string): Promise<T | RedisError>;
  set(key: string, value: string, life: number): Promise<string>;
  caching(fn: Function, life: number, getKey: Function): Function | void;
}

export type RedisError = string | null;
