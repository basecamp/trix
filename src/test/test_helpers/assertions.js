/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import DocumentView from "trix/views/document_view";

import { normalizeRange, rangesAreEqual } from "trix/core/helpers";

const {
  assert
} = QUnit;

assert.locationRange = function(start, end) {
  const expectedLocationRange = normalizeRange([start, end]);
  const actualLocationRange = getEditorController().getLocationRange();
  return this.deepEqual(actualLocationRange, expectedLocationRange);
};

assert.selectedRange = function(range) {
  const expectedRange = normalizeRange(range);
  const actualRange = getEditor().getSelectedRange();
  return this.deepEqual(actualRange, expectedRange);
};

assert.textAttributes = function(range, attributes) {
  const document = window.getDocument().getDocumentAtRange(range);
  const blocks = document.getBlocks();
  if (blocks.length !== 1) { throw `range ${JSON.stringify(range)} spans more than one block`; }

  const locationRange = window.getDocument().locationRangeFromRange(range);
  const textIndex = locationRange[0].index;
  const textRange = [locationRange[0].offset, locationRange[1].offset];
  const text = window.getDocument().getTextAtIndex(textIndex).getTextAtRange(textRange);
  const pieces = text.getPieces();
  if (pieces.length !== 1) { throw `range ${JSON.stringify(range)} must only span one piece`; }

  const piece = pieces[0];
  return this.deepEqual(piece.getAttributes(), attributes);
};

assert.blockAttributes = function(range, attributes) {
  const document = window.getDocument().getDocumentAtRange(range);
  const blocks = document.getBlocks();
  if (blocks.length !== 1) { throw `range ${JSON.stringify(range)} spans more than one block`; }

  const block = blocks[0];
  return this.deepEqual(block.getAttributes(), attributes);
};

assert.documentHTMLEqual = function(trixDocument, html) {
  return this.equal(getHTML(trixDocument), html);
};

var getHTML = trixDocument => DocumentView.render(trixDocument).innerHTML;

export { assert, getHTML };
