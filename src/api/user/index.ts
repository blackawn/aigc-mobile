import { axiosInstance } from '@/utils/axios'

export const login = () => {
  return axiosInstance.post('/api/v1/novel/config')
}