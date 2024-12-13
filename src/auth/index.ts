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

interface MCRJWTResponse {
  login_success: boolean;
  access_token: string;
}

/**
 * Options for making a JWT request.
 */
export interface MCRJWTRequestOptions {
  userAttributes?: string[];
  sessionAttributes?: string[];
}

// TODO use MCRHttpClient?
/**
 * Fetches a JWT token from the given base URL with optional user and session attributes.
 *
 * @param baseUrl - The base URL to make the JWT request to.
 * @param options - The options containing user and session attributes (optional).
 * @returns A promise that resolves with the JWT access token if the login is successful.
 * @throws An error if the request fails or if the login is unsuccessful.
 */
export const fetchJWT = async (
  baseUrl: string | URL,
  options?: MCRJWTRequestOptions
): Promise<string> => {
  try {
    const url = new URL('rsc/jwt', baseUrl);
    if (options?.userAttributes) {
      options.userAttributes.forEach(attr => {
        url.searchParams.append('ua', attr);
      });
    }
    if (options?.sessionAttributes) {
      options.sessionAttributes.forEach(attr => {
        url.searchParams.append('sa', attr);
      });
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Unauthorized or invalid token');
    }
    const result: MCRJWTResponse = (await response.json()) as MCRJWTResponse;
    if (!result.login_success) {
      throw new Error('Login failed');
    }
    return result.access_token;
  } catch (error) {
    throw new Error(`Failed to fetch JWT: ${(error as Error).message}`);
  }
};
