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

import { handleError } from './error.ts';

/**
 * Creates a `URL` object by combining a base URL, a path, query parameters and a fragment.
 *
 * @param baseUrl - The base URL, either as a `URL` object or a string
 * @param path - An optional path to append to the base URL. Defaults to an empty string
 * @param queryParams - An optional object containing key-value pairs for query parameters
 * @param fragment - An optional fragment identifier (the part after `#`) to append to the URL
 *
 * @returns A `URL` object representing the constructed URL.
 *
 * @throws Will throw an error if the `baseUrl` or `path` is invalid.
 */
const createUrl = (
  baseUrl: URL | string,
  path?: string,
  queryParams?: Record<string, string | number>,
  fragment?: string,
): URL => {
  let url;
  try {
    url = path ? new URL(path, baseUrl) : new URL(baseUrl);
  } catch (error) {
    return handleError('Invalid URL input', error);
  }
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });
  }
  if (fragment) {
    url.hash = `#${fragment}`;
  }
  return url;
};

export { createUrl };
