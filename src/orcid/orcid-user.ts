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

import { handleError } from '../common/helpers.ts';

/**
 * Interface representing the status of an ORCID user.
 */
export interface MCROrcidUserStatus {
  /**
   * A list of ORCIDs associated with the user.
   */
  orcids: string[];

  /**
   * A list of trusted ORCIDs associated with the user.
   */
  trustedOrcids: string[];
}

/**
 * Interface representing the settings for an ORCID user.
 */
export interface MCROrcidUserSettings {
  /**
   * A flag indicating if works should always be updated.
   * `null` means that no preference has been set.
   */
  isAlwaysUpdateWork: boolean | null;

  /**
   * A flag indicating if duplicate works should be created.
   * `null` means that no preference has been set.
   */
  isCreateDuplicateWork: boolean | null;

  /**
   * A flag indicating if the first work should be created.
   * `null` means that no preference has been set.
   */
  isCreateFirstWork: boolean | null;

  /**
   * A flag indicating if deleted works should be recreated.
   * `null` means that no preference has been set.
   */
  isRecreateDeletedWork: boolean | null;
}

/**
 * Service for interacting with ORCID user status and settings.
 */
export class MCROrcidUserService {
  private baseUrl: URL;

  /**
   * Creates an instance of the MCROrcidUserService.
   *
   * @param baseUrl - The base URL to be used for making API requests to the ORCID service
   */
  constructor(baseUrl: URL) {
    this.baseUrl = new URL(baseUrl);
  }

  /**
   * Fetches the status of the ORCID user.
   *
   * @param accessToken - The access token to authorize the request
   * @returns A promise that resolves to an `MCROrcidUserStatus` object containing the user status
   * @throws If the fetch operation fails or if the response is not successful
   */
  public fetchOrcidUserStatus = async (
    accessToken: string,
  ): Promise<MCROrcidUserStatus> => {
    let response: Response;
    try {
      response = await fetch(
        new URL('api/orcid/v1/user-status', this.baseUrl),
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
    } catch (error) {
      return handleError('Error while fetching Orcid user status', error);
    }
    if (!response.ok) {
      throw new Error(
        `Failed to fetch Orcid user status: ${String(response.status)}`,
      );
    }
    return await response.json() as MCROrcidUserStatus;
  };

  /**
   * Fetches the settings for an ORCID user.
   *
   * @param accessToken - The access token to authorize the request
   * @param orcid - The ORCID of the user whose settings are being fetched
   * @returns A promise that resolves to an `MCROrcidUserSettings` object containing the user's settings
   * @throws If the fetch operation fails or if the response is not successful
   */
  public fetchOrcidUserSettings = async (
    accessToken: string,
    orcid: string,
  ): Promise<MCROrcidUserSettings> => {
    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}api/orcid/v1/user-properties/${orcid}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
    } catch (error) {
      return handleError('Error while fetching Orcid user settings', error);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch ORCID user settings for ${orcid}.`);
    }
    return await response.json() as MCROrcidUserSettings;
  };

  /**
   * Updates the settings for an ORCID user.
   *
   * @param accessToken - The access token to authorize the request
   * @param orcid - The ORCID of the user whose settings are being updated
   * @param settings - An object containing the new settings for the user
   * @returns A promise that resolves when the settings are successfully updated
   * @throws If the fetch operation fails or if the response is not successful
   */
  public updateOrcidUserSettings = async (
    accessToken: string,
    orcid: string,
    settings: MCROrcidUserSettings,
  ): Promise<void> => {
    let response: Response;
    try {
      response = await fetch(
        `${this.baseUrl}api/orcid/v1/user-properties/${orcid}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        },
      );
    } catch (error) {
      return handleError('Error while fetching Orcid user settings', error);
    }
    if (!response.ok) {
      throw new Error(`Failed to update ORCID user settings for ${orcid}.`);
    }
  };
}
