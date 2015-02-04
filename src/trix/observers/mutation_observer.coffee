{defer, findClosestElementFromNode} = Trix

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
    @observer.observe(@element, options)

  stop: ->
    @observer.disconnect()

  didMutate: (mutations) =>
    clearTimeout(@debounce)

    @mutations ?= []
    @mutations.push(mutations...)

    @debounce = setTimeout =>
      significantMutations = @findSignificantMutations(@mutations)
      return unless significantMutations.length
      @delegate?.elementDidMutate?(summarizeMutations(significantMutations))
      @mutations = []
    , 1

  # Private

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

  summarizeMutations = (mutations) ->
    summarizeTextMutations(mutations)

  summarizeTextMutations = (mutations) ->
    additions = []
    deletions = []

    characterMutations = (mutation for mutation in mutations when mutation.type is "characterData")
    if characterMutations.length
      [startMutation, ..., endMutation] = characterMutations
      oldString = normalizeSpaces(startMutation.oldValue)
      newString = normalizeSpaces(endMutation.target.data)

      additions.push(stringDifference(newString, oldString))
      deletions.push(stringDifference(oldString, newString))

    for node in getRemovedTextNodes(mutations)
      deletions.push(node.data)

    summary = {}
    summary.textAdded = added if added = additions.join("")
    summary.textDeleted = deleted if deleted = deletions.join("")
    summary

  getRemovedTextNodes = (mutations) ->
    nodes = []
    for mutation in mutations when mutation.type is "childList"
      for node in mutation.removedNodes when node.nodeType is Node.TEXT_NODE
        nodes.push(node)
    nodes

  stringDifference = (a, b) ->
    leftIndex = 0
    rightIndexA = a.length
    rightIndexB = b.length

    while leftIndex < rightIndexA and a.charAt(leftIndex) is b.charAt(leftIndex)
      leftIndex++

    while rightIndexA > leftIndex and a.charAt(rightIndexA - 1) is b.charAt(rightIndexB - 1)
      rightIndexA--
      rightIndexB--

    a.slice(leftIndex, rightIndexA)

  normalizeSpaces = (string) ->
    string.replace(/\s/g, " ")
