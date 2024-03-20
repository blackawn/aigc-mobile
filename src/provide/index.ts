import { type InjectionKey} from 'vue'

export const provideScrollElemToBottom =  Symbol() as InjectionKey<()=>void>