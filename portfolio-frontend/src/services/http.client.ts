import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

function getCookie(name: string): string {
  let cookieValue = "";
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export abstract class HttpClient {
  protected readonly instance: AxiosInstance;

  public constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
    });
    this._initializeRequestInterceptor();
    this._initializeResponseInterceptor();
  }

  protected _initializeRequestInterceptor = () => {
    this.instance.interceptors.request.use(
      this._handleRequest,
      this._handleError
    );
  };

  protected _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    );
  };

  protected _handleRequest(config: AxiosRequestConfig) {
    return {
      ...config,
      headers: {
        ...config.headers,
        "X-CSRFToken": getCookie("csrftoken"),
      },
    } as AxiosRequestConfig;
  }

  protected _handleResponse(response: AxiosResponse) {
    return response;
  }

  protected _handleError(error: AxiosError) {
    console.log(error);
    return Promise.reject(error);
  }
}
