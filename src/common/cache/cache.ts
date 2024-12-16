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

/**
 * A generic interface representing a cache with basic CRUD operations and TTL support.
 *
 * @typeParam T - The type of the cached values. This can be any type, such as `string`, `number`, or more complex objects
 */
export interface MCRCache<T> {
  /**
   * Sets a value in the cache with an optional time-to-live (TTL) in seconds.
   *
   * @param key - The key to associate with the value
   * @param value - The value to store in the cache
   * @param ttl - Optional time-to-live for the cache entry in seconds
   */
  set(key: string, value: T, ttl?: number): void;

  /**
   * Retrieves a value from the cache by its key.
   *
   * @param key - The key of the cached value to retrieve
   * @returns The cached value if it exists, or `undefined` if the key does not exist in the cache
   */
  get(key: string): T | undefined;

  /**
   * Checks if a key exists in the cache.
   *
   * @param key - The key to check in the cache
   * @returns `true` if the key exists in the cache, `false` otherwise
   */
  has(key: string): boolean;

  /**
   * Deletes a value from the cache by its key.
   *
   * @param key - The key of the cached value to delete
   */
  delete(key: string): void;

  /**
   * Clears all values from the cache.
   */
  clear(): void;

  /**
   * Gets the number of items currently in the cache.
   *
   * @returns The number of cached items
   */
  size(): number;
}
