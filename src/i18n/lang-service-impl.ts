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

import { MCRLangService } from './lang-service';
import { MCRCache } from '../common/cache/cache';
import { MCRMemoryCache } from '../common/cache/memory-cache';

/**
 * Implementation of the `MCRLangService` interface that provides language translation functionality.
 *
 * This class uses a specified base URL to fetch translations, and stores them in a cache for better performance.
 * The class supports an optional in-memory cache implementation, but it can also accept any custom cache that implements the `MCRCache` interface.
 */
class MCRLangServiceImpl implements MCRLangService {
  private baseUrl: URL;

  private lang: string;

  private cache: MCRCache<string>;

  /**
   * Creates an instance of the `MCRLangServiceImpl` class.
   *
   * The constructor accepts a base URL, language, and an optional cache implementation. If no cache is provided,
   * an in-memory cache (`MCRMemoryCache`) will be used by default.
   *
   * @param baseUrl - The base URL for the translation service
   * @param lang - The language code (e.g., 'en', 'de', etc.) used for translations
   * @param cache - An optional cache implementation that adheres to the `MCRCache` interface
   */
  constructor(
    baseUrl: URL | string,
    lang: string,
    cache: MCRCache<string> = new MCRMemoryCache<string>()
  ) {
    this.baseUrl = new URL(baseUrl);
    this.lang = lang;
    this.cache = cache;
  }

  /**
   * Fetches and caches translation data for a given prefix and stores it in the cache.
   *
   * @param prefix - The prefix used to fetch the translations
   * @throws If the translation fetch operation fails, an error is thrown indicating the failure and the prefix
   * @returns A promise that resolves once the translations have been fetched and stored in the cache
   */
  public cacheTranslations = async (prefix: string): Promise<void> => {
    let translationData: Record<string, string>;
    try {
      translationData = await this.fetchTranslations(prefix);
    } catch (error) {
      throw new Error(`Failed to fetch properties for prefix ${prefix}: ${error as string}`);
    }
    Object.entries(translationData).forEach(([key, translation]: [string, string]) => {
      this.cache.set(this.getLangKey(key), translation);
    });
  };

  /**
   * @override
   */
  public translate = async (
    key: string,
    params?: Record<string, string | number>
  ): Promise<string> => {
    let translation = null;
    if (this.cache.has(this.getLangKey(key))) {
      translation = this.cache.get(key);
    } else {
      try {
        const translationData = await this.fetchTranslations(key);
        if (translationData[key]) {
          translation = key;
          this.cache.set(this.getLangKey(key), translationData[key]);
        }
      } catch (error) {
        console.error(`Error while fetching key ${key}`, error);
      }
    }
    if (!translation) {
      return `??${key}??`;
    }
    if (!params) {
      return translation;
    }
    return this.replacePlaceholders(translation, params);
  };

  /**
   * @override
   */
  public get currentLang(): string {
    return this.lang;
  };

  /**
   * Sets the current language for translations.
   *
   * @param newLang - The language code (e.g., 'en', 'de', etc.) to be set as the current language
   */
  public set currentLang(newLang: string) {
    this.lang = newLang;
  };

  private replacePlaceholders(translation: string, params: Record<string, string | number>) {
   return translation.replace(/{(\w+)}/g, (match: string, placeholder: string) => {
      if (placeholder in params) {
        return String(params[placeholder] ?? match);
      }
      return match;
    });
  };

  private fetchTranslations = async (prefix: string): Promise<Record<string, string>> => {
    let response: Response;
    try {
      response = await fetch(new URL(`rsc/locale/translate/${this.lang}/${prefix}`, this.baseUrl));
    } catch {
      throw new Error('Network error occurred');
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch props for ${prefix}. Status: ${String(response.status)}`);
    }
    return await response.json() as Record<string, string>;
  };

  private getLangKey = (key: string): string => {
    return `${this.lang}_${key}`;
  };
}

export { MCRLangServiceImpl };
