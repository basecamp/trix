{defer, findClosestElementFromNode, nodeIsEmptyTextNode, normalizeSpaces, summarizeStringChange} = Trix

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
    @mutations.push(@findSignificantMutations(mutations)...)

    if @mutations.length
      @delegate?.elementDidMutate?(@getMutationSummary())
      @reset()

  # Private

  reset: ->
    @mutations = []

  findSignificantMutations: (mutations) ->
    mutation for mutation in mutations when @mutationIsSignificant(mutation)

  mutationIsSignificant: (mutation) ->
    return true for node in @nodesModifiedByMutation(mutation) when @nodeIsSignificant(node)
    false

  nodeIsSignificant: (node) ->
    node isnt @element and not @nodeIsMutable(node) and not nodeIsEmptyTextNode(node)

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
    {additions, deletions} = @getTextChangesFromCharacterData()

    textChanges = @getTextChangesFromTextNodes()
    additions.push(addition) for addition in textChanges.additions when addition not in additions
    deletions.push(textChanges.deletions...)

    summary = {}
    summary.textAdded = added if added = additions.join("")
    summary.textDeleted = deleted if deleted = deletions.join("")
    summary

  getMutationsByType: (type) ->
    mutation for mutation in @mutations when mutation.type is type

  getTextChangesFromTextNodes: ->
    nodesAdded = []
    nodesRemoved = []

    for mutation in @getMutationsByType("childList")
      for node in mutation.removedNodes when node.nodeType is Node.TEXT_NODE
        nodesRemoved.push(node)
      for node in mutation.addedNodes when node.nodeType is Node.TEXT_NODE
        nodesAdded.push(node)

    additions: (normalizeSpaces(node.data) for node, index in nodesAdded when node.data isnt nodesRemoved[index]?.data)
    deletions: (normalizeSpaces(node.data) for node, index in nodesRemoved when node.data isnt nodesAdded[index]?.data)

  getTextChangesFromCharacterData: ->
    characterMutations = @getMutationsByType("characterData")

    if characterMutations.length
      [startMutation, ..., endMutation] = characterMutations

      oldString = normalizeSpaces(startMutation.oldValue)
      newString = normalizeSpaces(endMutation.target.data)
      {added, removed} = summarizeStringChange(oldString, newString)

    additions: if added then [added] else []
    deletions: if removed then [removed] else []
