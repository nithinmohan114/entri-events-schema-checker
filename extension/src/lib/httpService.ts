import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const baseURL = "http://localhost:3001";

const httpService = axios.create({
  baseURL,
});

// Request Interceptor
const onRequestSuccess = (config: InternalAxiosRequestConfig) => {
  return config;
};

const onRequestFail = (error: AxiosError) => {
  return Promise.reject(error);
};

httpService.interceptors.request.use(onRequestSuccess, onRequestFail);

// Response Interceptor
const onResponseSuccess = (response: AxiosResponse) => {
  return response.data; // Return the response data directly
};

const handleErrorResponse = (error: AxiosError) => {
  if (error.response) {
    const { status } = error.response;

    switch (status) {
      case 403:
        console.error(
          "Access forbidden: You do not have permission to access this resource."
        );
        break;
      case 400:
        console.error(
          "Bad Request: The server could not understand the request."
        );
        break;
      case 404:
        console.error("Not Found: The requested resource could not be found.");
        break;
      case 500:
        console.error(
          "Internal Server Error: Something went wrong on the server."
        );
        break;
      default:
        console.error(
          (error.response.data as { message?: string })?.message ||
            "An error occurred while processing your request."
        );
    }
  } else {
    console.error("Network Error: Unable to reach the server.");
  }
  return Promise.reject(error);
};

const onResponseFail = (error: AxiosError) => {
  handleErrorResponse(error);
  return Promise.reject(error);
};

httpService.interceptors.response.use(onResponseSuccess, onResponseFail);

export { httpService };
