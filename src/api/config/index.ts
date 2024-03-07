import { axiosInstance } from '@/utils/axios'

export const getConfig = () => {
  return axiosInstance.post('/api/v1/novel/config',{
    'device_no': '80fe9d323dd744468788d2ad578090f5',
    'product_id': '8020',
    'app_id': 'Novel',
    'version': '',
    'cid': '',
    'click_id': '',
    'user_type': '0'
  })
}