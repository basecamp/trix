/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
if (!window.JST) { window.JST = {}; }

window.JST["trix/inspector/templates/selection"] = function() { return `\
Location range: [${ this.locationRange[0].index }:${ this.locationRange[0].offset }, ${ this.locationRange[1].index }:${ this.locationRange[1].offset }]

${ charSpans(this.characters).join("\n") }\
`; };

var charSpans = characters => Array.from(characters).map((char) =>
  `<span class=\"character ${ char.selected ? "selected" : undefined  }\">${ char.string }</span>`);
