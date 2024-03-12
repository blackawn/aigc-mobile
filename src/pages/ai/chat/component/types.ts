export type Role = 'gtp' | 'user'

export type Type = 'theme'

// 0 按钮交互
export type MutualType = 0 | 1

export interface DialogType{
  role: Role
  content: string
  type: Type
  time: string
  mutual?: {
    type: MutualType
    buttonList?: Array<string>
  }
}