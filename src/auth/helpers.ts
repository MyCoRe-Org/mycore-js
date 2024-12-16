/*!
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

import { createUrl, handleError } from '../common/helpers.ts';

interface MCRJWTResponse {
  // deno-lint-ignore camelcase
  login_success: boolean;

  // deno-lint-ignore camelcase
  access_token: string;
}

/**
 * Fetches a JSON Web Token (JWT) from a remote server.
 *
 * @param baseUrl - The base URL of the server from which the JWT will be fetched
 * @param params - Optional query parameters to be included in the request
 *
 * @returns A promise that resolves to a string containing the JWT access token if the login is successful
 *
 * @throws Will throw an error if the fetch operation fails, if the server response is invalid or unexpected,
 *         or if the login attempt fails.
 */
export const fetchAccessToken = async (
  baseUrl: URL | string,
  params?: Record<string, string>,
): Promise<string> => {
  const url = createUrl(baseUrl, 'rsc/jwt', params);
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    return handleError('Error while fetching JWT', error);
  }
  if (!response.ok) {
    throw new Error('Failed to fetch JWT for current user.');
  }
  const result: MCRJWTResponse = await response.json() as MCRJWTResponse;
  if (!result.login_success) {
    throw new Error('Login failed.');
  }
  return result.access_token;
};
