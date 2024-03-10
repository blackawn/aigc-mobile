import { ref, watchEffect } from 'vue'

let timer: ReturnType<typeof setInterval> | null = null

export const useCountdown = (initCount = 60) => {

  const count = ref(initCount)

  const isActive = ref(false)

  const start = (isRecord = true) => {

    if (isActive.value) return

    isActive.value = true

    if (isRecord) {
      localStorage.setItem('countdown', new Date().getTime().toString())
    }

    timer = setInterval(() => {
      count.value--
      if (count.value === 0) {
        clean()
        count.value = initCount
        isActive.value = false
      }
    }, 1000)
  }

  watchEffect(() => {

    const prevTime = Number(localStorage.getItem('countdown')) || 0
    
    if (prevTime > 0) {
      const currentTime = new Date().getTime()

      const between = Math.floor((currentTime - prevTime) / 1000)

      if (between < initCount) {
        count.value = initCount - between
        start(false)
      }
    }

  })

  const clean = () => {
    if (timer) {
      clearInterval(timer)
    }
  }

  return {
    start,
    isActive,
    count,
    clean
  }
}
