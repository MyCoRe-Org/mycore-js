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

import { HttpClient } from '../common/client/index.ts';

/**
 * Interface representing the status of an ORCID user.
 */
export interface OrcidUserStatus {
  /**
   * An array of ORCID identifiers associated with the user.
   */
  orcids: string[];

  /**
   * An array of trusted ORCID identifiers.
   */
  trustedOrcids: string[];
}

/**
 * Interface representing the settings for an ORCID user.
 */
export interface OrcidUserSettings {
  /**
   * Indicates whether the system should always update the user's works in ORCID profile.
   */
  isAlwaysUpdateWork: boolean | null;

  /**
   * Indicates whether the system should allow the creation of duplicate works in ORCID profile.
   */
  isCreateDuplicateWork: boolean | null;

  /**
   * Indicates whether the system should allow the creation of the user's first work in ORCID  profile.
   */
  isCreateFirstWork: boolean | null;

  /**
   * Indicates whether the system should recreate deleted works in ORCID.
   */
  isRecreateDeletedWork: boolean | null;
}

/**
 * Base path for orcid resource endpoint.
 */
const API_URL = 'api/orcid/v1/';

/**
 * Service for interacting with ORCID user status and settings.
 */
export class OrcidUserService {
  private client: HttpClient;

  /**
   * Creates an instance of the `OrcidUserService` class.
   * @param client - An instance of `HttpClient` used to send HTTP requests.
   */
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Retrieves the ORCID user status.
   * This method retrieves the status of the ORCID user, such as whether they are connected
   * or if their account has any issues.
   * @returns A `Promise` that resolves to the ORCID user status.
   * @throws An error if the request fails or the status cannot be retrieved.
   */
  public getUserStatus = async (): Promise<OrcidUserStatus> => {
    try {
      return (await this.client.get<OrcidUserStatus>(`${API_URL}user-status`))
        .data;
    } catch {
      throw new Error(`Failed to fetch Orcid user status}`);
    }
  };

  public revokeAuth = async (orcid: string): Promise<void> => {
    try {
      await this.client.delete(`rsc/orcid/oauth/${orcid}`);
    } catch {
      throw new Error(`Failed to revoke ORCID`);
    }
  };

  /**
   * Retrieves the ORCID user settings for a specific user.
   * This method retrieves settings for a specific ORCID user, identified by the ORCID identifier.
   * @param orcid - The ORCID identifier of the user whose settings are to be fetched.
   * @returns A `Promise` that resolves to the ORCID user settings.
   * @throws An error if the request fails or the settings cannot be retrieved.
   */
  public getUserSettings = async (
    orcid: string
  ): Promise<OrcidUserSettings> => {
    try {
      return (
        await this.client.get<OrcidUserSettings>(
          `${API_URL}user-properties/${orcid}`
        )
      ).data;
    } catch {
      throw new Error(`Failed to fetch ORCID user settings for ${orcid}.`);
    }
  };

  /**
   * Updates the ORCID user settings for a specific user.
   * This method updates the settings for the specified ORCID user with new provided settings.
   * @param orcid - The ORCID identifier of the user whose settings are to be updated.
   * @param settings - The updated settings to be applied for the ORCID user.
   * @returns A `Promise` that resolves once the settings have been successfully updated.
   * @throws An error if the request fails or the settings cannot be updated.
   */
  public updateUserSettings = async (
    orcid: string,
    settings: OrcidUserSettings
  ): Promise<void> => {
    try {
      await this.client.put(`${API_URL}user-properties/${orcid}`, settings);
    } catch {
      throw new Error(`Failed to update ORCID user settings for ${orcid}.`);
    }
  };
}
