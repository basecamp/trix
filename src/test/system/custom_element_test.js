/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { rangesAreEqual } from "trix/core/helpers";

import { after, assert, clickElement, clickToolbarButton, createFile, defer,
  insertImageAttachment, moveCursor, pasteContent, skip, test, testIf, testGroup,
  triggerEvent, typeCharacters, typeInToolbarDialog, TEST_IMAGE_URL } from "test/test_helper";

testGroup("Custom element API", {template: "editor_empty"}, function() {
  test("element triggers trix-initialize on first connect", function(done) {
    const container = document.getElementById("trix-container");
    container.innerHTML = "";

    let initializeEventCount = 0;
    const element = document.createElement("trix-editor");
    element.addEventListener("trix-initialize", () => initializeEventCount++);

    container.appendChild(element);
    return requestAnimationFrame(function() {
      container.removeChild(element);
      return requestAnimationFrame(function() {
        container.appendChild(element);
        return after(60, function() {
          assert.equal(initializeEventCount, 1);
          return done();
        });
      });
    });
  });

  test("files are accepted by default", function() {
    getComposition().insertFile(createFile());
    return assert.equal(getComposition().getAttachments().length, 1);
  });

  test("rejecting a file by canceling the trix-file-accept event", function() {
    getEditorElement().addEventListener("trix-file-accept", event => event.preventDefault());
    getComposition().insertFile(createFile());
    return assert.equal(getComposition().getAttachments().length, 0);
  });

  test("element triggers attachment events", function() {
    const file = createFile();
    const element = getEditorElement();
    const composition = getComposition();
    let attachment = null;
    const events = [];

    element.addEventListener("trix-file-accept", function(event) {
      events.push(event.type);
      return assert.ok(file === event.file);
    });

    element.addEventListener("trix-attachment-add", function(event) {
      events.push(event.type);
      return attachment = event.attachment;
    });

    composition.insertFile(file);
    assert.deepEqual(events, ["trix-file-accept", "trix-attachment-add"]);

    element.addEventListener("trix-attachment-remove", function(event) {
      events.push(event.type);
      return assert.ok(attachment === event.attachment);
    });

    attachment.remove();
    return assert.deepEqual(events, ["trix-file-accept", "trix-attachment-add", "trix-attachment-remove"]);
});

  test("element triggers trix-change when an attachment is edited", function() {
    const file = createFile();
    const element = getEditorElement();
    const composition = getComposition();
    let attachment = null;
    const events = [];

    element.addEventListener("trix-attachment-add", event => attachment = event.attachment);

    composition.insertFile(file);

    element.addEventListener("trix-attachment-edit", event => events.push(event.type));

    element.addEventListener("trix-change", event => events.push(event.type));

    attachment.setAttributes({width: 9876});
    return assert.deepEqual(events, ["trix-attachment-edit", "trix-change"]);
});

  test("editing the document in a trix-attachment-add handler doesn't trigger trix-attachment-add again", function() {
    const element = getEditorElement();
    const composition = getComposition();
    let eventCount = 0;

    element.addEventListener("trix-attachment-add", function() {
      if (eventCount++ === 0) {
        element.editor.setSelectedRange([0,1]);
        return element.editor.activateAttribute("bold");
      }
    });

    composition.insertFile(createFile());
    return assert.equal(eventCount, 1);
  });

  test("element triggers trix-change events when the document changes", function(done) {
    const element = getEditorElement();
    let eventCount = 0;
    element.addEventListener("trix-change", event => eventCount++);

    return typeCharacters("a", function() {
      assert.equal(eventCount, 1);
      return moveCursor("left", function() {
        assert.equal(eventCount, 1);
        return typeCharacters("bcd", function() {
          assert.equal(eventCount, 4);
          return clickToolbarButton({action: "undo"}, function() {
            assert.equal(eventCount, 5);
            return done();
          });
        });
      });
    });
  });

  test("element triggers trix-change event after toggling attributes", function(done) {
    const element = getEditorElement();
    const {
      editor
    } = element;

    const afterChangeEvent = function(edit, callback) {
      let handler;
      element.addEventListener("trix-change", (handler = function(event) {
        element.removeEventListener("trix-change", handler);
        return callback(event);
      })
      );
      return edit();
    };

    return typeCharacters("hello", function() {
      let edit = () => editor.activateAttribute("quote");
      return afterChangeEvent(edit, function() {
        assert.ok(editor.attributeIsActive("quote"));

        edit = () => editor.deactivateAttribute("quote");
        return afterChangeEvent(edit, function() {
          assert.notOk(editor.attributeIsActive("quote"));

          editor.setSelectedRange([0, 5]);
          edit = () => editor.activateAttribute("bold");
          return afterChangeEvent(edit, function() {
            assert.ok(editor.attributeIsActive("bold"));

            edit = () => editor.deactivateAttribute("bold");
            return afterChangeEvent(edit, function() {
              assert.notOk(editor.attributeIsActive("bold"));
              return done();
            });
          });
        });
      });
    });
  });

  test("disabled attributes aren't considered active", function(done) {
    const {editor} = getEditorElement();
    editor.activateAttribute("heading1");
    assert.notOk(editor.attributeIsActive("code"));
    assert.notOk(editor.attributeIsActive("quote"));
    return done();
  });

  test("element triggers trix-selection-change events when the location range changes", function(done) {
    const element = getEditorElement();
    let eventCount = 0;
    element.addEventListener("trix-selection-change", event => eventCount++);

    return typeCharacters("a", function() {
      assert.equal(eventCount, 1);
      return moveCursor("left", function() {
        assert.equal(eventCount, 2);
        return done();
      });
    });
  });

  test("only triggers trix-selection-change events on the active element", function(done) {
    const elementA = getEditorElement();
    const elementB = document.createElement("trix-editor");
    elementA.parentNode.insertBefore(elementB, elementA.nextSibling);

    return elementB.addEventListener("trix-initialize", function() {
      elementA.editor.insertString("a");
      elementB.editor.insertString("b");
      rangy.getSelection().removeAllRanges();

      let eventCountA = 0;
      let eventCountB = 0;
      elementA.addEventListener("trix-selection-change", event => eventCountA++);
      elementB.addEventListener("trix-selection-change", event => eventCountB++);

      elementA.editor.setSelectedRange(0);
      assert.equal(eventCountA, 1);
      assert.equal(eventCountB, 0);

      elementB.editor.setSelectedRange(0);
      assert.equal(eventCountA, 1);
      assert.equal(eventCountB, 1);

      elementA.editor.setSelectedRange(1);
      assert.equal(eventCountA, 2);
      assert.equal(eventCountB, 1);
      return done();
    });
  });

  test("element triggers toolbar dialog events", function(done) {
    const element = getEditorElement();
    const events = [];

    element.addEventListener("trix-toolbar-dialog-show", event => events.push(event.type));

    element.addEventListener("trix-toolbar-dialog-hide", event => events.push(event.type));

    return clickToolbarButton({action: "link"}, () => typeInToolbarDialog("http://example.com", {attribute: "href"}, () => defer(function() {
      assert.deepEqual(events, ["trix-toolbar-dialog-show", "trix-toolbar-dialog-hide"]);
      return done();
    })));
  });

  test("element triggers before-paste event with paste data", function(expectDocument) {
    const element = getEditorElement();
    let eventCount = 0;
    let paste = null;

    element.addEventListener("trix-before-paste", function(event) {
      eventCount++;
      return ({paste} = event);
    });

    return typeCharacters("", () => pasteContent("text/html", "<strong>hello</strong>", function() {
      assert.equal(eventCount, 1);
      assert.equal(paste.type, "text/html");
      assert.equal(paste.html, "<strong>hello</strong>");
      return expectDocument("hello\n");
    }));
  });

  test("element triggers before-paste event with mutable paste data", function(expectDocument) {
    const element = getEditorElement();
    let eventCount = 0;
    let paste = null;

    element.addEventListener("trix-before-paste", function(event) {
      eventCount++;
      ({paste} = event);
      return paste.html = "<strong>greetings</strong>";
    });

    return typeCharacters("", () => pasteContent("text/html", "<strong>hello</strong>", function() {
      assert.equal(eventCount, 1);
      assert.equal(paste.type, "text/html");
      return expectDocument("greetings\n");
    }));
  });

  test("element triggers paste event with position range", function(done) {
    const element = getEditorElement();
    let eventCount = 0;
    let paste = null;

    element.addEventListener("trix-paste", function(event) {
      eventCount++;
      return ({paste} = event);
    });

    return typeCharacters("", () => pasteContent("text/html", "<strong>hello</strong>", function() {
      assert.equal(eventCount, 1);
      assert.equal(paste.type, "text/html");
      assert.ok(rangesAreEqual([0, 5], paste.range));
      return done();
    }));
  });

  test("element triggers attribute change events", function(done) {
    const element = getEditorElement();
    let eventCount = 0;
    let attributes = null;

    element.addEventListener("trix-attributes-change", function(event) {
      eventCount++;
      return ({attributes} = event);
    });

    return typeCharacters("", function() {
      assert.equal(eventCount, 0);
      return clickToolbarButton({attribute: "bold"}, function() {
        assert.equal(eventCount, 1);
        assert.deepEqual({ bold: true }, attributes);
        return done();
      });
    });
  });

  test("element triggers action change events", function(done) {
    const element = getEditorElement();
    let eventCount = 0;
    let actions = null;

    element.addEventListener("trix-actions-change", function(event) {
      eventCount++;
      return ({actions} = event);
    });

    return typeCharacters("", function() {
      assert.equal(eventCount, 0);
      return clickToolbarButton({attribute: "bullet"}, function() {
        assert.equal(eventCount, 1);
        assert.equal(actions.decreaseNestingLevel, true);
        assert.equal(actions.increaseNestingLevel, false);
        return done();
      });
    });
  });

  test("element triggers custom focus and blur events", function(done) {
    const element = getEditorElement();

    let focusEventCount = 0;
    let blurEventCount = 0;
    element.addEventListener("trix-focus", () => focusEventCount++);
    element.addEventListener("trix-blur", () => blurEventCount++);

    triggerEvent(element, "blur");
    return defer(function() {
      assert.equal(blurEventCount, 1);
      assert.equal(focusEventCount, 0);

      triggerEvent(element, "focus");
      return defer(function() {
        assert.equal(blurEventCount, 1);
        assert.equal(focusEventCount, 1);

        insertImageAttachment();
        return after(20, () => clickElement(element.querySelector("figure"), function() {
          const textarea = element.querySelector("textarea");
          textarea.focus();
          return defer(function() {
            assert.equal(document.activeElement, textarea);
            assert.equal(blurEventCount, 1);
            assert.equal(focusEventCount, 1);
            return done();
          });
        }));
      });
    });
  });

  // Selenium doesn't seem to focus windows properly in some browsers (FF 47 on OS X)
  // so skip this test when unfocused pending a better solution.
  testIf(document.hasFocus(), "element triggers custom focus event when autofocusing", function(done) {
    const element = document.createElement("trix-editor");
    element.setAttribute("autofocus", "");

    let focusEventCount = 0;
    element.addEventListener("trix-focus", () => focusEventCount++);

    const container = document.getElementById("trix-container");
    container.innerHTML = "";
    container.appendChild(element);

    return element.addEventListener("trix-initialize", function() {
      assert.equal(focusEventCount, 1);
      return done();
    });
  });

  test("element serializes HTML after attribute changes", function(done) {
    const element = getEditorElement();
    let serializedHTML = element.value;

    return typeCharacters("a", function() {
      assert.notEqual(serializedHTML, element.value);
      serializedHTML = element.value;

      return clickToolbarButton({attribute: "quote"}, function() {
        assert.notEqual(serializedHTML, element.value);
        serializedHTML = element.value;

        return clickToolbarButton({attribute: "quote"}, function() {
          assert.notEqual(serializedHTML, element.value);
          return done();
        });
      });
    });
  });

  test("element serializes HTML after attachment attribute changes", function(done) {
    const element = getEditorElement();
    const attributes = {url: "test_helpers/fixtures/logo.png", contentType: "image/png"};

    element.addEventListener("trix-attachment-add", function(event) {
      const {attachment} = event;
      return requestAnimationFrame(function() {
        let serializedHTML = element.value;
        attachment.setAttributes(attributes);
        assert.notEqual(serializedHTML, element.value);

        serializedHTML = element.value;
        assert.ok(serializedHTML.indexOf(TEST_IMAGE_URL) < 0, "serialized HTML contains previous attachment attributes");
        assert.ok(serializedHTML.indexOf(attributes.url) > 0, "serialized HTML doesn't contain current attachment attributes");

        attachment.remove();
        return requestAnimationFrame(() => done());
      });
    });

    return requestAnimationFrame(() => insertImageAttachment());
  });

  test("editor resets to its original value on form reset", function(expectDocument) {
    const element = getEditorElement();
    const {
      form
    } = element.inputElement;

    return typeCharacters("hello", function() {
      form.reset();
      return expectDocument("\n");
    });
  });

  test("editor resets to last-set value on form reset", function(expectDocument) {
    const element = getEditorElement();
    const {
      form
    } = element.inputElement;

    element.value = "hi";
    return typeCharacters("hello", function() {
      form.reset();
      return expectDocument("hi\n");
    });
  });

  return test("editor respects preventDefault on form reset", function(expectDocument) {
    const element = getEditorElement();
    const {
      form
    } = element.inputElement;
    const preventDefault = event => event.preventDefault();

    return typeCharacters("hello", function() {
      form.addEventListener("reset", preventDefault, false);
      form.reset();
      form.removeEventListener("reset", preventDefault, false);
      return expectDocument("hello\n");
    });
  });
});

testGroup("<label> support", {template: "editor_with_labels"}, function() {
  test("associates all label elements", function(done) {
    const labels = [document.getElementById("label-1"), document.getElementById("label-3")];
    assert.deepEqual(getEditorElement().labels, labels);
    return done();
  });

  test("focuses when <label> clicked", function(done) {
    document.getElementById("label-1").click();
    assert.equal(getEditorElement(), document.activeElement);
    return done();
  });

  test("focuses when <label> descendant clicked", function(done) {
    document.getElementById("label-1").querySelector("span").click();
    assert.equal(getEditorElement(), document.activeElement);
    return done();
  });

  return test("does not focus when <label> controls another element", function(done) {
    const label = document.getElementById("label-2");
    assert.notEqual(getEditorElement(), label.control);
    label.click();
    assert.notEqual(getEditorElement(), document.activeElement);
    return done();
  });
});

testGroup("form property references its <form>", {template: "editors_with_forms", container: "div"}, function() {
  test("accesses its ancestor form", function(done) {
    const form = document.getElementById("ancestor-form");
    const editor = document.getElementById("editor-with-ancestor-form");
    assert.equal(editor.form, form);
    return done();
  });

  test("transitively accesses its related <input> element's <form>", function(done) {
    const form = document.getElementById("input-form");
    const editor = document.getElementById("editor-with-input-form");
    assert.equal(editor.form, form);
    return done();
  });

  return test("returns null when there is no associated <form>", function(done) {
    const editor = document.getElementById("editor-with-no-form");
    assert.equal(editor.form, null);
    return done();
  });
});
