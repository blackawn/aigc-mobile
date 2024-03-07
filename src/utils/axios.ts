import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    Authorization: 'Bearer 966e0d1827ab33c941e96a0e56b72c880babd9ef87c5836ebb72c6bb7d5cebe3c938634dd8a4a21a0bf12a1f2445661e'
  },
  data: {
    'device_no': '80fe9d323dd744468788d2ad578090f5',
    'product_id': '8020',
    'app_id': 'Novel',
    'version': '',
    'cid': '',
    'click_id': '',
    'user_type': '0'
  }
})

axiosInstance.interceptors.request.use((config) => {

  return config
}, (error: AxiosError) => {

  return Promise.reject(error)
})

axiosInstance.interceptors.response.use( (response: AxiosResponse) => {
  console.log(response)

  return response
}, (error: AxiosError) => {

  return Promise.reject(error)
})
