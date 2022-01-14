if (!window.JST) window.JST = {}

window.JST["trix/inspector/templates/selection"] = function() {
  return `Location range: [${this.locationRange[0].index}:${this.locationRange[0].offset}, ${this.locationRange[1].index}:${this.locationRange[1].offset}]
    ${charSpans(this.characters).join("\n")}`
}

const charSpans = (characters) =>
  Array.from(characters).map(
    (char) => `<span class="character ${char.selected ? "selected" : undefined}">${char.string}</span>`
  )
