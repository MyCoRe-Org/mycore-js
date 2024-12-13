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

import { MCRCache } from './cache';

/**
 * A memory-based cache implementation that stores values in memory using a `Map` with optional TTL (Time-to-Live).
 *
 * @typeParam T - The type of the cached values. This can be any type, such as `string`, `number`, or more complex objects
 */
class MCRMemoryCache<T> implements MCRCache<T> {
  private cache: Map<string, { value: T; expiry: number | null }>;

  constructor() {
    this.cache  = new Map();
  }

  /**
   * @override
   */
  public set(key: string, value: T, ttl = 0): void {
    const expiry = ttl === 0 ? null : Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
  }

  /**
   * @override
   */
  public get(key: string): T | undefined {
    const cached = this.cache.get(key);
    if (!cached) return undefined;
    if (cached.expiry !== null && cached.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return cached.value;
  }

  /**
   * @override
   */
  public has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    if (cached.expiry !== null && cached.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * @override
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * @override
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * @override
   */
  public size(): number {
    return this.cache.size;
  }
}

export { MCRMemoryCache };
