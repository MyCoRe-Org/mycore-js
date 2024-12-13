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

import { handleError } from '../common/error.ts';
import { createUrl } from '../common/url.ts';

/**
 * Generates the URL for initializing the ORCID OAuth process.
 *
 * @param baseUrl - The base URL for the ORCID OAuth initiation URL
 * @param scope - An optional scope parameter that defines the level of access requested during OAuth authentication
 * @returns The constructed URL for initiating the ORCID OAuth process
 */
export const getOrcidOAuthInitUrl = (
  baseUrl: URL | string,
  scope?: string,
): URL => {
  if (scope) {
    return createUrl(baseUrl, 'rsc/orcid/oauth/init', { 'scope': scope });
  }
  return createUrl(baseUrl, 'rsc/orcid/oauth/init');
};

/**
 * Revokes the OAuth authorization for a given ORCID.
 *
 * @param baseUrl - The base URL to which the revoke request is sent
 * @param accessToken - The access token to authorize the request
 * @param orcid - The ORCID of the user whose OAuth authorization is to be revoked
 * @throws If the fetch operation fails or if the response indicates failure
 * @returns A promise that resolves when the revoke operation is completed successfully
 */
export const revokeOrcidOAuth = async (
  baseUrl: URL | string,
  accessToken: string,
  orcid: string,
): Promise<void> => {
  const url = createUrl(baseUrl, `rsc/orcid/oauth/${orcid}`);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    return handleError(`Error during fetch for ORCID revoke: ${orcid}`, error);
  }
  if (!response.ok) {
    throw new Error(`Failed to revoke ORCID OAuth: ${String(response.status)}`);
  }
};
