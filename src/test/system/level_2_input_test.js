/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config";
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants";

import { assert, after, clickToolbarButton, defer, insertString, insertNode, isToolbarButtonActive, selectAll, selectNode, testIf, testGroup, triggerEvent, triggerInputEvent, typeCharacters } from "test/test_helper";

const test = function() {
  return testIf(config.input.getLevel() === 2, ...arguments);
};

const testOptions = {
  template: "editor_empty",
  setup() {
    addEventListener("beforeinput", recordInputEvent, true);
    return addEventListener("input", recordInputEvent, true);
  },
  teardown() {
    removeEventListener("beforeinput", recordInputEvent, true);
    return removeEventListener("input", recordInputEvent, true);
  }
};

let inputEvents = [];

var recordInputEvent = function(event) {
  // Not all browsers dispatch "beforeinput" event when calling execCommand() so
  // we manually dispatch a synthetic one. If a second one arrives, ignore it.
  if ((event.type === "beforeinput") && (inputEvents.length === 1) && (inputEvents[0].type === "beforeinput")) {
    return event.stopImmediatePropagation();
  } else {
    const {type, inputType, data} = event;
    return inputEvents.push({type, inputType, data});
  }
};

// Borrowed from https://github.com/web-platform-tests/wpt/blob/master/input-events/input-events-exec-command.html
const performInputTypeUsingExecCommand = function(command, {inputType, data}, callback) {
  inputEvents = [];
  return requestAnimationFrame(function() {
    triggerInputEvent(document.activeElement, "beforeinput", {inputType, data});
    document.execCommand(command, false, data);
    assert.equal(inputEvents.length, 2);
    assert.equal(inputEvents[0].type, "beforeinput");
    assert.equal(inputEvents[1].type, "input");
    assert.equal(inputEvents[0].inputType, inputType);
    assert.equal(inputEvents[0].data, data);
    return requestAnimationFrame(() => requestAnimationFrame(callback));
  });
};

testGroup("Level 2 Input", testOptions, function() {
  test("insertText", expectDocument => performInputTypeUsingExecCommand("insertText", {inputType: "insertText", data: "abc"}, () => expectDocument("abc\n")));

  test("insertOrderedList", function(expectDocument) {
    insertString("a\nb");
    return performInputTypeUsingExecCommand("insertOrderedList", {inputType: "insertOrderedList"}, function() {
      assert.blockAttributes([0, 2], []);
      assert.blockAttributes([2, 4], ["numberList", "number"]);
      assert.ok(isToolbarButtonActive({attribute: "number"}));
      return expectDocument("a\nb\n");
    });
  });

  test("insertUnorderedList", function(expectDocument) {
    insertString("a\nb");
    return performInputTypeUsingExecCommand("insertUnorderedList", {inputType: "insertUnorderedList"}, function() {
      assert.blockAttributes([0, 2], []);
      assert.blockAttributes([2, 4], ["bulletList", "bullet"]);
      assert.ok(isToolbarButtonActive({attribute: "bullet"}));
      return expectDocument("a\nb\n");
    });
  });

  test("insertLineBreak", expectDocument => clickToolbarButton({attribute: "quote"}, function() {
    insertString("abc");
    return performInputTypeUsingExecCommand("insertLineBreak", {inputType: "insertLineBreak"}, () => performInputTypeUsingExecCommand("insertLineBreak", {inputType: "insertLineBreak"}, function() {
      assert.blockAttributes([0, 6], ["quote"]);
      return expectDocument("abc\n\n\n");
    }));
  }));

  test("insertParagraph", expectDocument => clickToolbarButton({attribute: "quote"}, function() {
    insertString("abc");
    return performInputTypeUsingExecCommand("insertParagraph", {inputType: "insertParagraph"}, () => performInputTypeUsingExecCommand("insertParagraph", {inputType: "insertParagraph"}, function() {
      assert.blockAttributes([0, 4], ["quote"]);
      assert.blockAttributes([4, 5], []);
      return expectDocument("abc\n\n");
    }));
  }));

  test("formatBold", function(expectDocument) {
    insertString("abc");
    getComposition().setSelectedRange([1, 2]);
    return performInputTypeUsingExecCommand("bold", {inputType: "formatBold"}, function() {
      assert.textAttributes([0, 1], {});
      assert.textAttributes([1, 2], {bold: true});
      assert.textAttributes([2, 3], {});
      return expectDocument("abc\n");
    });
  });

  test("formatItalic", function(expectDocument) {
    insertString("abc");
    getComposition().setSelectedRange([1, 2]);
    return performInputTypeUsingExecCommand("italic", {inputType: "formatItalic"}, function() {
      assert.textAttributes([0, 1], {});
      assert.textAttributes([1, 2], {italic: true});
      assert.textAttributes([2, 3], {});
      return expectDocument("abc\n");
    });
  });

  test("formatStrikeThrough", function(expectDocument) {
    insertString("abc");
    getComposition().setSelectedRange([1, 2]);
    return performInputTypeUsingExecCommand("strikeThrough", {inputType: "formatStrikeThrough"}, function() {
      assert.textAttributes([0, 1], {});
      assert.textAttributes([1, 2], {strike: true});
      assert.textAttributes([2, 3], {});
      return expectDocument("abc\n");
    });
  });

  // https://input-inspector.now.sh/profiles/hVXS1cHYFvc2EfdRyTWQ
  test("correcting a misspelled word in Chrome", function(expectDocument) {
    insertString("onr");
    getComposition().setSelectedRange([0, 3]);
    return requestAnimationFrame(function() {
      const inputType = "insertReplacementText";
      const dataTransfer = createDataTransfer({"text/plain": "one"});
      const event = createEvent("beforeinput", {inputType, dataTransfer});
      document.activeElement.dispatchEvent(event);
      return requestAnimationFrame(() => expectDocument("one\n"));
    });
  });

  // https://input-inspector.now.sh/profiles/XsZVwKtFxakwnsNs0qnX
  test("correcting a misspelled word in Safari", function(expectDocument) {
    insertString("onr");
    getComposition().setSelectedRange([0, 3]);
    return requestAnimationFrame(function() {
      const inputType = "insertText";
      const dataTransfer = createDataTransfer({"text/plain": "one", "text/html": "one"});
      const event = createEvent("beforeinput", {inputType, dataTransfer});
      document.activeElement.dispatchEvent(event);
      return requestAnimationFrame(() => expectDocument("one\n"));
    });
  });

  // https://input-inspector.now.sh/profiles/yZlsrfG93QMzp2oyr0BE
  test("deleting the last character in a composed word on Android", function(expectDocument) {
    insertString("c");
    const element = getEditorElement();
    const textNode = element.firstChild.lastChild;
    return selectNode(textNode, function() {
      triggerInputEvent(element, "beforeinput", {inputType: "insertCompositionText", data: ""});
      triggerEvent(element, "compositionend", {data: ""});
      return requestAnimationFrame(() => expectDocument("\n"));
    });
  });

  test("pasting a file", expectDocument => createFile(function(file) {
    const clipboardData = createDataTransfer({"Files": [file]});
    const dataTransfer = createDataTransfer({"Files": [file]});
    return paste({clipboardData, dataTransfer}, function() {
      const attachments = getDocument().getAttachments();
      assert.equal(attachments.length, 1);
      assert.equal(attachments[0].getFilename(), file.name);
      return expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`);
    });
  }));

  // "insertFromPaste InputEvent missing pasted files in dataTransfer"
  // - https://bugs.webkit.org/show_bug.cgi?id=194921
  test("pasting a file in Safari", expectDocument => createFile(function(file) {
    const clipboardData = createDataTransfer({"Files": [file]});
    const dataTransfer = createDataTransfer({"text/html": `<img src="blob:${location.origin}/531de8">`});
    return paste({clipboardData, dataTransfer}, function() {
      const attachments = getDocument().getAttachments();
      assert.equal(attachments.length, 1);
      assert.equal(attachments[0].getFilename(), file.name);
      return expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`);
    });
  }));

  // "insertFromPaste InputEvent missing text/uri-list in dataTransfer for pasted links"
  // - https://bugs.webkit.org/show_bug.cgi?id=196702
  test("pasting a link in Safari", expectDocument => createFile(function(file) {
    const url = "https://bugs.webkit.org";
    const text = "WebKit Bugzilla";
    const clipboardData = createDataTransfer({"URL": url, "text/uri-list": url, "text/plain": text});
    const dataTransfer = createDataTransfer({"text/html": `<a href="${url}">${text}</a>`, "text/plain": text});
    return paste({clipboardData, dataTransfer}, function() {
      assert.textAttributes([0, url.length], {href: url});
      return expectDocument(`${url}\n`);
    });
  }));

  // Pastes from MS Word include an image of the copied text 🙃
  // https://input-inspector.now.sh/profiles/QWDITsV60dpEVl1SOZg8
  test("pasting text from MS Word", expectDocument => createFile(function(file) {
    let dataTransfer;
    const clipboardData = (dataTransfer = createDataTransfer({
      "text/html": "<span class=\"MsoNormal\">abc</span>",
      "text/plain": "abc",
      "Files": [file]}));

    return paste({dataTransfer}, function() {
      const attachments = getDocument().getAttachments();
      assert.equal(attachments.length, 0);
      return expectDocument("abc\n");
    });
  }));

  // "beforeinput" event is not fired for Paste and Match Style operations
  // - https://bugs.chromium.org/p/chromium/issues/detail?id=934448
  return test("Paste and Match Style in Chrome", function(expectDocument) {
    const done = () => expectDocument("a\n\nb\n\nc\n");
    return typeCharacters("a\n\n", function() {
      const clipboardData = createDataTransfer({"text/plain": "b\n\nc"});
      const pasteEvent = createEvent("paste", {clipboardData});
      if (document.activeElement.dispatchEvent(pasteEvent)) {
        const node = document.createElement("div");
        node.innerHTML = "<div>b</div><div><br></div><div>c</div>";
        return insertNode(node, done);
      } else {
        return requestAnimationFrame(done);
      }
    });
  });
});


var createFile = function(callback) {
  const canvas = document.createElement("canvas");
  return canvas.toBlob(function(file) {
    file.name = "image.png";
    return callback(file);
  });
};

var createDataTransfer = function(data) {
  if (data == null) { data = {}; }
  return {
    types: (((() => {
      const result = [];
      for (let key in data) {
        result.push(key);
      }
      return result;
    })())),
    files: data.Files != null ? data.Files : [],
    getData(type) { return data[type]; }
  };
};

var createEvent = function(type, properties) {
  if (properties == null) { properties = {}; }
  const event = document.createEvent("Events");
  event.initEvent(type, true, true);
  for (let key in properties) {
    const value = properties[key];
    Object.defineProperty(event, key, {value});
  }
  return event;
};

var paste = function(param, callback) {
  if (param == null) { param = {}; }
  const {dataTransfer, clipboardData} = param;
  const pasteEvent = createEvent("paste", {clipboardData: clipboardData || dataTransfer});
  const inputEvent = createEvent("beforeinput", {inputType: "insertFromPaste", dataTransfer});
  if (document.activeElement.dispatchEvent(pasteEvent)) {
    document.activeElement.dispatchEvent(inputEvent);
  }
  return after(60, callback);
};
