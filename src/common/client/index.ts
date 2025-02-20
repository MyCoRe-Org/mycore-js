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
export interface ClientAuthStrategy {
  /**
   * Returns a record of headers required for authentication.
   * @returns A record of headers that will be sent with the request, such as an Authorization header.
   */
  getHeaders(): Record<string, string>;
}

/**
 * Authentication strategy that uses an access token for authorization.
 * This strategy will include a Bearer token in the Authorization header.
 */
export class AccessTokenClientAuthStrategy implements ClientAuthStrategy {
  private readonly accessToken;

  /**
   * Creates an instance of the `AccessTokenClientAuthStrategy` class with the given access token.
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
 * Represents the methods supported for making requests.
 */
export type HttpMethod =
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
 * The `HttpHeaders` type is used to define headers in an HTTP request or response.
 * Each key is a string representing the header name, and each value is the corresponding header's value.
 */
export type HttpHeaders = Record<string, string>;

/**
 * Represents the possible types of data that can be sent in an request body.
 *
 * The `HttpRequestDataType` type defines the acceptable data types that can be sent as the body
 * of an request. These types include binary data, form data, and standard text-based formats.
 */
export type RequestDataType =
  | Blob
  | BufferSource
  | FormData
  | URLSearchParams
  | string;

/**
 * Represents the possible types of data that can be returned in a response.
 *
 * The `ResponseDataType` type defines the expected format of the data returned from a response.
 * It can either be a binary array buffer, a JSON object, or a plain text response.
 */
export type ResponseDataType = 'arraybuffer' | 'json' | 'text';

/**
 * Configuration for making requests.
 *
 * The `HttpRequestConfig` interface defines the configuration options for making requests,
 * including details like URL, method, headers, request body, timeout, and the expected response type.
 */
export interface HttpRequestConfig {
  /**
   * The URL for the request.
   * This can either be a string or a URL object representing the target endpoint.
   */
  url?: string | URL;

  /**
   * The method to be used for the request (e.g., `GET`, `POST`, etc.).
   * If not provided, the default method is `GET`.
   */
  method?: HttpMethod;

  /**
   * The headers to include in the request.
   * This is an object where keys are header names, and values are header values.
   */
  headers?: HttpHeaders;

  /**
   * The body of the request, which can be any type of data, such as a string or form data.
   * This field is typically used for methods like `POST`, `PUT`, or `PATCH`.
   */
  data?: RequestDataType;

  /**
   * The timeout in milliseconds for the request.
   * If the request takes longer than this time, it will be aborted.
   */
  timeout?: number;

  /**
   * The expected response type from the server.
   * This could be `arraybuffer`, `json`, `text`, etc.
   */
  responseType?: ResponseDataType;
}

/**
 * Represents a response containing data.
 *
 * The `Response` interface defines the structure of a response, which includes the status,
 * status text, headers, and the response data of type `T`.
 */
export interface HttpResponse<T> {
  /**
   * The HTTP status code of the response (e.g., 200 for success, 404 for not found).
   */
  status: number;

  /**
   * A short description or status message corresponding to the status code (e.g., "OK", "Not Found").
   */
  statusText: string;

  /**
   * The headers of the response, provided as key-value pairs.
   */
  headers: HttpHeaders;

  /**
   * The data returned in the response. This can be of any type, depending on the response.
   */
  data: T;
}

/**
 * Represents an error that occurs during an request.
 *
 * The `RequestError` interface extends the built-in `Error` class to provide additional information
 * specific to requests, such as the status code and status text of the response that caused the error.
 */
export interface HttpRequestError extends Error {
  /**
   * The HTTP status code returned by the server.
   * This property is set when the error occurs due to an unsuccessful request.
   */
  statusCode: number;

  /**
   * The status text returned by the server.
   * This property provides a brief description of the status, corresponding to the `statusCode`.
   */
  statusText: string;
}

/**
 * Checks if a given value is a valid type for request data.
 * @param value - The value to check.
 * @returns `true` if the value is a valid request data type, `false` otherwise.
 */
const isRequestDataType = (value: unknown): boolean => {
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
 * Returns the appropriate `Accept` header value based on the requested response data type.
 * @param responseDataType - The expected response data type. Can be one of `'text'`, `'json'`, or `'arraybuffer'`.
 * @returns A string representing the appropriate `Accept` header value based on the `responseDataType`.
 *          Possible values include `text/plain`, `application/json`, and `application/octet-stream`.
 */
const getAcceptHeaderValue = (responseDataType: ResponseDataType): string => {
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
 * @param response - The response object from the request.
 * @param requestConfig - The configuration object that contains the expected response type.
 * @returns A promise resolving to the transformed response data of type `T`.
 * @throws Will throw an error if the response type cannot be processed.
 */
const transformResponseData = async <T>(
  response: Response,
  requestConfig: HttpRequestConfig
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
 * Configuration for the instance.
 *
 * The `ClientInstanceConfig` interface defines the configuration options for the instance,
 * including authentication strategy and timeout settings.
 */
export interface InstanceConfig {
  /**
   * The authentication strategy for the client.
   */
  authStrategy?: ClientAuthStrategy;

  /**
   * The timeout in milliseconds for all HTTP requests made by this client instance.
   * If not provided, the default timeout is used.
   */
  timeout?: number;
}

/**
 * A client for making HTTP requests with support for authentication strategies.
 */
export class HttpClient {
  private baseUrl: URL;

  private config: InstanceConfig;

  /**
   * Creates an instance of `HttpClient`.
   * @param baseUrl - The base URL that will be used for all requests.
   * @param config - Optional configuration object to customize the client's behavior, including timeout and authentication settings.
   */
  constructor(baseUrl: string | URL, config?: InstanceConfig) {
    this.baseUrl = new URL(baseUrl);
    this.config = config ?? { timeout: 5000 };
  }

  /**
   * Sends an request with the specified configuration and returns a promise with the response.
   * @param requestConfig - The configuration for the request, including method, URL, headers, body, etc.
   * @returns A promise that resolves with the response.
   * @throws HttpRequestError - If the request fails or the response status is not `ok`.
   */
  public async request<T>(
    requestConfig: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
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
        throw {
          message: 'Request failed.',
          statusCode: response.status,
          statusText: response.statusText,
        } as HttpRequestError;
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
   * @returns A promise that resolves with the response.
   */
  public async get<T>(
    url?: string | URL,
    requestConfig?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
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
   * @returns A promise that resolves with the response.
   */
  public async delete<T>(
    url?: string | URL,
    requestConfig?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
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
   * @returns A promise that resolves with the response.
   */
  public async patch<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return await this.write<T>('PATCH', url, data, requestConfig);
  }

  /**
   * Sends a `POST` request to the server with data.
   * @param url - The URL to send the `POST` request to.
   * @param data - The data to send in the request body.
   * @param requestConfig - Optional configuration for the request.
   * @returns A promise that resolves with the response.
   */
  public async post<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return await this.write<T>('POST', url, data, requestConfig);
  }

  /**
   * Sends a `PUT` request to the server with data.
   * @param url - The URL to send the `PUT` request to.
   * @param data - The data to send in the request body.
   * @param requestConfig - Optional configuration for the request.
   * @returns A promise that resolves with the response.
   */
  public async put<T>(
    url?: string | URL,
    data?: T,
    requestConfig?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return await this.write<T>('PUT', url, data, requestConfig);
  }

  private async write<T>(
    method: HttpMethod,
    url?: string | URL,
    data?: T,
    requestConfig: HttpRequestConfig = {}
  ): Promise<HttpResponse<T>> {
    let transformedData: RequestDataType | undefined;
    if (data) {
      transformedData = isRequestDataType(data)
        ? (data as RequestDataType)
        : JSON.stringify(data);
    }
    return await this.request({
      url,
      method,
      data: transformedData,
      ...requestConfig,
    });
  }

  private createResponseHeaders(headers: Headers): HttpHeaders {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private createRequestHeaders(requestConfig: HttpRequestConfig = {}): Headers {
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
