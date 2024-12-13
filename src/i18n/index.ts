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
 * This module contains i18n functionalities.
 */

const BASE_PATH = 'rsc/locale';

const getTranslationPath = (name: string, lang?: string): string => {
  return `${BASE_PATH}/translate/${lang ? `${lang}/` : ''}${name}`;
};

/**
 * Returns the current language in ISO 639 (two character) format.
 *
 * @param baseUrl - The base URL or URL object.
 * @returns A promise that resolves the current language.
 */
export const getCurrentLanguage = async (
  baseUrl: string | URL
): Promise<string> => {
  const url = new URL(`${BASE_PATH}/language`, baseUrl);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load current language');
  }
  return await response.text();
};

/**
 * Returns the current language in ISO 639 (two character) format.
 *
 * @param baseUrl - The base URL or URL object.
 * @returns A promise that resolves an array of all available languages.
 */
export const getLanguages = async (
  baseUrl: string | URL
): Promise<string[]> => {
  const url = new URL(`${BASE_PATH}/languages`, baseUrl);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load languages');
  }
  return (await response.json()) as string[];
};

/**
 * Fetches a collection of translations from the given base URL and language.
 *
 * @param baseUrl - The base URL or URL object.
 * @param prefix - The prefix for the translation.
 * @param lang - (Optional) The language code for the translations (e.g., 'en', 'de'). If not provided, the default language will be used.
 * @returns A promise that resolves to an object containing key-value pairs for translations.
 * @throws An error if the response is not successful (non-2xx HTTP status).
 */
export const getTranslations = async (
  baseUrl: string | URL,
  prefix: string,
  lang?: string
): Promise<Record<string, string>> => {
  const url = new URL(getTranslationPath(prefix, lang), baseUrl);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load translations');
  }
  return (await response.json()) as Record<string, string>;
};

/**
 * Fetches a single translation for a given name from the specified base URL and language.
 *
 * @param baseUrl - The base URL or URL object.
 * @param name - The name or key of the translation (e.g., a specific word or phrase).
 * @param lang - (Optional) The language code for the translation (e.g., 'en', 'de'). If not provided, the default language will be used.
 * @returns A promise that resolves to the translation as a string.
 * @throws An error if the response is not successful (non-2xx HTTP status).
 */
export const getTranslation = async (
  baseUrl: string | URL,
  name: string,
  lang?: string
): Promise<string> => {
  const url = new URL(getTranslationPath(name, lang), baseUrl);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load translation');
  }
  return await response.text();
};
