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

/**
 * Interface that defines the structure for authentication strategies.
 */
export interface MCRClientAuthStrategy {
  /**
   * Returns a record of headers required for authentication.
   *
   * @returns A record of headers that will be sent with the HTTP request, such as an Authorization header.
   */
  getHeaders(): Record<string, string>;
}

/**
 * Authentication strategy that uses an access token for authorization.
 * This strategy will include a Bearer token in the Authorization header.
 */
export class MCRAccessTokenClientAuthStrategy implements MCRClientAuthStrategy {
  private readonly accessToken;

  /**
   * Creates an instance of the `MCRAccessTokenClientAuthStrategy` class with the given access token.
   * @param accessToken - The access token to be used for authentication.
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Returns the authentication headers, including the Bearer token.
   * @returns A record containing the Authorization header with the Bearer token.
   */
  public getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  /**
   * Getter for the access token.
   */
  public getAccessToken(): string {
    return this.accessToken;
  }
}

export type MCRHTTPMethod =
  | 'GET'
  | 'POST'
  | 'PATCH'
  | 'DELETE'
  | 'PUT'
  | 'OPTIONS'
  | 'HEAD';

export type MCRHTTPHeaders = Record<string, string>;

export type MCRHTTPRequestDataType =
  | Blob
  | BufferSource
  | FormData
  | URLSearchParams
  | string;

// eslint-disable-next-line
const isRequestDataType = (value: any): boolean => {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    value instanceof FormData ||
    value instanceof URLSearchParams
  );
};

export type MCRResponseDataType = 'arraybuffer' | 'json' | 'text';

const getAcceptHeaderValue = (
  responseDataType: MCRResponseDataType
): string => {
  if (responseDataType === 'text') {
    return 'text/plain';
  }
  if (responseDataType == 'json') {
    return 'application/json';
  }
  return 'application/octet-stream';
};

const transformResponseData = async <T>(
  response: Response,
  requestConfig: MCRHTTPRequestConfig
): Promise<T> => {
  const contentLength = response.headers.get('content-length');
  if (!contentLength) {
    return undefined as T;
  }
  if (contentLength === '0') {
    return {} as T;
  }
  if (requestConfig.responseType === 'arraybuffer') {
    return (await response.arrayBuffer()) as T;
  }
  if (requestConfig.responseType === 'text') {
    return (await response.text()) as T;
  }
  const contentTypeHeaderValue = response.headers.get('content-type');
  if (contentTypeHeaderValue === 'text/plain') {
    return (await response.text()) as T;
  }
  if (contentTypeHeaderValue === 'application/octet-stream') {
    return (await response.arrayBuffer()) as T;
  }
  if (contentTypeHeaderValue === 'application/x-www-form-urlencoded') {
    return (await response.formData()) as T;
  }
  return (await response.json()) as T;
};

export interface MCRHTTPRequestConfig {
  url?: string | URL;
  method?: MCRHTTPMethod;
  headers?: MCRHTTPHeaders;
  data?: MCRHTTPRequestDataType;
  timeout?: number;
  responseType?: MCRResponseDataType;
}

export interface MCRHTTPClientInstanceConfig {
  authStrategy?: MCRClientAuthStrategy;
  timeout?: number;
}

export interface MCRHTTPResponseInfo {
  statusCode: number;
  statusText: string;
  headers?: MCRHTTPHeaders;
}

export interface MCRHTTPResponse<T> {
  status: number;
  statusText: string;
  headers: MCRHTTPHeaders;
  data: T;
}

export class MCRHTTPRequestError extends Error {
  readonly #statusCode: number;

  readonly #statusText: string;

  constructor(message: string, statusCode: number, statusText: string) {
    super(message);
    this.#statusCode = statusCode;
    this.#statusText = statusText;
  }

  public get statusCode(): number {
    return this.#statusCode;
  }

  public get statusText(): string {
    return this.#statusText;
  }
}

/**
 * A client for making HTTP requests with support for authentication strategies.
 */
export class MCRHTTPClient {
  private baseUrl: URL;

  private config: MCRHTTPClientInstanceConfig;

  constructor(baseUrl: string | URL, config?: MCRHTTPClientInstanceConfig) {
    this.baseUrl = new URL(baseUrl);
    this.config = config ?? { timeout: 5000 };
  }

  public async request<T>(
    requestConfig: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    const controller = new AbortController();
    const { signal } = controller;
    const timeout = requestConfig.timeout ?? (this.config.timeout as number);
    const timeoutId = this.setRequestTimeout(controller, timeout);
    const headers = this.createRequestHeaders(requestConfig);
    const requestOptions: RequestInit = {
      method: requestConfig.method ?? 'GET',
      body: requestConfig.data,
      signal,
      headers,
    };
    const url = requestConfig.url
      ? new URL(requestConfig.url, this.baseUrl)
      : new URL(this.baseUrl);
    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new MCRHTTPRequestError(
          'Request failed.',
          response.status,
          response.statusText
        );
      }
      return {
        status: response.status,
        statusText: response.statusText,
        data: await transformResponseData(response, requestConfig),
        headers: this.createResponseHeaders(response.headers),
      };
    } catch (error) {
      this.handleRequestError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async get<T>(
    url?: string | URL,
    requestConfig?: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    return await this.request({
      url,
      method: 'GET',
      ...requestConfig,
    });
  }

  public async delete<T>(
    url?: string | URL,
    requestConfig?: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    return await this.request<T>({
      url,
      method: 'DELETE',
      ...requestConfig,
    });
  }

  public async patch<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    return await this.write<T>('PATCH', url, data, requestConfig);
  }

  public async post<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    return await this.write<T>('POST', url, data, requestConfig);
  }

  public async put<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    return await this.write<T>('PUT', url, data, requestConfig);
  }

  private async write<T>(
    method: MCRHTTPMethod,
    url?: string | URL,
    data?: T,
    requestConfig: MCRHTTPRequestConfig = {}
  ): Promise<MCRHTTPResponse<T>> {
    let transformedData: MCRHTTPRequestDataType | undefined;
    if (data) {
      transformedData = isRequestDataType(data)
        ? (data as MCRHTTPRequestDataType)
        : JSON.stringify(data);
    }
    return await this.request({
      url,
      method,
      data: transformedData,
      ...requestConfig,
    });
  }

  private createResponseHeaders(headers: Headers): MCRHTTPHeaders {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private createRequestHeaders(
    requestConfig: MCRHTTPRequestConfig = {}
  ): Headers {
    const headers = new Headers(requestConfig.headers);
    if (requestConfig.data && !headers.get('Content-Type')) {
      // use json as default
      headers.set('Content-Type', 'application/json');
    }
    if (requestConfig.responseType && !headers.get('Accept')) {
      headers.set('Accept', getAcceptHeaderValue(requestConfig.responseType));
    }
    if (this.config.authStrategy) {
      Object.entries(this.config.authStrategy.getHeaders()).forEach(
        ([key, value]) => {
          headers.set(key, value);
        }
      );
    }
    return headers;
  }

  private setRequestTimeout(
    controller: AbortController,
    timeout: number
  ): number {
    return setTimeout(() => {
      controller.abort();
    }, timeout);
  }

  private handleRequestError(error: unknown): never {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('The request was aborted due to a timeout.');
    }
    throw error;
  }
}
