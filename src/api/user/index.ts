import { axiosInstance } from '@/utils/axios'
import { R } from '@/api/types'
import { VerifyCodeParams } from './interface'
import { md5 } from 'js-md5'

export const phoneVerifyLogin = () => {
  return axiosInstance.post('/user/sms_login')
}

export const sendVerifyCode = (params: VerifyCodeParams): R => {
  return axiosInstance.post('/user/send_code', {
    ...params,
    key: md5(params.phone + import.meta.env.VITE_APP_VERIFY_KEY + params.phone)
  })
}