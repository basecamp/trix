{makeElement} = Trix

prototypes =
  cursorTarget:
    makeElement
      tagName: "span"
      textContent: Trix.ZERO_WIDTH_SPACE
      data:
        trixCursorTarget: true
        trixSerialize: false

Trix.extend
  selectionElements:
    create: (name, targetName) ->
      node = prototypes[name].cloneNode(true)
      node.dataset.trixCursorTarget = targetName
      node
