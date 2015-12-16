{makeElement} = Trix

prototypes =
  cursorPoint:
    makeElement
      tagName: "span"
      data:
        trixSelection: true
        trixMutable: true
        trixSerialize: false

  cursorTarget:
    makeElement
      tagName: "span"
      textContent: Trix.ZERO_WIDTH_SPACE
      data:
        trixSelection: true
        trixCursorTarget: true
        trixSerialize: false

Trix.extend
  selectionElements:
    selector: "[data-trix-selection]"

    cssText: """
      font-size: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
    """

    create: (name) ->
      prototypes[name].cloneNode(true)

    remove: (element) ->
      {parentElement} = element
      parentElement.dataset.trixMutable = true
      parentElement.removeChild(element)
      defer ->
        delete parentElement.dataset.trixMutable
