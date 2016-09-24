{makeElement, defer} = Trix

prototypes =
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
      line-height: 0 !important;
    """

    create: (name) ->
      prototypes[name].cloneNode(true)
