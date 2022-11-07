export function nextFrame() {
  return new Promise(requestAnimationFrame)
}

export function nextIdle() {
  return new Promise(window.requestIdleCallback || setTimeout)
}

export function delay(ms = 1) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
