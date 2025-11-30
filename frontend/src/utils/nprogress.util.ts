import NProgress from 'nprogress'

NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 400,
  trickle: true,
  trickleSpeed: 200,
})

let activeRequests = 0
let progressTimeout: ReturnType<typeof setTimeout> | null = null

export const progress = {
  start: () => {
    activeRequests++

    if (activeRequests === 1) {
      progressTimeout = setTimeout(() => {
        NProgress.start()
      }, 200)
    }
  },

  stop: () => {
    activeRequests = Math.max(0, activeRequests - 1)

    if (activeRequests === 0) {
      if (progressTimeout) {
        clearTimeout(progressTimeout)
        progressTimeout = null
      }
      NProgress.done()
    }
  },

  reset: () => {
    activeRequests = 0
    if (progressTimeout) {
      clearTimeout(progressTimeout)
      progressTimeout = null
    }
    NProgress.done()
  },
}
