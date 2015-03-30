{defer, findClosestElementFromNode, normalizeSpaces, summarizeStringChange} = Trix

class Trix.MutationObserver extends Trix.BasicObject
  mutableSelector = "[data-trix-mutable]"

  options =
    attributes: true
    childList: true
    characterData: true
    characterDataOldValue: true
    subtree: true

  constructor: (@element) ->
    @observer = new window.MutationObserver @didMutate
    @start()

  start: ->
    @reset()
    @observer.observe(@element, options)

  stop: ->
    @observer.disconnect()

  didMutate: (mutations) =>
    clearTimeout(@debounce)
    @mutations.push(@findSignificantMutations(mutations)...)

    @debounce = setTimeout =>
      if @mutations.length
        @delegate?.elementDidMutate?(@getMutationSummary())
        @reset()
    , 1

  # Private

  reset: ->
    @mutations = []

  findSignificantMutations: (mutations) ->
    mutation for mutation in mutations when @mutationIsSignificant(mutation)

  mutationIsSignificant: (mutation) ->
    return true for node in @nodesModifiedByMutation(mutation) when @nodeIsSignificant(node)
    false

  nodeIsSignificant: (node) ->
    node isnt @element and not @nodeIsMutable(node)

  nodeIsMutable: (node) ->
    findClosestElementFromNode(node, matchingSelector: mutableSelector)

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

  getMutationSummary: ->
    @getTextMutationSummary()

  getTextMutationSummary: ->
    additions = []
    deletions = []

    characterMutations = @getMutationsByType("characterData")

    if characterMutations.length
      [startMutation, ..., endMutation] = characterMutations

      oldString = normalizeSpaces(startMutation.oldValue)
      newString = normalizeSpaces(endMutation.target.data)
      {added, removed} = summarizeStringChange(oldString, newString)

      additions.push(added)
      deletions.push(removed)

    for node in @getRemovedTextNodes()
      deletions.push(node.data)

    summary = {}
    summary.textAdded = added if added = additions.join("")
    summary.textDeleted = deleted if deleted = deletions.join("")
    summary

  getMutationsByType: (type) ->
    mutation for mutation in @mutations when mutation.type is type

  getRemovedTextNodes: ->
    nodes = []
    for mutation in @getMutationsByType("childList")
      for node in mutation.removedNodes when node.nodeType is Node.TEXT_NODE
        nodes.push(node)
    nodes
