---
id: sdk-nestjs-cache
title: NestJS SDK Cache utilities
---

<a href="https://www.npmjs.com/package/@multiversx/sdk-nestjs-monitoring" target="_blank"><img src="https://img.shields.io/npm/v/@multiversx/sdk-nestjs-cache.svg" alt="NPM Version" /></a>

[comment]: # (mx-context-auto)

## MultiversX NestJS Microservice Cache Utilities

This package contains a set of utilities commonly used for caching purposes in the MultiversX Microservice ecosystem.

[comment]: # (mx-context-auto)

## Installation

`sdk-nestjs-cache` is delivered via **npm** and it can be installed as follows:

```bash
npm install @multiversx/sdk-nestjs-cache
```

[comment]: # (mx-context-auto)

## Utility

The package exports two services: an **in-memory cache service** and **remote cache service**.

[comment]: # (mx-context-auto)

## Table of contents

- [In Memory Cache](#in-memory-cache) - super fast in-memory caching system based on [LRU cache](https://www.npmjs.com/package/lru-cache)
- [Redis Cache](#redis-cache) - Caching system based on [Redis](https://www.npmjs.com/package/@multiversx/sdk-nestjs-redis)
- [Cache Service](#cache-service) - MultiversX caching system which combines in-memory and Redis cache, forming a two-layer caching system

[comment]: # (mx-context-auto)

## In memory cache

In memory cache, available through `InMemoryCacheService`, is used to read and write data from and into the memory storage of your Node.js instance.

*Note that if you have multiple instances of your application you must sync the local cache across all your instances.*

Let's take as an example a `ConfigService` that loads some non-crucial configuration from the database and can be cached for 10 seconds.

Usage example:

```typescript
import { Injectable } from '@nestjs/common';
import { InMemoryCacheService } from '@multiversx/sdk-nestjs-cache';

@Injectable()
export class ConfigService {
  constructor(
    private readonly inMemoryCacheService: InMemoryCacheService
  ){}

  async loadConfiguration(){
    return await this.inMemoryCacheService.getOrSet(
      'configurationKey',
      () => this.getConfigurationFromDb(),
      10, // 10 seconds
    )
  }

  private async getConfigurationFromDb(){
    // fetch configuration from db
  }
}
```

When the `.loadConfiguration()` method is called for the first time, the `.getConfigurationFromDb()` method will be executed and the value returned from it will be set in cache with `configurationKey` key. If another `.loadConfiguration()` call comes in 10 seconds interval, the data will be returned from cache and `.getConfigurationFromDb()` will not be executed again.

[comment]: # (mx-context-auto)

### In memory cache methods

[comment]: # (mx-context-auto)

#### `.get<T>(key: string): Promise<T | undefined>`

- **Parameters:**
  - `key`: The key of the item to retrieve from the cache.
- **Returns:** A `Promise` that resolves to the cached value or `undefined` if the key is not present.

[comment]: # (mx-context-auto)

#### `.getMany<T>(keys: string[]): Promise<(T | undefined)[]>`

- **Parameters:**
  - `keys`: An array of keys to retrieve from the cache.
- **Returns:** A `Promise` that resolves to an array of cached values corresponding to the provided keys.

[comment]: # (mx-context-auto)

#### `.set<T>(key: string, value: T, ttl: number, cacheNullable?: boolean): void`

- **Parameters:**
  - `key`: The key under which to store the value.
  - `value`: The value to store in the cache.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

[comment]: # (mx-context-auto)

#### `.setMany<T>(keys: string[], values: T[], ttl: number, cacheNullable?: boolean): Promise<void>`

- **Parameters:**
  - `keys`: An array of keys under which to store the values.
  - `values`: An array of values to store in the cache.
  - `ttl`: Time-to-live for the cached items in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

[comment]: # (mx-context-auto)

#### `.delete(key: string): Promise<void>`

- **Parameters:**
  - `key`: The key of the item to delete from the cache.
- **Returns:** A `Promise` that resolves when the item is successfully deleted.

[comment]: # (mx-context-auto)

#### `.getOrSet<T>(key: string, createValueFunc: () => Promise<T>, ttl: number, cacheNullable?: boolean): Promise<T>`

- **Parameters:**
  - `key`: The key of the item to retrieve or create.
  - `createValueFunc`: A function that creates the value if the key is not present in the cache.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`
- **Returns:** A `Promise` that resolves to the cached or newly created value.

[comment]: # (mx-context-auto)

#### `.setOrUpdate<T>(key: string, createValueFunc: () => Promise<T>, ttl: number, cacheNullable?: boolean): Promise<T>`

- **Parameters:**
  - `key`: The key of the item to update or create.
  - `createValueFunc`: A function that creates the new value for the key.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`
- **Returns:** A `Promise` that resolves to the updated or newly created value.

[comment]: # (mx-context-auto)

## Redis Cache

Redis cache, available through `RedisCacheService`, is a caching system build on top of Redis. It is used as a shared cache among multiple microservices.

Let's build the same config loader class but with data shared across multiple clusters using Redis. The implementation is almost identical since both `InMemoryCache` and `RedisCache` have similar class structure.

Usage example:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '@multiversx/sdk-nestjs-cache';

@Injectable()
export class ConfigService {
 constructor(
    private readonly redisCacheService: RedisCacheService,
  ){}

  async loadConfiguration(){
    return await this.redisCacheService.getOrSet(
      'configurationKey',
      () => this.getConfigurationFromDb(),
      10,
    );
  }

  private async getConfigurationFromDb(){
    // fetch configuration from db
  }
}

```

[comment]: # (mx-context-auto)

### Redis cache methods

[comment]: # (mx-context-auto)

#### `get<T>(key: string): Promise<T | undefined>`

- **Parameters:**
  - `key`: The key of the item to retrieve.
- **Returns:** A `Promise` that resolves to the cached value or `undefined` if the key is not found.

[comment]: # (mx-context-auto)

#### `getMany<T>(keys: string[]): Promise<(T | undefined | null)[]>`

- **Parameters:**
  - `keys`: An array of keys to retrieve.
- **Returns:** A `Promise` that resolves to an array of cached values corresponding to the input keys. Values may be `undefined` or `null` if not found.

[comment]: # (mx-context-auto)

#### `set<T>(key: string, value: T, ttl: number, cacheNullable?: boolean): void`

- **Parameters:**
  - `key`: The key under which to store the value.
  - `value`: The value to store in the cache.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

[comment]: # (mx-context-auto)

#### `setMany<T>(keys: string[], values: T[], ttl: number, cacheNullable?: boolean): void`

- **Parameters:**
  - `keys`: An array of keys for the items to update or create.
  - `values`: An array of values to set in the cache.
  - `ttl`: Time-to-live for the cached items in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

[comment]: # (mx-context-auto)

#### `delete(key: string): void`

- **Parameters:**
  - `key`: The key of the item to delete.
- **Returns:** A `Promise` that resolves when the item is successfully deleted from the cache.

[comment]: # (mx-context-auto)

#### `getOrSet<T>(key: string, createValueFunc: () => Promise<T>, ttl: number, cacheNullable?: boolean): Promise<T>`

- **Parameters:**
  - `key`: The key of the item to retrieve or create.
  - `createValueFunc`: A function that creates the new value for the key.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

**Note:** These are just some of the methods available in the `RedisCacheService` class.

[comment]: # (mx-context-auto)

## Cache Service

Cache service is using both [In Memory Cache](#in-memory-cache) and [Redis Cache](#redis-cache) to form a two-layer caching system.

Usage example:

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '@multiversx/sdk-nestjs-cache';

@Injectable()
export class ConfigService {
 constructor(
    private readonly cacheService: CacheService,
  ){}

  async loadConfiguration(){
    return await this.cacheService.getOrSet(
      'configurationKey',
      () => this.getConfigurationFromDb(),
      5, // in memory TTL
      10, // redis TTL
    );
  }

  private async getConfigurationFromDb(){
    // fetch configuration from db
  }
}
```

Whenever `.loadConfigurationMethod()` is called, the service will first look into the in memory cache if there is a value stored for the specified key and return it. If the value is not found in the in memory cache it will look for the same key in Redis cache and return it if found. If the value is not found in Redis, the `.getConfigurationFromDb()` method is called and the returned value is stored in memory for 5 seconds (the TTL provided in the third parameter) and in Redis for 10 seconds (the value provided in the fourth parameter).

*Note: we usually use smaller TTL for in memory cache because when it comes to in memory cache it takes longer to synchronize all instances and it is better to fall back to Redis and lose a bit of reading speed than to have inconsistent data.*

All methods from `CacheService` use the two layer caching system except the ones that contains `local` and `remote` in their name. Those methods refer strictly to in memory cache and Redis cache.

Examples:

- `.getLocal()`, `.setLocal()`, `.getOrSetLocal()` are the same methods as [In Memory Cache](#in-memory-cache)
- `.getRemote()`, `.setRemove()`, `.getOrSetRemove()` are the same methods as [Redis Cache](#redis-cache)

[comment]: # (mx-context-auto)

### Cache service methods

[comment]: # (mx-context-auto)

#### `get<T>(key: string): Promise<T | undefined>`

- **Parameters:**
  - `key`: The key of the item to retrieve. The method first checks the local in-memory cache, and if not found, it retrieves the value from the Redis cache.
- **Returns:** A `Promise` that resolves to the cached value or `undefined` if the key is not found.

[comment]: # (mx-context-auto)

#### `getMany<T>(keys: string[]): Promise<(T | undefined)[]>`

- **Parameters:**
  - `keys`: An array of keys to retrieve. The method first checks the local in-memory cache, and for missing keys, it retrieves values from the Redis cache.
- **Returns:** A `Promise` that resolves to an array of cached values corresponding to the input keys. Values may be `undefined` if not found.

[comment]: # (mx-context-auto)

#### `set<T>(key: string, value: T, ttl: number, cacheNullable?: boolean): Promise<void>`

- **Parameters:**
  - `key`: The key under which to store the value. The method sets the value in both the local in-memory cache and the Redis cache.
  - `value`: The value to store in the cache.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

[comment]: # (mx-context-auto)

#### `setMany<T>(keys: string[], values: T[], ttl: number, cacheNullable?: boolean): Promise<void>`

- **Parameters:**
  - `keys`: An array of keys for the items to update or create. The method sets values in both the local in-memory cache and the Redis cache.
  - `values`: An array of values to set in the cache.
  - `ttl`: Time-to-live for the cached items in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

[comment]: # (mx-context-auto)

#### `delete(key: string): Promise<void>`

- **Parameters:**
  - `key`: The key of the item to delete. The method deletes the item from both the local in-memory cache and the Redis cache.
- **Returns:** A `Promise` that resolves when the item is successfully deleted from both caches.

[comment]: # (mx-context-auto)

#### `deleteMany(keys: string[]): Promise<void>`

- **Parameters:**
  - `keys`: An array of keys for the items to delete. The method deletes items from both the local in-memory cache and the Redis cache.
- **Returns:** A `Promise` that resolves when all items are successfully deleted from both caches.

[comment]: # (mx-context-auto)

#### `getOrSet<T>(key: string, createValueFunc: () => Promise<T>, ttl: number, cacheNullable?: boolean): Promise<T>`

- **Parameters:**
  - `key`: The key of the item to retrieve or create. The method first checks the local in-memory cache, and if not found, it retrieves the value from the Redis cache or creates it using the provided function.
  - `createValueFunc`: A function that creates the new value for the key.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values. Default: `true`

... (and many more)

**Note:** These are just some of the methods available in the `CacheService` class. For a comprehensive list of methods and their descriptions, refer to the class implementation.
