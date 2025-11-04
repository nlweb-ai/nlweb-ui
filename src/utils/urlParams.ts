/**
 * URL Parameter Utilities
 * Parse query parameters for routing and options
 */

export interface URLQueryParams {
  endpoint?: string;
  site?: string;
  num_results?: number;
  [key: string]: any;
}

/**
 * Parse URL query parameters
 */
export function parseURLParams(): URLQueryParams {
  const params = new URLSearchParams(window.location.search);
  const result: URLQueryParams = {};

  // Get endpoint
  if (params.has('endpoint')) {
    result.endpoint = params.get('endpoint')!;
  }

  // Get site filter
  if (params.has('site')) {
    result.site = params.get('site')!;
  }

  // Get num_results
  if (params.has('num_results')) {
    result.num_results = parseInt(params.get('num_results')!, 10);
  }

  // Get any other parameters
  params.forEach((value, key) => {
    if (!['endpoint', 'site', 'num_results'].includes(key)) {
      result[key] = value;
    }
  });

  return result;
}

/**
 * Build URL with query parameters
 */
export function buildURL(baseUrl: string, params: URLQueryParams): string {
  const url = new URL(baseUrl, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}
