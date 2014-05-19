#= require trix/lib/helpers

{defer} = Trix.Helpers

class Trix.MutationObserver
  options =
    attributes: true
    childList: true
    characterData: true
    subtree: true

  constructor: (@element) ->
    @observer = new window.MutationObserver @didMutate
    @start()

  didMutate: (mutations) => defer =>
    @delegate?.elementDidMutate?(mutations)

  start: ->
    @observer.observe(@element, options)

  stop: ->
    @observer.disconnect()
