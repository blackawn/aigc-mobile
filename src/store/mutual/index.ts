import { ref } from 'vue'
import { defineStore } from 'pinia'

export const storeMutual = defineStore('mutualStore', () => {

  const novelContentSelected = ref(false) 

  const novelContentIdSelect = ref(-1)

  const modifyNovelContentSelected = (status: boolean)=>{
    novelContentSelected.value = status
  }

  const modifyNovelContentIdSelect = (id: number)=>{
    novelContentIdSelect.value = id
  }

  // const transitionEffected = useStorage<boolean>('transitionEffected', JSON.parse(import.meta.env.VITE_APP_MUTUAL_TRANSITION))
  const transitionEffected = ref<boolean>(JSON.parse(import.meta.env.VITE_APP_MUTUAL_TRANSITION))

  const modifyTransitionEffected = (status: boolean)=>{
    transitionEffected.value = status
  }

  return {
    novelContentSelected,
    modifyNovelContentSelected,
    novelContentIdSelect,
    modifyNovelContentIdSelect,
    transitionEffected,
    modifyTransitionEffected
  }
})
