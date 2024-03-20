import { axiosInstance } from '@/utils/axios'
import { R } from '@/api/types'
import type {
  VerifyCodeParams,
  PhoneVerifyCodeSignInParams,
  AccountPasswordSignInParams,
  UserInfo,
  SignInUserInfo,
  UserRewardInfo
} from './types'
import { md5 } from 'js-md5'

// 手机验证码登录
export const phoneVerifyCodeSignIn = (params: PhoneVerifyCodeSignInParams): R<SignInUserInfo> => {
  return axiosInstance.post('/user/sms_login', {
    ...params
  })
}

// 账号密码登录
export const accountPasswordSignIn = (params: AccountPasswordSignInParams): R<SignInUserInfo> => {
  return axiosInstance.post('/user/login', {
    ...params
  })
}

// 退出登录
export const signOut = (): R => {
  return axiosInstance.post('/user/logout')
}

// 发送验证码
export const sendVerifyCode = (params: VerifyCodeParams): R => {

  return axiosInstance.post('/user/send_code', {
    ...params,
    key: md5(params.phone + import.meta.env.VITE_APP_VERIFY_KEY + params.phone)
  })
}

// 获取用户信息
export const getUserInfo = (): R<UserInfo> => {
  return axiosInstance.post('/user/get_user_info')
}

// 获取用户佣金信息
export const getUserRewardInfo = (): R<UserRewardInfo> => {
  return axiosInstance.post('/user/rewardInfo')
}