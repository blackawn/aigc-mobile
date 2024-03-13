import { h } from 'vue'
import { showDialog, closeDialog, setDialogDefaultOptions,resetDialogDefaultOptions, type DialogOptions, Button } from 'vant'

type ButtonDirection = 'horizontal' | 'vertical'

interface DialogProps {
  onConfirm?: () => void
  confirmText?: string
  onCancel?: () => void
  cancelText?: string
  buttonDirection?: ButtonDirection
  onOpen?: () => void
}

export const useBaseDialog = () => {

  const openDialog = (opt: DialogOptions & DialogProps) => {

    opt.onOpen && opt.onOpen()

    const buttonDirection = opt.buttonDirection || 'horizontal'

    const message = typeof opt.message === 'function' ? h(opt.message) : h('div', {
      class: 'text-base'
    }, opt.message)

    const title = opt.title || '提示'

    return showDialog({
      title,
      ...opt,
      showCancelButton: false,
      showConfirmButton: false,
      message: () => h('div', {
        class: 'flex flex-col'
      }, [
        message,
        h('div', {
          class: `flex mt-6 ${buttonDirection === 'horizontal' ? 'gap-x-3 px-4 flex-row-reverse' : 'flex-col px-8 gap-y-3'}`
        }, [h(Button, {
          block: true,
          round: true,
          type: 'primary',
          class: 'text-base !bg-[#165DFF]',
          'onClick': () => (opt.onConfirm && opt.onConfirm()) || closeDialog()
        }, () => (opt.confirmText || '确定')),
        h(Button, {
          block: true,
          round: true,
          type: 'default',
          class: 'text-base !border-none !text-neutral-500 !bg-neutral-50',
          'onClick': () => (opt.onCancel && opt.onCancel()) || closeDialog()
        }, () => (opt.cancelText || '取消'))])
      ])
    })
    
  }
  
  return {
    openDialog,
    closeDialog,
    setDialogDefaultOptions,
    resetDialogDefaultOptions
  }
}
