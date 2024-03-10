import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { type UserInfo } from '@/api'

export const storeUser = defineStore('userStore', () => {
  const userInfo = useStorage<UserInfo>('userInfo', ({} as UserInfo))

  const token = useStorage<string | null>('token', null)

  const modifyToken = (value: string | null) => token.value = value

  const modifyUserInfo = (data: UserInfo) => {
    userInfo.value = data
  }

  const cleanAll = () => {
    modifyToken(null)
    modifyUserInfo(({} as UserInfo))
  }

  return {
    userInfo,
    token,
    modifyToken,
    modifyUserInfo,
    cleanAll
  }
  
})