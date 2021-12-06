/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config";

import { assert, clickToolbarButton, collapseSelection, defer, moveCursor, selectNode, typeCharacters, testIf, testGroup, triggerEvent } from "test/test_helper";

const test = function() {
  return testIf(config.input.getLevel() === 0, ...arguments);
};

testGroup("Level 0 input: HTML replacement", () => testGroup("deleting with command+backspace", {template: "editor_empty"}, function() {
  test("from the end of a line", function(expectDocument) {
    getEditor().loadHTML("<div>a</div><blockquote>b</blockquote><div>c</div>");
    getSelectionManager().setLocationRange({index: 1, offset: 1});
    return pressCommandBackspace({replaceText: "b"}, function() {
      assert.locationRange({index: 1, offset: 0});
      assert.blockAttributes([0, 2], []);
      assert.blockAttributes([2, 3], ["quote"]);
      assert.blockAttributes([3, 5], []);
      return expectDocument("a\n\nc\n");
    });
  });

  test("in the first block", function(expectDocument) {
    getEditor().loadHTML("<div>a</div><blockquote>b</blockquote>");
    getSelectionManager().setLocationRange({index: 0, offset: 1});
    return pressCommandBackspace({replaceText: "a"}, function() {
      assert.locationRange({index: 0, offset: 0});
      assert.blockAttributes([0, 1], []);
      assert.blockAttributes([1, 3], ["quote"]);
      return expectDocument("\nb\n");
    });
  });

  test("from the middle of a line", function(expectDocument) {
    getEditor().loadHTML("<div>a</div><blockquote>bc</blockquote><div>d</div>");
    getSelectionManager().setLocationRange({index: 1, offset: 1});
    return pressCommandBackspace({replaceText: "b"}, function() {
      assert.locationRange({index: 1, offset: 0});
      assert.blockAttributes([0, 2], []);
      assert.blockAttributes([2, 4], ["quote"]);
      assert.blockAttributes([4, 6], []);
      return expectDocument("a\nc\nd\n");
    });
  });

  test("from the middle of a line in a multi-line block", function(expectDocument) {
    getEditor().loadHTML("<div>a</div><blockquote>bc<br>d</blockquote><div>e</div>");
    getSelectionManager().setLocationRange({index: 1, offset: 1});
    return pressCommandBackspace({replaceText: "b"}, function() {
      assert.locationRange({index: 1, offset: 0});
      assert.blockAttributes([0, 2], []);
      assert.blockAttributes([2, 6], ["quote"]);
      return expectDocument("a\nc\nd\ne\n");
    });
  });

  test("from the end of a list item", function(expectDocument) {
    getEditor().loadHTML("<ul><li>a</li><li>b</li></ul>");
    getSelectionManager().setLocationRange({index: 1, offset: 1});
    return pressCommandBackspace({replaceText: "b"}, function() {
      assert.locationRange({index: 1, offset: 0});
      assert.blockAttributes([0, 2], ["bulletList", "bullet"]);
      assert.blockAttributes([2, 4], ["bulletList", "bullet"]);
      return expectDocument("a\n\n");
    });
  });

  test("a character that is its text node's only data", function(expectDocument) {
    getEditor().loadHTML("<div>a<br>b<br><strong>c</strong></div>");
    getSelectionManager().setLocationRange({index: 0, offset: 3});
    return pressCommandBackspace({replaceText: "b"}, function() {
      assert.locationRange({index: 0, offset: 2});
      return expectDocument("a\n\nc\n");
    });
  });

  return test("a formatted word", function(expectDocument) {
    getEditor().loadHTML("<div>a<strong>bc</strong></div>");
    getSelectionManager().setLocationRange({index: 0, offset: 4});
    return pressCommandBackspace({replaceElementWithText: "bc"}, function() {
      assert.locationRange({index: 0, offset: 1});
      return expectDocument("a\n");
    });
  });
}));

var pressCommandBackspace = function({replaceText, replaceElementWithText}, callback) {
  let previousSibling;
  triggerEvent(document.activeElement, "keydown", {charCode: 0, keyCode: 8, which: 8, metaKey: true});
  const range = rangy.getSelection().getRangeAt(0);

  if (replaceElementWithText) {
    const element = getElementWithText(replaceElementWithText);
    ({previousSibling} = element);
    element.parentNode.removeChild(element);
    range.collapseAfter(previousSibling);
  } else {
    let nextSibling, parentNode;
    range.findText(replaceText, {direction: "backward"});
    range.splitBoundaries();

    const node = range.getNodes()[0];
    ({previousSibling, nextSibling, parentNode} = node);

    if ((previousSibling != null ? previousSibling.nodeType : undefined) === Node.COMMENT_NODE) {
      parentNode.removeChild(previousSibling);
    }

    node.data = "";
    parentNode.removeChild(node);

    if (!parentNode.hasChildNodes()) {
      parentNode.appendChild(document.createElement("br"));
    }

    range.collapseBefore(nextSibling != null ? nextSibling : parentNode.firstChild);
  }

  range.select();
  return requestAnimationFrame(callback);
};


var getElementWithText = function(text) {
  for (let element of Array.from(document.activeElement.querySelectorAll("*"))) {
    if (element.innerText === text) {
      return element;
    }
  }
  return null;
};
