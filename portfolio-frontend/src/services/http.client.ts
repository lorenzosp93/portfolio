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
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return Promise.reject(new Error("Bad request"));
        case 401:
          return Promise.reject(new Error("Unauthorized"));
        case 404:
          return Promise.reject(new Error("Not found"));
        case 500:
          return Promise.reject(new Error("Internal server error"));
        default:
          return Promise.reject(
            new Error("An error occurred while making the request")
          );
      }
    } else {
      return Promise.reject(
        new Error("An error occurred while making the request")
      );
    }
  }
}
