/*
 * This file is part of ***  M y C o R e  ***
 * See https://www.mycore.de/ for details.
 *
 * MyCoRe is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MyCoRe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MyCoRe.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Cache, CacheItem } from './cache';

/**
 * Abstract class representing a cache storage using the browser's Storage API.
 * Implements the `Cache` interface for caching items with optional expiration times.
 * @param T - The type of value stored in the cache.
 */
export abstract class StorageCache<T> implements Cache<T> {
  private storage: Storage;

  /**
   * Creates an instance of `StorageCache`.
   * @param storage - The Storage instance (`localStorage` or `sessionStorage`) to use for caching.
   */
  constructor(storage: Storage) {
    this.storage = storage;
  }

  public setItem(key: string, value: T, ttl = 0): void {
    const expiresAt = ttl === 0 ? null : Date.now() + ttl * 1000;
    this.storage.setItem(key, JSON.stringify({ value, expiresAt }));
  }

  public getItem(key: string): T | null {
    const rawCachedItem = this.storage.getItem(key);
    if (!rawCachedItem) {
      return null;
    }
    const cachedItem = JSON.parse(rawCachedItem) as CacheItem<T>;
    if (cachedItem.expiresAt !== null && cachedItem.expiresAt < Date.now()) {
      this.storage.removeItem(key);
      return null;
    }
    return cachedItem.value;
  }

  getAllItems(): Record<string, T> {
    const result: Record<string, T> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = this.getItem(key);
        if (value) {
          result[key] = value;
        }
      }
    }
    return result;
  }

  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  deleteItem(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  size(): number {
    return this.storage.length;
  }
}
