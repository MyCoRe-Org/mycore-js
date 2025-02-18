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
 * This module provides HTTP client.
 * @module
 */

/**
 * Interface that defines the structure for authentication strategies.
 */
export interface MCRClientAuthStrategy {
  /**
   * Returns a record of headers required for authentication.
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
   * @returns The access token.
   */
  public getAccessToken(): string {
    return this.accessToken;
  }
}

/**
 * Represents the HTTP methods supported for making requests.
 */
export type MCRHTTPMethod =
  | 'GET'
  | 'POST'
  | 'PATCH'
  | 'DELETE'
  | 'PUT'
  | 'OPTIONS'
  | 'HEAD';

/**
 * Represents HTTP headers as a record of key-value pairs.
 *
 * The `MCRHTTPHeaders` type is used to define headers in an HTTP request or response.
 * Each key is a string representing the header name, and each value is the corresponding header's value.
 */
export type MCRHTTPHeaders = Record<string, string>;

/**
 * Represents the possible types of data that can be sent in an HTTP request body.
 *
 * The `MCRHTTPRequestDataType` type defines the acceptable data types that can be sent as the body
 * of an HTTP request. These types include binary data, form data, and standard text-based formats.
 */
export type MCRHTTPRequestDataType =
  | Blob
  | BufferSource
  | FormData
  | URLSearchParams
  | string;

/**
 * Checks if a given value is a valid type for request data.
 * @param value - The value to check.
 * @returns `true` if the value is a valid request data type, `false` otherwise.
 */
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

/**
 * Represents the possible types of data that can be returned in an HTTP response.
 *
 * The `MCRResponseDataType` type defines the expected format of the data returned from an HTTP response.
 * It can either be a binary array buffer, a JSON object, or a plain text response.
 */
export type MCRResponseDataType = 'arraybuffer' | 'json' | 'text';

/**
 * Returns the appropriate `Accept` header value based on the requested response data type.
 * @param responseDataType - The expected response data type. Can be one of `'text'`, `'json'`, or `'arraybuffer'`.
 * @returns A string representing the appropriate `Accept` header value based on the `responseDataType`.
 *          Possible values include `text/plain`, `application/json`, and `application/octet-stream`.
 */
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

/**
 * Transforms the response data based on the response type and the request configuration.
 * The `transformResponseData` function processes the response based on its content type and the
 * requested response type. It handles different formats like `arraybuffer`, `text`, `json`, and more.
 * @param response - The response object from the HTTP request.
 * @param requestConfig - The configuration object that contains the expected response type.
 * @returns A promise resolving to the transformed response data of type `T`.
 * @throws Will throw an error if the response type cannot be processed.
 */
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

/**
 * Configuration for making HTTP requests.
 *
 * The `MCRHTTPRequestConfig` interface defines the configuration options for making HTTP requests,
 * including details like URL, HTTP method, headers, request body, timeout, and the expected response type.
 */
export interface MCRHTTPRequestConfig {
  /**
   * The URL for the HTTP request.
   * This can either be a string or a URL object representing the target endpoint.
   */
  url?: string | URL;

  /**
   * The HTTP method to be used for the request (e.g., `GET`, `POST`, etc.).
   * If not provided, the default method is `GET`.
   */
  method?: MCRHTTPMethod;

  /**
   * The headers to include in the request.
   * This is an object where keys are header names, and values are header values.
   */
  headers?: MCRHTTPHeaders;

  /**
   * The body of the request, which can be any type of data, such as a string or form data.
   * This field is typically used for methods like `POST`, `PUT`, or `PATCH`.
   */
  data?: MCRHTTPRequestDataType;

  /**
   * The timeout in milliseconds for the request.
   * If the request takes longer than this time, it will be aborted.
   */
  timeout?: number;

  /**
   * The expected response type from the server.
   * This could be `arraybuffer`, `json`, `text`, etc.
   */
  responseType?: MCRResponseDataType;
}

/**
 * Configuration for the HTTP client instance.
 *
 * The `MCRHTTPClientInstanceConfig` interface defines the configuration options for the HTTP client instance,
 * including authentication strategy and timeout settings.
 */
export interface MCRHTTPClientInstanceConfig {
  /**
   * The authentication strategy for the client.
   */
  authStrategy?: MCRClientAuthStrategy;

  /**
   * The timeout in milliseconds for all HTTP requests made by this client instance.
   * If not provided, the default timeout is used.
   */
  timeout?: number;
}

/**
 * Information about the HTTP response.
 *
 * The `MCRHTTPResponseInfo` interface contains basic information about the response, such as its status code,
 * status text, and headers.
 */
export interface MCRHTTPResponseInfo {
  /**
   * The HTTP status code of the response (e.g., 200 for success, 404 for not found).
   */
  statusCode: number;

  /**
   * A short description or status message corresponding to the status code (e.g., "OK", "Not Found").
   */
  statusText: string;

  /**
   * The headers of the HTTP response, provided as key-value pairs.
   */
  headers: MCRHTTPHeaders;
}

/**
 * Represents an HTTP response containing data.
 *
 * The `MCRHTTPResponse` interface defines the structure of an HTTP response, which includes the status,
 * status text, headers, and the response data of type `T`.
 */
export interface MCRHTTPResponse<T> {
  /**
   * The HTTP status code of the response (e.g., 200 for success, 404 for not found).
   */
  status: number;

  /**
   * A short description or status message corresponding to the status code (e.g., "OK", "Not Found").
   */
  statusText: string;

  /**
   * The headers of the HTTP response, provided as key-value pairs.
   */
  headers: MCRHTTPHeaders;

  /**
   * The data returned in the HTTP response. This can be of any type, depending on the response.
   */
  data: T;
}

/**
 * Represents an error that occurs during an HTTP request.
 *
 * The `MCRHTTPRequestError` class extends the built-in `Error` class to provide additional information
 * specific to HTTP requests, such as the status code and status text of the response that caused the error.
 * This class is useful for handling and debugging HTTP request failures, providing more context about
 * the nature of the error.
 */
export class MCRHTTPRequestError extends Error {
  /**
   * The HTTP status code returned by the server.
   * This property is set when the error occurs due to an unsuccessful HTTP request.
   */
  readonly #statusCode: number;

  /**
   * The HTTP status text returned by the server.
   * This property provides a brief description of the status, corresponding to the `statusCode`.
   */
  readonly #statusText: string;

  /**
   * Creates an instance of the `MCRHTTPRequestError` class.
   * @param message - The error message describing the issue.
   * @param statusCode - The HTTP status code of the failed request.
   * @param statusText - The HTTP status text associated with the status code.
   */
  constructor(message: string, statusCode: number, statusText: string) {
    super(message);
    this.#statusCode = statusCode;
    this.#statusText = statusText;
  }

  /**
   * Gets the HTTP status code associated with this error.
   * @returns The status code of the failed request.
   */
  public get statusCode(): number {
    return this.#statusCode;
  }

  /**
   * Gets the HTTP status text associated with this error.
   * @returns The status text describing the error (e.g., "Not Found" for a 404 error).
   */
  public get statusText(): string {
    return this.#statusText;
  }
}

/**
 * A client for making HTTP requests with support for authentication strategies.
 */
export class MCRHTTPClient {
  private baseURL: URL;

  private config: MCRHTTPClientInstanceConfig;

  /**
   * Creates an instance of `MCRHTTPClient`.
   * @param baseURL - The base URL that will be used for all HTTP requests made by this client.
   * @param config - Optional configuration object to customize the client's behavior, including timeout and authentication settings.
   */
  constructor(baseURL: string | URL, config?: MCRHTTPClientInstanceConfig) {
    this.baseURL = new URL(baseURL);
    this.config = config ?? { timeout: 5000 };
  }

  /**
   * Sends an HTTP request with the specified configuration and returns a promise with the response.
   * @param requestConfig - The configuration for the HTTP request, including method, URL, headers, body, etc.
   * @returns A promise that resolves with the HTTP response.
   * @throws MCRHTTPRequestError - If the request fails or the response status is not `ok`.
   */
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
      ? new URL(requestConfig.url, this.baseURL)
      : new URL(this.baseURL);
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

  /**
   * Sends a `GET` request to the server.
   * @param url - The URL to send the `GET` request to.
   * @param requestConfig - Optional configuration for the request.
   * @returns A promise that resolves with the HTTP response.
   */
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

  /**
   * Sends a `DELETE` request to the server.
   * @param url - The URL to send the `DELETE` request to.
   * @param requestConfig - Optional configuration for the request.
   * @returns A promise that resolves with the HTTP response.
   */
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

  /**
   * Sends a `PATCH` request to the server with data.
   * @param url - The URL to send the `PATCH` request to.
   * @param data - The data to send in the request body.
   * @param requestConfig - Optional configuration for the request.
   * @returns A promise that resolves with the HTTP response.
   */
  public async patch<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    return await this.write<T>('PATCH', url, data, requestConfig);
  }

  /**
   * Sends a `POST` request to the server with data.
   * @param url - The URL to send the `POST` request to.
   * @param data - The data to send in the request body.
   * @param requestConfig - Optional configuration for the request.
   * @returns A promise that resolves with the HTTP response.
   */
  public async post<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: MCRHTTPRequestConfig
  ): Promise<MCRHTTPResponse<T>> {
    return await this.write<T>('POST', url, data, requestConfig);
  }

  /**
   * Sends a `PUT` request to the server with data.
   * @param url - The URL to send the `PUT` request to.
   * @param data - The data to send in the request body.
   * @param requestConfig - Optional configuration for the request.
   * @returns A promise that resolves with the HTTP response.
   */
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
