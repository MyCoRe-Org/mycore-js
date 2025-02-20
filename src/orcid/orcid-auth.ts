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
 * Generates the URL for initializing the ORCID auth process.
 * @param baseUrl - The base URL for the auth initiation.
 * @param scope - An optional scope parameter that defines the level of access requested during OAuth authentication
 * @returns The constructed URL for initiating the ORCID auth process
 */
export const getOrcidAuthInitUrl = (
  baseUrl: string | URL,
  scope?: string
): URL => {
  const url = new URL('rsc/orcid/oauth/init', baseUrl);
  if (scope) {
    url.searchParams.append('scope', scope);
  }
  return url;
};
