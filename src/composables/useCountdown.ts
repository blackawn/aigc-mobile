import { ref, watchEffect } from 'vue'

let timer: ReturnType<typeof setInterval> | null = null

export const useCountdown = (initialCount = 60) => {

  const count = ref(initialCount)

  const isActive = ref(false)

  const start = (record = true) => {

    if (isActive.value) return

    isActive.value = true

    if (record) {
      localStorage.setItem('countdown', new Date().getTime().toString())
    }

    timer = setInterval(() => {
      count.value--
      if (count.value === 0) {
        clean()
        count.value = initialCount
        isActive.value = false
      }
    }, 1000)
  }

  watchEffect(() => {

    const prevTime = Number(localStorage.getItem('countdown'))
    
    if (prevTime > 0) {
      const currentTime = new Date().getTime()

      const between = Math.floor((currentTime - prevTime) / 1000)

      if (between < initialCount) {
        count.value = initialCount - between
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
    count
  }
}
