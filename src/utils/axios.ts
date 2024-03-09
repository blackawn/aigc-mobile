import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { showToast } from 'vant'
import { showNotify } from 'vant'
import { storeBase } from '@/store/base'

const baseStore = storeBase()

baseStore.createBaseParams()

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api/api/v1/',
  timeout: 10000,
  headers: {
    Authorization: 'Bearer 966e0d1827ab33c941e96a0e56b72c880babd9ef87c5836ebb72c6bb7d5cebe3c938634dd8a4a21a0bf12a1f2445661e'
  },
})

axiosInstance.interceptors.request.use((config) => {

  config.data = { ...baseStore.baseParams, ...config.data }

  return config
}, (error: AxiosError) => {

  return Promise.reject(error)
})

axiosInstance.interceptors.response.use( (response: AxiosResponse) => {

  if (response.data.code !== 0) {
    showToast(response.data.msg)
    return Promise.reject(response.data)
  }

  return response.data
}, (error: AxiosError) => {
  return Promise.reject(error)
})
