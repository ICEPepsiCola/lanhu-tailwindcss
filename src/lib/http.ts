import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface HttpRequestConfig<T = any, D = any> extends AxiosRequestConfig<D> {
  defaultData?: T
}

export type Resonse<T = any> = Partial<{
  status: number
  data: T
  msg: string
}>

export async function http<T extends any, D = any>(config: HttpRequestConfig<T, D>): Promise<T | undefined> {
  const { defaultData, ...axiosConfig } = config
  try {
    const res = await axios<Resonse<T>, AxiosResponse<Resonse<T>>, D>(axiosConfig);
    const data = res?.data;
    if (res.status === 200 && data?.status === 200) {
      return data?.data ?? defaultData;
    }
    return data?.data ?? defaultData;
  } catch (error) {
    console.error('http error', error)
    return defaultData;
  }
}

export function httpGet<T extends any, D = any>(url: string, config?: HttpRequestConfig<T, D>) {
  return http<T, D>({ url, method: 'GET', ...config })
}

export function httpPost<T extends any, D = any>(url: string, data?: D, config?: HttpRequestConfig<T, D>) {
  return http({ url, method: 'POST', data, ...config })
}