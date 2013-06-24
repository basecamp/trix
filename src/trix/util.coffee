Trix.Util =
  requestAnimationFrame: ->
    requestAnimationFrame.apply null, arguments

requestAnimationFrame =
  window.requestAnimationFrame ?
  window.webkitRequestAnimationFrame ?
  window.mozRequestAnimationFrame ?
  window.msRequestAnimationFrame ?
  do ->
    lastTime = 0
    (callback) ->
      currentTime = new Date().getTime()
      timeToCall = Math.max 0, 16 - (currentTime - lastTime)
      setTimeout (-> callback currentTime + timeToCall), timeToCall
      lastTime = currentTime + timeToCall
