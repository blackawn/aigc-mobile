import { axiosInstance } from '@/utils/axios'
import { R } from '../types'
import { GetConfigRes, GetCustomizeFeatureRes } from './types'

// 获取资源配置
export const getConfig = (): R<GetConfigRes> => {
  return axiosInstance.post('/novel/config')
}

// 创建角色自定义特征
export const createCustomizeFeature = (value: string): R => {
  return axiosInstance.post('/novel/user_config/add', { name: value })
}

// 获取角色自定义特征
export const getCustomizeFeature = (): R<GetCustomizeFeatureRes> => {
  return axiosInstance.post('/novel/user_config')
}

// 删除角色自定义特征
export const deleteCustomizeFeature = (id: number): R => {
  return axiosInstance.post('/novel/user_config/remove', { id })
}