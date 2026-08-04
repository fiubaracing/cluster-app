import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { redirect } from 'next/navigation';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

let refreshPromise: Promise<any> | null = null;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return {
        data: response.data,
        status: response.status,
        headers: response.headers,
    } as any; 
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!error.response || !error.response.data || !originalRequest) {
        return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
        const needRefresh = new Set(['jwt.expired', 'jwt.blank', 'jwt.invalid']);
        const errorCode = (error.response.data as any).errorCode;

        if (errorCode && needRefresh.has(errorCode)) {
            originalRequest._retry = true;

            try {
                if (!refreshPromise) {
                    refreshPromise = api.post('/auth/refresh').finally(() => {
                        refreshPromise = null;
                    });
                }

                await refreshPromise;

                return api(originalRequest as AxiosRequestConfig);
                
            } catch (refreshError) {
                console.error('Session expired. Redirecting to login.');
                redirect('/');
            }
        }
    }

    return Promise.reject(error);
});

export default api;