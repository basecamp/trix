{findClosestElementFromNode, nodeIsEmptyTextNode, nodeIsBlockStartComment, normalizeSpaces, summarizeStringChange, tagName} = Trix

class Trix.MutationObserver extends Trix.BasicObject
  mutableAttributeName = "data-trix-mutable"
  mutableSelector = "[#{mutableAttributeName}]"

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
    return false if @nodeIsMutable(mutation.target)
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
        unless mutation.attributeName is mutableAttributeName
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

    textChanges = @getTextChangesFromChildList()
    additions.push(addition) for addition in textChanges.additions when addition not in additions
    deletions.push(textChanges.deletions...)

    summary = {}
    summary.textAdded = added if added = additions.join("")
    summary.textDeleted = deleted if deleted = deletions.join("")
    summary

  getMutationsByType: (type) ->
    mutation for mutation in @mutations when mutation.type is type

  getTextChangesFromChildList: ->
    addedNodes = []
    removedNodes = []

    for mutation in @getMutationsByType("childList")
      addedNodes.push(mutation.addedNodes...)
      removedNodes.push(mutation.removedNodes...)

    singleBlockCommentRemoved =
      addedNodes.length is 0 and
        removedNodes.length is 1 and
        nodeIsBlockStartComment(removedNodes[0])

    if singleBlockCommentRemoved
      textAdded = []
      textRemoved = ["\n"]
    else
      textAdded = getTextForNodes(addedNodes)
      textRemoved = getTextForNodes(removedNodes)

    additions: (normalizeSpaces(text) for text, index in textAdded when text isnt textRemoved[index])
    deletions: (normalizeSpaces(text) for text, index in textRemoved when text isnt textAdded[index])

  getTextChangesFromCharacterData: ->
    characterMutations = @getMutationsByType("characterData")

    if characterMutations.length
      [startMutation, ..., endMutation] = characterMutations

      oldString = normalizeSpaces(startMutation.oldValue)
      newString = normalizeSpaces(endMutation.target.data)
      {added, removed} = summarizeStringChange(oldString, newString)

    additions: if added then [added] else []
    deletions: if removed then [removed] else []

  getTextForNodes = (nodes = []) ->
    text = []
    for node in nodes
      switch node.nodeType
        when Node.TEXT_NODE
          text.push(node.data)
        when Node.ELEMENT_NODE
          if tagName(node) is "br"
            text.push("\n")
          else
            text.push(getTextForNodes(node.childNodes)...)
    text
