import { type InjectionKey, Ref } from 'vue'

export const provideScrollElemToBottom = Symbol() as InjectionKey<(behavior?: ScrollBehavior) => void>

export const provideIncreaseRouterCount = Symbol() as InjectionKey<() => void>

export const provideModifyInputBoxStatus = Symbol() as InjectionKey<(status: boolean) => void>