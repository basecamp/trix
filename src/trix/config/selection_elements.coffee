{makeElement} = Trix

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
      display: inline-block !important;
      padding: 0 !important;
      margin: 0 -1px 0 0 !important;
      width: 1px !important;
      border: none !important;
    """

    create: (name) ->
      prototypes[name].cloneNode(true)
