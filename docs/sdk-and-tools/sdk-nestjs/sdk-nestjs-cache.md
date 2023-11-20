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

```
npm install @multiversx/sdk-nestjs-cache
```

[comment]: # (mx-context-auto)

## Utility
The package exports **in memory cache service** and **remote cache service**.

[comment]: # (mx-context-auto)

## In memory cache
In memory cache is used to read and write data from and into the memory storage of your Node.js instance.

*Note that if you have multiple instances of you application you must sync local cache across all your instances.*

Lets take as an example a ConfigService which loads some non crucial configuration from database and can be cached for 10 seconds. 

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
      10 * 1000 
    )
  }

  private async getConfigurationFromDb(){
    // fetch configuration from db
  }
}
```
When the `.loadConfiguration()` method is called for the first time, the `.getConfigurationFromDb()` method will be executed and the value returned from it will be set in cache under `configurationKey` key. If another `.loadConfiguration()` call comes in 10 seconds interval, the data will be returned from cache and `.getConfigurationFromDb()` will not be executed again.

[comment]: # (mx-context-auto)

### Methods

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
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values.

[comment]: # (mx-context-auto)

#### `.setMany<T>(keys: string[], values: T[], ttl: number, cacheNullable?: boolean): Promise<void>`

- **Parameters:**
  - `keys`: An array of keys under which to store the values.
  - `values`: An array of values to store in the cache.
  - `ttl`: Time-to-live for the cached items in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values.

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
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values.
- **Returns:** A `Promise` that resolves to the cached or newly created value.

[comment]: # (mx-context-auto)

#### `.setOrUpdate<T>(key: string, createValueFunc: () => Promise<T>, ttl: number, cacheNullable?: boolean): Promise<T>`

- **Parameters:**
  - `key`: The key of the item to update or create.
  - `createValueFunc`: A function that creates the new value for the key.
  - `ttl`: Time-to-live for the cached item in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values.
- **Returns:** A `Promise` that resolves to the updated or newly created value.

[comment]: # (mx-context-auto)

## Redis Cache
Redis cache is a caching system build ontop of Reids. It is used to share cache related information among multiple microservices.

Usage example:

```typescript
import {} from '
```

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
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values.

[comment]: # (mx-context-auto)

#### `setMany<T>(keys: string[], values: T[], ttl: number, cacheNullable?: boolean): void`

- **Parameters:**
  - `keys`: An array of keys for the items to update or create.
  - `values`: An array of values to set in the cache.
  - `ttl`: Time-to-live for the cached items in seconds.
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values.

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
  - `cacheNullable` (optional): If set to `false`, the method will not cache null or undefined values.

**Note:** These are just some of the methods available in the `RedisCacheService` class.

