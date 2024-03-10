import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { showToast } from 'vant'
import { storeConfig } from '@/store/config'
import { storeUser } from '@/store/user'

const configStore = storeConfig()
const userStore = storeUser()

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api/api/v1/',
  timeout: 10000,
})

axiosInstance.interceptors.request.use((config) => {

  config.headers.Authorization = `Bearer ${userStore.token}`

  config.data = { ...configStore.baseParams, ...config.data }

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
