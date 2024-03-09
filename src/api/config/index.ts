import { axiosInstance } from '@/utils/axios'

export const getConfig = () => {
  return axiosInstance.post('/novel/config',{
    k: 123
  })
}