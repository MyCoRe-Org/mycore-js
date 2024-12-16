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

import { handleError } from '../common/error.ts';

/**
 * Interface representing the status of an ORCID work.
 *
 * The `MCROrcidWorkStatus` interface describes the status of a work, including whether the work
 * belongs to the user (`own`) and any other associated works (`other`).
 */
export interface MCROrcidWorkStatus {
  /**
   * The put code string of the work owned by the user.
   * If no status is available, this will be `null`.
   */
  own: string | null;

  /**
   * A list of put code string for other works associated with the user.
   */
  other: string[];
}

/**
 * A service for interacting with ORCID works, including fetching work status and exporting objects.
 *
 * This service allows you to fetch the status of a work by its `objectId` and ORCID, and to export
 * works to ORCID. It can operate in both "member" and "public" modes.
 */
export class MCROrcidWorkService {
  private baseUrl: URL;

  /**
   * Creates an instance of the MCROrcidWorkService.
   *
   * @param baseUrl - The base URL to be used for making API requests to the ORCID service.
   */
  constructor(baseUrl: URL | string) {
    this.baseUrl = new URL(baseUrl);
  }

  /**
   * Fetches the status of a work for a specific ORCID and object ID.
   *
   * This method fetches the status of a work (owned by the user or other associated works) using
   * the provided access token, ORCID, and object ID. It can operate in "member" or "public" mode,
   * depending on the `useMember` flag.
   *
   * @param accessToken - The access token to authorize the request
   * @param orcid - The ORCID of the user for whom the work status is to be fetched
   * @param objectId - The object ID of the work whose status is being requested
   * @param useMember - A boolean flag indicating whether to fetch in "member" mode (`true`) or "public" mode (`false`)
   * @returns A promise that resolves to an `MCROrcidWorkStatus` object containing the status of the work
   * @throws If the fetch operation fails or if the response is not successful
   */
  public fetchWorkStatus = async (
    accessToken: string,
    orcid: string,
    objectId: string,
    useMember = false,
  ): Promise<MCROrcidWorkStatus> => {
    const mode = useMember ? 'member' : 'public';
    const url = new URL(
      `api/orcid/v1/${mode}/${orcid}/works/object/${objectId}`,
      this.baseUrl,
    );
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      return handleError('Failed to fetch work status', error);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch work status for ${objectId}.`);
    }
    return await response.json() as MCROrcidWorkStatus;
  };

  /**
   * Exports an object to ORCID for a specific user and object ID.
   *
   * This method sends a POST request to export the specified object to ORCID for the provided ORCID.
   * It requires an OAuth access token for authorization.
   *
   * @param accessToken - The access token to authorize the request
   * @param orcid - The ORCID of the user to whom the object should be exported
   * @param objectId - The object ID of the work to be exported
   * @returns A promise that resolves when the export operation is completed
   * @throws If the fetch operation fails or if the response is not successful
   */
  public exportObjectToOrcid = async (
    accessToken: string,
    orcid: string,
    objectId: string,
  ): Promise<void> => {
    const url = new URL(
      `api/orcid/v1/member/${orcid}/works/object/${objectId}`,
      this.baseUrl,
    );
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      return handleError('Failed to request export', error);
    }
    if (!response.ok) {
      throw new Error(`Failed to export ${objectId} to ${orcid}.`);
    }
  };
}
