import { h } from 'vue'
import { showDialog, closeDialog, type DialogOptions, Button } from 'vant'

interface DialogEvent {
  onConfirm?: () => void
}

export const useBaseDialog = () => {
  const openDialog = (opt: DialogOptions & DialogEvent) => {

    const title = opt.title || '提示'

    return showDialog({
      title,
      ...opt,
      showCancelButton: false,
      showConfirmButton: false,
      message: () => h('div', {
        class: 'flex flex-col'
      }, [
        h('div', {
          class: 'text-base'
        }, opt.message),
        h('div', {
          class: 'flex flex-col space-y-1 mt-6'
        }, [h(Button, {
          block: true,
          round: true,
          type: 'primary',
          class: 'text-base !bg-[#165DFF]',
          'onClick': () => (opt.onConfirm && opt.onConfirm()) || closeDialog()
        }, () => '确定'),
        h(Button, {
          block: true,
          round: true,
          type: 'default',
          class: 'text-base !border-none !text-neutral-500',
          'onClick': () => closeDialog()
        }, () => '取消')])
      ])
    })
  }
  return {
    openDialog,
    closeDialog
  }
}
