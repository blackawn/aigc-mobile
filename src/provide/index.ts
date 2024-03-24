import { type InjectionKey, Ref } from 'vue'
import { GetSegmentDetailRes } from '@/api'

export const provideScrollElemToBottom = Symbol() as InjectionKey<(behavior?: ScrollBehavior, auto?: boolean) => void>

export const provideIncreaseRouterCount = Symbol() as InjectionKey<() => void>

export const provideModifyInputBoxStatus = Symbol() as InjectionKey<(status: boolean) => void>

export const provideDrawResultDetail = Symbol() as InjectionKey<Ref<GetSegmentDetailRes>>