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

import { HttpClient } from '../common/client/index.ts';

/**
 * Interface representing the status of an ORCID work.
 *
 * The `OrcidWorkStatus` interface describes the status of a work, including whether the work
 * belongs to the user (`own`) and any other associated works (`other`).
 */
export interface OrcidWorkStatus {
  /**
   * The put code of a work that belongs to the user.
   */
  own: string | null;

  /**
   * An array of put codes for works that are associated with the user but not owned by them.
   */
  other: string[];
}

/**
 * Base path for orcid resource endpoint.
 */
const API_URL = 'api/orcid/v1/';

/**
 * A service for interacting with ORCID works, including fetching work status and exporting objects.
 *
 * This service allows you to fetch the status of a work by its `objectId` and ORCID, and to export
 * works to ORCID. It can operate in both "member" and "public" modes.
 */
export class OrcidWorkService {
  private client: HttpClient;

  /**
   * Creates an instance of the `OrcidUserService` class.
   * @param client - An instance of `HttpClient` used to send HTTP requests.
   */
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Fetches the status of a work for a specific ORCID and object ID.
   * This method fetches the status of a work (owned by the user or other associated works) using
   * the provided access token, ORCID, and object ID. It can operate in "member" or "public" mode,
   * depending on the `useMember` flag.
   * @param orcid - The ORCID of the user for whom the work status is to be fetched
   * @param objectId - The object ID of the work whose status is being requested
   * @param mode - A flag indicating whether to fetch in "member" mode or "public" mode
   * @returns A promise that resolves to an `OrcidWorkStatus` object containing the status of the work
   * @throws If the fetch operation fails or if the response is not successful
   */
  public fetchWorkStatus = async (
    orcid: string,
    objectId: string,
    mode: 'member' | 'public'
  ): Promise<OrcidWorkStatus> => {
    try {
      return (
        await this.client.get<OrcidWorkStatus>(
          `${API_URL}${mode}/${orcid}/works/object/${objectId}`
        )
      ).data;
    } catch {
      throw new Error(`Failed to fetch work status for ${objectId}.`);
    }
  };

  /**
   * Exports an object to ORCID for a specific user and object ID.
   * This method sends a POST request to export the specified object to ORCID for the provided ORCID.
   * @param orcid - The ORCID of the user to whom the object should be exported
   * @param objectId - The object ID of the work to be exported
   * @returns A promise that resolves when the export operation is completed
   * @throws If the fetch operation fails or if the response is not successful
   */
  public exportObject = async (
    orcid: string,
    objectId: string
  ): Promise<void> => {
    try {
      await this.client.post(
        `${API_URL}member/${orcid}/works/object/${objectId}`
      );
    } catch {
      throw new Error(`Failed to export ${objectId} to ${orcid}.`);
    }
  };
}
