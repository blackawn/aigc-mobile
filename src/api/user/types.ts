
// 验证码类型 1-注册 2-登录 3-忘记密码 4-绑定手机号 5-提现
type VerifyCodeType = 1 | 2 | 3 | 4 | 5

export interface VerifyCodeParams {
  phone: string
  type: VerifyCodeType 
}

export type PhoneVerifyCodeSignInParams = Omit<VerifyCodeParams, 'phone'> & {
  code: string
  name: string
}

export type AccountPasswordSignInParams = Omit<VerifyCodeParams, 'phone'> & {
  password: string
  name: string
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  nickname: string;
  login_type: number;
  sex: number;
  avatar: string;
  birthday: string;
  is_bind_phone: number;
  is_bind_wx: boolean;
  is_vip: number;
  free_vip: number;
  invite_code: string;
  gpt_total: number;
  gpt_tokens: number;
  gpt_tokens_used: number;
  gpt_vip_end: string;
  mj_total: number;
  mj_times: number;
  mj_times_used: number;
  mj_vip_end: string;
  dallE3_total: number;
  dallE3_times: number;
  dallE3_times_used: number;
  dallE3_vip_end: string;
  now: string;
}

export interface SignInUserInfo extends UserInfo {
  token: string
  is_new_user: boolean
}

export interface UserRewardInfo {
  rewards_remain: number;
  invited_users: number;
  rate: string;
  withdraw_in_review: number;
  withdraw: number;
}

export interface Package {
  id: number;
  vip_name: string;
  price: string;
  original_price: string;
  time?: string;
  is_regret: number;
  type: number;
  mj_times: number;
  gpt3_tokens?: number;
  gpt4_tokens?: number;
  mark: string;
  desc: string;
  gpt3_tokens_text: string;
  gpt4_tokens_text: string;
  mj_times_text: string;
}