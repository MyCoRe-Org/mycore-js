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
 * Represents a cached item with a value and an expiration timestamp.
 *
 * The `CacheItem` interface is used to store a value along with its expiration information.
 * The value is of a generic type `T`, allowing flexibility for different types of cached data.
 */
export interface CacheItem<T> {
  /**
   * The value of the cached item.
   */
  value: T;

  /**
   * The expiration timestamp of the cached item.
   * If the item does not expire, this will be `null`.
   */
  expiresAt: number | null;
}

/**
 * A generic interface representing a cache with basic CRUD operations and TTL support.
 * @param T - The type of the cached values. This can be any type, such as `string`, `number`, or more complex objects
 */
export interface Cache<T> {
  /**
   * Sets a value in the cache with an optional time-to-live (TTL) in seconds.
   * @param key - The key to associate with the value
   * @param value - The value to store in the cache
   * @param ttl - Optional time-to-live for the cache entry in seconds
   */
  setItem(key: string, value: T, ttl?: number): void;

  /**
   * Retrieves a value from the cache by its key.
   * @param key - The key of the cached value to retrieve
   * @returns The cached value if it exists, or `null` if the key does not exist in the cache
   */
  getItem(key: string): T | null;

  /**
   * Retrieves all items from the cache.
   * @returns The all item of the cache.
   */
  getAllItems(): Record<string, T>;

  /**
   * Checks if a key exists in the cache.
   * @param key - The key to check in the cache
   * @returns `true` if the key exists in the cache, `false` otherwise
   */
  hasItem(key: string): boolean;

  /**
   * Deletes a value from the cache by its key.
   * @param key - The key of the cached value to delete
   */
  deleteItem(key: string): void;

  /**
   * Clears all values from the cache.
   */
  clear(): void;

  /**
   * Gets the number of items currently in the cache.
   * @returns The number of cached items
   */
  size(): number;
}
