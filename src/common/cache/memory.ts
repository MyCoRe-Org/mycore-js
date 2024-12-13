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

import { MCRCache, MCRCacheItem } from './cache';

/**
 * In-memory cache implementation using a Map.
 * Implements the MCRCache interface for caching items with optional expiration times.
 *
 * @param T - The type of value stored in the cache.
 */
export class MCRMemoryCache<T> implements MCRCache<T> {
  private map: Map<string, MCRCacheItem<T>>;

  /**
   * Creates an instance of MCRMemoryCache.
   */
  constructor() {
    this.map = new Map<string, MCRCacheItem<T>>();
  }

  /**
   * @override
   */
  public setItem(key: string, value: T, ttl = 0): void {
    const expiresAt = ttl === 0 ? null : Date.now() + ttl * 1000;
    this.map.set(key, { value, expiresAt });
  }

  /**
   * @override
   */
  public getItem(key: string): T | null {
    const cachedItem = this.map.get(key);
    if (!cachedItem) {
      return null;
    }
    if (cachedItem.expiresAt !== null && cachedItem.expiresAt < Date.now()) {
      this.map.delete(key);
      return null;
    }
    return cachedItem.value;
  }

  /**
   * @override
   */
  getAllItems(): Record<string, T> {
    const result: Record<string, T> = {};
    this.map.forEach((item, key) => {
      if (item.expiresAt !== null && item.expiresAt < Date.now()) {
        result[key] = item.value;
      }
    });
    return result;
  }

  /**
   * @override
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * @override
   */
  deleteItem(key: string): void {
    this.map.delete(key);
  }

  /**
   * @override
   */
  clear(): void {
    this.map.clear();
  }

  /**
   * @override
   */
  size(): number {
    return this.map.size;
  }
}
