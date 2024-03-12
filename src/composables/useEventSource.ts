import { ref, onBeforeUnmount } from 'vue'

export const useEventSource = () => {
  const eventSource = ref<EventSource | null>(null)
  const connected = ref(false)

  let messageCallback: ((data: any) => void) | null = null
  let errorCallback: (() => void) | null = null

  const onMessage = (event: MessageEvent) => {
    if (messageCallback) {
      messageCallback(event.data)
    }
  }

  const onError = (error: Event) => {
    // console.error('EventSource Error:', error)
    closeConnect()
    if (errorCallback) {
      errorCallback()
    }
  }

  const startConnect = (url: string) => {
    if (!eventSource.value) {
      eventSource.value = new EventSource(url)
      eventSource.value.addEventListener('message', onMessage)
      eventSource.value.addEventListener('error', onError)
      connected.value = true
    }
  }

  const onMessageResponse = <T>(callback: (data: T) => void) => {
    messageCallback = callback
  }

  const onErrorCallback = (callback: () => void) => {
    errorCallback = callback
  }

  const closeConnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      connected.value = false
    }
  }

  onBeforeUnmount(() => {
    closeConnect()
  })

  return { startConnect, closeConnect, connected, onMessageResponse, onErrorCallback }
}
