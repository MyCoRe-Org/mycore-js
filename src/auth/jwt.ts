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

/**
 * Represents the response from a JWT (JSON Web Token) authentication request.
 */
interface MCRJWTResponse {
  /**
   * A boolean indicating whether the login was successful.
   * If true, the user has successfully logged in and an access token is provided.
   */
  login_success: boolean;

  /**
   * The access token issued upon successful login.
   * This token is used to authenticate subsequent API requests.
   */
  access_token: string;
}

/**
 * Options for making a JWT request.
 */
export interface MCRJWTRequestOptions {
  /**
   * An optional array of user-specific attributes to include in the JWT request.
   * These attributes can represent custom user data required for authentication.
   */
  userAttributes?: string[];

  /**
   * An optional array of session-specific attributes to include in the JWT request.
   * These attributes can represent session details or context information.
   */
  sessionAttributes?: string[];
}

// TODO use MCRHttpClient?
/**
 * Fetches a JWT (JSON Web Token) from the given base URL, optionally including user and session attributes.
 * This function makes a GET request to the `/rsc/jwt` endpoint and retrieves a JWT token, which can
 * be used for authenticating subsequent API requests. If user or session attributes are provided,
 * they are appended to the URL as query parameters.
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

    const appendQueryParams = (
      url: URL,
      params: string[],
      prefix: string
    ): void => {
      params.forEach(attr => {
        url.searchParams.append(prefix, attr);
      });
    };

    if (options?.userAttributes) {
      appendQueryParams(url, options.userAttributes, 'ua');
    }
    if (options?.sessionAttributes) {
      appendQueryParams(url, options.sessionAttributes, 'sa');
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
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch JWT from ${baseUrl.toString()}: ${error.message}`
      );
    }
    throw new Error(`Unknown error occurred while fetching JWT.`);
  }
};
