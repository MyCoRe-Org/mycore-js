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

import { MCRHTTPClient, MCRHTTPResponse } from '../../common/client';
import {
  MCRAccessKey,
  MCRCreateAccessKeyDTO,
  MCRUpdateAccessKeyDTO,
  MCRPartialUpdateAccessKeyDTO,
  MCRAccessKeySummary,
} from './model';

/**
 * Extracts the response data and returns the access key summary.
 *
 * @param response - The response object containing the data and headers.
 * @returns The parsed access keys summary.
 */
const createSummary = (
  response: MCRHTTPResponse<MCRAccessKey[]>
): MCRAccessKeySummary => {
  const totalCount = response.headers['x-total-count'];
  return {
    accessKeys: response.data,
    totalCount: totalCount ? parseInt(totalCount, 10) : 0,
  };
};

/**
 * Represents the options used to query and retrieve access keys.
 */
export interface MCRGetAccessKeysOptions {
  /**
   * An optional array of permissions to filter the access keys by.
   */
  permissions?: string[];

  /**
   * An optional reference or name to filter the access keys by.
   */
  reference?: string;

  /**
   * An optional offset value for pagination.
   */
  offset?: number;

  /**
   * An optional limit to specify the maximum number of access keys to return.
   */
  limit?: number;
}

/**
 * Base path for access key resource endpoint.
 */
const API_URL = 'api/v2/access-keys';

/**
 * Service for managing access keys.
 */
export class MCRAccessKeyService {
  private client: MCRHTTPClient;

  /**
   * Creates an instance of AccessKeyService.
   *
   * @param client - The HTTP client used to make API requests.
   */
  constructor(client: MCRHTTPClient) {
    this.client = client;
  }

  /**
   * Retrieves a list of access keys.
   *
   * @param options - The options to filter and paginate the access keys (optional).
   * @returns A promise that resolves with the access keys information.
   */
  public async getAccessKeys(
    options?: MCRGetAccessKeysOptions
  ): Promise<MCRAccessKeySummary> {
    const searchParams = new URLSearchParams();
    if (options?.reference) {
      searchParams.set('reference', options.reference);
    }
    if (options?.permissions && options.permissions.length > 0) {
      searchParams.set('permissions', options.permissions.join(','));
    }
    if (options?.offset) {
      searchParams.set('offset', String(options.offset));
    }
    if (options?.limit) {
      searchParams.set('limit', String(options.limit));
    }
    try {
      return createSummary(
        await this.client.get<MCRAccessKey[]>(
          `${API_URL}?${searchParams.toString()}`
        )
      );
    } catch (error) {
      throw new Error(`Failed to get access keys: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieves a single access key by its ID.
   *
   * @param id - The ID of the access key.
   * @returns A promise that resolves with the access key data.
   */
  public async getAccessKey(id: string): Promise<MCRAccessKey> {
    try {
      return (await this.client.get<MCRAccessKey>(`${API_URL}/${id}`)).data;
    } catch (error) {
      throw new Error(`Failed to get access key: ${(error as Error).message}`);
    }
  }

  /**
   * Creates a new access key.
   *
   * @param accessKey - The data for the new access key.
   * @returns A promise that resolves with the ID of the created access key.
   */
  public async createAccessKey(
    accessKey: MCRCreateAccessKeyDTO
  ): Promise<string> {
    try {
      const response = await this.client.post(API_URL, accessKey);
      return response.headers['location'].split('/').pop() as string;
    } catch (error) {
      throw new Error(
        `Failed to create access key: ${(error as Error).message}`
      );
    }
  }

  /**
   * Updates an existing access key.
   *
   * @param id - The ID of the access key.
   * @param accessKey - The data to update the access key with.
   */
  public async updateAccessKey(
    id: string,
    accessKey: MCRUpdateAccessKeyDTO
  ): Promise<void> {
    try {
      await this.client.post(`${API_URL}/${id}`, accessKey);
    } catch (error) {
      throw new Error(
        `Failed to update access key: ${(error as Error).message}`
      );
    }
  }

  /**
   * Partially updates an existing access key.
   *
   * @param id - The ID of the access key.
   * @param accessKey - The data to update the access key with.
   */
  public async patchAccessKey(
    id: string,
    accessKey: MCRPartialUpdateAccessKeyDTO
  ): Promise<void> {
    try {
      await this.client.patch(`${API_URL}/${id}`, accessKey);
    } catch (error) {
      throw new Error(
        `Failed to patch access key: ${(error as Error).message}`
      );
    }
  }

  /**
   * Deletes an access key.
   *
   * @param id - The ID of the access key to delete.
   */
  public async deleteAccessKey(id: string): Promise<void> {
    try {
      await this.client.delete(`${API_URL}/${id}`);
    } catch (error) {
      throw new Error(
        `Failed to delete access key: ${(error as Error).message}`
      );
    }
  }
}
