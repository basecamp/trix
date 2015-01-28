{defer} = Trix.Helpers
{DOM} = Trix

class Trix.MutationObserver extends Trix.BasicObject
  options =
    attributes: true
    childList: true
    characterData: true
    subtree: true

  constructor: (@element) ->
    @observer = new window.MutationObserver @didMutate
    @reset()
    @start()

  start: ->
    @observer.observe(@element, options)

  stop: ->
    @observer.disconnect()

  didMutate: (mutations) =>
    significantMutations = @findSignificantMutations(mutations)
    @mutations.push(significantMutations...)
    @notifyDelegateOnce()

  # Private

  findSignificantMutations: (mutations) ->
    mutation for mutation in mutations when @mutationIsSignificant(mutation)

  mutationIsSignificant: (mutation) ->
    return true for node in @nodesModifiedByMutation(mutation) when @nodeIsSignificant(node)
    false

  nodeIsSignificant: (node) ->
    node isnt @element and @nodeIsEditable(node)

  nodeIsEditable: (node) ->
    DOM.findClosestElementFromNode(node)?.isContentEditable

  nodesModifiedByMutation: (mutation) ->
    nodes = []
    switch mutation.type
      when "attributes"
        nodes.push(mutation.target)
      when "characterData"
        # Changes to text nodes should consider the parent element
        nodes.push(mutation.target.parentNode)
        nodes.push(mutation.target)
      when "childList"
        # Consider each added or removed node
        nodes.push(mutation.addedNodes...)
        nodes.push(mutation.removedNodes...)
    nodes

  reset: ->
    @mutations = []

  notifyDelegateOnce: ->
    if @mutations.length
      clearTimeout(@timeout)
      @timeout = setTimeout =>
        @delegate?.elementDidMutate?(@mutations)
        @reset()
      , 20
