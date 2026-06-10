import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";

function getCSRFToken(cookieName: string): string | undefined {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return undefined;
}

function getErrorMessage(error: AxiosError): string {
  const data = error.response?.data as { message?: string } | undefined;
  if (data?.message) return data.message;

  if (error.response) {
    switch (error.response.status) {
      case 400:
        return "Bad request";
      case 401:
        return "Unauthorized";
      case 404:
        return "Not found";
      case 500:
        return "Internal server error";
      default:
        return "An error occurred while making the request";
    }
  }

  return "An error occurred while making the request";
}

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export abstract class HttpClient {
  protected readonly instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
    });

    this._setupRequestInterceptor();
    this._setupResponseInterceptor();
  }

  protected _setupRequestInterceptor() {
    this.instance.interceptors.request.use(this._handleRequest);
  }

  protected _setupResponseInterceptor() {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  }

  protected _handleRequest(config: InternalAxiosRequestConfig) {
    const csrfToken = getCSRFToken("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
  }

  protected _handleResponse(response: AxiosResponse) {
    return response;
  }

  protected _handleError(error: AxiosError) {
    console.error(error);
    return Promise.reject(
      new ApiError(getErrorMessage(error), error.response?.status, error.response?.data)
    );
  }
}
