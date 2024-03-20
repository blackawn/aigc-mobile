/**
 * 复制文本
 * @param text 
 * @returns 
 */
export function copyToClipboard(text: string): boolean {
  if (window.Clipboard && (window.Clipboard as any).setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return (Clipboard as any).setData('Text', text)

  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    const textarea = document.createElement('textarea')
    textarea.textContent = text
    textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea)
    textarea.select()
    try {
      return document.execCommand('copy') // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex)
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
  return false // Added this line to ensure a boolean return value
}
