
// 验证码类型 1-注册 2-登录 3-忘记密码 4-绑定手机号 5-提现
type VerifyCodeType = '1' | '2' | '3' | '4' | '5'

export interface VerifyCodeParams {
  phone: string
  type: VerifyCodeType 
}