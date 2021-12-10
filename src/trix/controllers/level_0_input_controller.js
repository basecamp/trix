/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Level0InputController;
import config from "trix/config";
import UTF16String from "trix/core/utilities/utf16_string";
import BasicObject from "trix/core/basic_object";
import InputController from "trix/controllers/input_controller";
import DocumentView from "trix/views/document_view";
import Document from "trix/models/document";

import { dataTransferIsPlainText, dataTransferIsWritable, keyEventIsKeyboardCommand, makeElement,
  objectsAreEqual, removeNode, squishBreakableWhitespace, tagName } from "trix/core/helpers";

import { selectionChangeObserver } from "trix/observers/selection_change_observer";

const { browser, keyNames } = config;
let pastedFileCount = 0;

export default Level0InputController = (function() {
  Level0InputController = class Level0InputController extends InputController {
    static initClass() {
  
      // Input handlers
  
      this.prototype.events = {
        keydown(event) {
          let keyName;
          let modifier;
          if (!this.isComposing()) { this.resetInputSummary(); }
          this.inputSummary.didInput = true;
  
          if (keyName = keyNames[event.keyCode]) {
            let context = this.keys;
  
            for (modifier of ["ctrl", "alt", "shift", "meta"]) {
              if (event[`${modifier}Key`]) {
                if (modifier === "ctrl") { modifier = "control"; }
                context = context?.[modifier];
              }
            }
  
            if (context?.[keyName] != null) {
              this.setInputSummary({keyName});
              selectionChangeObserver.reset();
              context[keyName].call(this, event);
            }
          }
  
          if (keyEventIsKeyboardCommand(event)) {
            let character;
            if (character = String.fromCharCode(event.keyCode).toLowerCase()) {
              const keys = ((() => {
                const result = [];
                for (modifier of ["alt", "shift"]) {                   if (event[`${modifier}Key`]) {
                    result.push(modifier);
                  }
                }
                return result;
              })());
              keys.push(character);
              if (this.delegate?.inputControllerDidReceiveKeyboardCommand(keys)) {
                return event.preventDefault();
              }
            }
          }
        },
  
        keypress(event) {
          let string;
          if (this.inputSummary.eventName != null) { return; }
          if (event.metaKey) { return; }
          if (event.ctrlKey && !event.altKey) { return; }
  
          if (string = stringFromKeyEvent(event)) {
            this.delegate?.inputControllerWillPerformTyping();
            this.responder?.insertString(string);
            return this.setInputSummary({textAdded: string, didDelete: this.selectionIsExpanded()});
          }
        },
  
        textInput(event) {
          // Handle autocapitalization
          const {data} = event;
          const {textAdded} = this.inputSummary;
          if (textAdded && (textAdded !== data) && (textAdded.toUpperCase() === data)) {
            const range = this.getSelectedRange();
            this.setSelectedRange([range[0], range[1] + textAdded.length]);
            this.responder?.insertString(data);
            this.setInputSummary({textAdded: data});
            return this.setSelectedRange(range);
          }
        },
  
        dragenter(event) {
          return event.preventDefault();
        },
  
        dragstart(event) {
          const {
            target
          } = event;
          this.serializeSelectionToDataTransfer(event.dataTransfer);
          this.draggedRange = this.getSelectedRange();
          return this.delegate?.inputControllerDidStartDrag?.();
        },
  
        dragover(event) {
          if (this.draggedRange || this.canAcceptDataTransfer(event.dataTransfer)) {
            event.preventDefault();
            const draggingPoint = {x: event.clientX, y: event.clientY};
            if (!objectsAreEqual(draggingPoint, this.draggingPoint)) {
              this.draggingPoint = draggingPoint;
              return this.delegate?.inputControllerDidReceiveDragOverPoint?.(this.draggingPoint);
            }
          }
        },
  
        dragend(event) {
          this.delegate?.inputControllerDidCancelDrag?.();
          this.draggedRange = null;
          return this.draggingPoint = null;
        },
  
        drop(event) {
          let documentJSON;
          event.preventDefault();
          const files = event.dataTransfer?.files;
  
          const point = {x: event.clientX, y: event.clientY};
          this.responder?.setLocationRangeFromPointRange(point);
  
          if (files?.length) {
            this.attachFiles(files);
  
          } else if (this.draggedRange) {
            this.delegate?.inputControllerWillMoveText();
            this.responder?.moveTextFromRange(this.draggedRange);
            this.draggedRange = null;
            this.requestRender();
  
          } else if (documentJSON = event.dataTransfer.getData("application/x-trix-document")) {
            const document = Document.fromJSONString(documentJSON);
            this.responder?.insertDocument(document);
            this.requestRender();
          }
  
          this.draggedRange = null;
          return this.draggingPoint = null;
        },
  
        cut(event) {
          if (this.responder?.selectionIsExpanded()) {
            if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
              event.preventDefault();
            }
  
            this.delegate?.inputControllerWillCutText();
            this.deleteInDirection("backward");
            if (event.defaultPrevented) { return this.requestRender(); }
          }
        },
  
        copy(event) {
          if (this.responder?.selectionIsExpanded()) {
            if (this.serializeSelectionToDataTransfer(event.clipboardData)) {
              return event.preventDefault();
            }
          }
        },
  
        paste(event) {
          let href, html, name, string;
          const clipboard = event.clipboardData != null ? event.clipboardData : event.testClipboardData;
          const paste = {clipboard};
  
          if ((clipboard == null) || pasteEventIsCrippledSafariHTMLPaste(event)) {
            this.getPastedHTMLUsingHiddenElement(html => {
              paste.type = "text/html";
              paste.html = html;
              this.delegate?.inputControllerWillPaste(paste);
              this.responder?.insertHTML(paste.html);
              this.requestRender();
              return this.delegate?.inputControllerDidPaste(paste);
            });
            return;
          }
  
          if (href = clipboard.getData("URL")) {
            paste.type = "text/html";
            if ((name = clipboard.getData("public.url-name"))) {
              string = squishBreakableWhitespace(name).trim();
            } else {
              string = href;
            }
            paste.html = this.createLinkHTML(href, string);
            this.delegate?.inputControllerWillPaste(paste);
            this.setInputSummary({textAdded: string, didDelete: this.selectionIsExpanded()});
            this.responder?.insertHTML(paste.html);
            this.requestRender();
            this.delegate?.inputControllerDidPaste(paste);
  
          } else if (dataTransferIsPlainText(clipboard)) {
            paste.type = "text/plain";
            paste.string = clipboard.getData("text/plain");
            this.delegate?.inputControllerWillPaste(paste);
            this.setInputSummary({textAdded: paste.string, didDelete: this.selectionIsExpanded()});
            this.responder?.insertString(paste.string);
            this.requestRender();
            this.delegate?.inputControllerDidPaste(paste);
  
          } else if (html = clipboard.getData("text/html")) {
            paste.type = "text/html";
            paste.html = html;
            this.delegate?.inputControllerWillPaste(paste);
            this.responder?.insertHTML(paste.html);
            this.requestRender();
            this.delegate?.inputControllerDidPaste(paste);
  
          } else if (Array.from(clipboard.types).includes("Files")) {
            let file;
            if (file = clipboard.items?.[0]?.getAsFile?.()) {
              let extension;
              if (!file.name && (extension = extensionForFile(file))) {
                file.name = `pasted-file-${++pastedFileCount}.${extension}`;
              }
              paste.type = "File";
              paste.file = file;
              this.delegate?.inputControllerWillAttachFiles();
              this.responder?.insertFile(paste.file);
              this.requestRender();
              this.delegate?.inputControllerDidPaste(paste);
            }
          }
  
          return event.preventDefault();
        },
  
        compositionstart(event) {
          return this.getCompositionInput().start(event.data);
        },
  
        compositionupdate(event) {
          return this.getCompositionInput().update(event.data);
        },
  
        compositionend(event) {
          return this.getCompositionInput().end(event.data);
        },
  
        beforeinput(event) {
          return this.inputSummary.didInput = true;
        },
  
        input(event) {
          this.inputSummary.didInput = true;
          return event.stopPropagation();
        }
      };
  
      this.prototype.keys = {
        backspace(event) {
          this.delegate?.inputControllerWillPerformTyping();
          return this.deleteInDirection("backward", event);
        },
  
        delete(event) {
          this.delegate?.inputControllerWillPerformTyping();
          return this.deleteInDirection("forward", event);
        },
  
        return(event) {
          this.setInputSummary({preferDocument: true});
          this.delegate?.inputControllerWillPerformTyping();
          return this.responder?.insertLineBreak();
        },
  
        tab(event) {
          if (this.responder?.canIncreaseNestingLevel()) {
            this.responder?.increaseNestingLevel();
            this.requestRender();
            return event.preventDefault();
          }
        },
  
        left(event) {
          if (this.selectionIsInCursorTarget()) {
            event.preventDefault();
            return this.responder?.moveCursorInDirection("backward");
          }
        },
  
        right(event) {
          if (this.selectionIsInCursorTarget()) {
            event.preventDefault();
            return this.responder?.moveCursorInDirection("forward");
          }
        },
  
        control: {
          d(event) {
            this.delegate?.inputControllerWillPerformTyping();
            return this.deleteInDirection("forward", event);
          },
  
          h(event) {
            this.delegate?.inputControllerWillPerformTyping();
            return this.deleteInDirection("backward", event);
          },
  
          o(event) {
            event.preventDefault();
            this.delegate?.inputControllerWillPerformTyping();
            this.responder?.insertString("\n", {updatePosition: false});
            return this.requestRender();
          }
        },
  
        shift: {
          return(event) {
            this.delegate?.inputControllerWillPerformTyping();
            this.responder?.insertString("\n");
            this.requestRender();
            return event.preventDefault();
          },
  
          tab(event) {
            if (this.responder?.canDecreaseNestingLevel()) {
              this.responder?.decreaseNestingLevel();
              this.requestRender();
              return event.preventDefault();
            }
          },
  
          left(event) {
            if (this.selectionIsInCursorTarget()) {
              event.preventDefault();
              return this.expandSelectionInDirection("backward");
            }
          },
  
          right(event) {
            if (this.selectionIsInCursorTarget()) {
              event.preventDefault();
              return this.expandSelectionInDirection("forward");
            }
          }
        },
  
        alt: {
          backspace(event) {
            this.setInputSummary({preferDocument: false});
            return this.delegate?.inputControllerWillPerformTyping();
          }
        },
  
        meta: {
          backspace(event) {
            this.setInputSummary({preferDocument: false});
            return this.delegate?.inputControllerWillPerformTyping();
          }
        }
      };
  
      this.proxyMethod("responder?.getSelectedRange");
      this.proxyMethod("responder?.setSelectedRange");
      this.proxyMethod("responder?.expandSelectionInDirection");
      this.proxyMethod("responder?.selectionIsInCursorTarget");
      this.proxyMethod("responder?.selectionIsExpanded");
    }
    constructor() {
      super(...arguments);
      this.resetInputSummary();
    }

    setInputSummary(summary = {}) {
      this.inputSummary.eventName = this.eventName;
      for (let key in summary) { const value = summary[key]; this.inputSummary[key] = value; }
      return this.inputSummary;
    }

    resetInputSummary() {
      return this.inputSummary = {};
    }

    reset() {
      this.resetInputSummary();
      return selectionChangeObserver.reset();
    }

    // Mutation observer delegate

    elementDidMutate(mutationSummary) {
      if (this.isComposing()) {
        return this.delegate?.inputControllerDidAllowUnhandledInput?.();
      } else {
        return this.handleInput(function() {
          if (this.mutationIsSignificant(mutationSummary)) {
            if (this.mutationIsExpected(mutationSummary)) {
              this.requestRender();
            } else {
              this.requestReparse();
            }
          }
          return this.reset();
        });
      }
    }

    mutationIsExpected({textAdded, textDeleted}) {
      if (this.inputSummary.preferDocument) { return true; }

      const mutationAdditionMatchesSummary =
        (textAdded != null) ?
          textAdded === this.inputSummary.textAdded
        :
          !this.inputSummary.textAdded;
      const mutationDeletionMatchesSummary =
        (textDeleted != null) ?
          this.inputSummary.didDelete
        :
          !this.inputSummary.didDelete;

      const unexpectedNewlineAddition =
        ["\n", " \n"].includes(textAdded) && !mutationAdditionMatchesSummary;
      const unexpectedNewlineDeletion =
        (textDeleted === "\n") && !mutationDeletionMatchesSummary;
      const singleUnexpectedNewline =
        (unexpectedNewlineAddition && !unexpectedNewlineDeletion) ||
        (unexpectedNewlineDeletion && !unexpectedNewlineAddition);

      if (singleUnexpectedNewline) {
        let range;
        if (range = this.getSelectedRange()) {
          const offset =
            unexpectedNewlineAddition ?
              textAdded.replace(/\n$/, "").length || -1
            :
              textAdded?.length || 1;
          if (this.responder?.positionIsBlockBreak(range[1] + offset)) {
            return true;
          }
        }
      }

      return mutationAdditionMatchesSummary && mutationDeletionMatchesSummary;
    }

    mutationIsSignificant(mutationSummary) {
      const textChanged = Object.keys(mutationSummary).length > 0;
      const composedEmptyString = this.compositionInput?.getEndData() === "";
      return textChanged || !composedEmptyString;
    }

    // Private

    getCompositionInput() {
      if (this.isComposing()) {
        return this.compositionInput;
      } else {
        return this.compositionInput = new CompositionInput(this);
      }
    }

    isComposing() {
      return (this.compositionInput != null) && !this.compositionInput.isEnded();
    }

    deleteInDirection(direction, event) {
      if (this.responder?.deleteInDirection(direction) === false) {
        if (event) {
          event.preventDefault();
          return this.requestRender();
        }
      } else {
        return this.setInputSummary({didDelete: true});
      }
    }

    serializeSelectionToDataTransfer(dataTransfer) {
      if (!dataTransferIsWritable(dataTransfer)) { return; }
      const document = this.responder?.getSelectedDocument().toSerializableDocument();

      dataTransfer.setData("application/x-trix-document", JSON.stringify(document));
      dataTransfer.setData("text/html", DocumentView.render(document).innerHTML);
      dataTransfer.setData("text/plain", document.toString().replace(/\n$/, ""));
      return true;
    }

    canAcceptDataTransfer(dataTransfer) {
      const types = {};
      for (let type of Array.from(dataTransfer?.types != null ? dataTransfer?.types : [])) { types[type] = true; }
      return types["Files"] || types["application/x-trix-document"] || types["text/html"] || types["text/plain"];
    }

    getPastedHTMLUsingHiddenElement(callback) {
      const selectedRange = this.getSelectedRange();

      const style = {
        position: "absolute",
        left: `${window.pageXOffset}px`,
        top: `${window.pageYOffset}px`,
        opacity: 0
      };

      const element = makeElement({style, tagName: "div", editable: true});
      document.body.appendChild(element);
      element.focus();

      return requestAnimationFrame(() => {
        const html = element.innerHTML;
        removeNode(element);
        this.setSelectedRange(selectedRange);
        return callback(html);
      });
    }
  };
  Level0InputController.initClass();
  return Level0InputController;
})();

var extensionForFile = file => file.type?.match(/\/(\w+)$/)?.[1];

const hasStringCodePointAt = (" ".codePointAt?.(0) != null);

var stringFromKeyEvent = function(event) {
  if (event.key && hasStringCodePointAt && (event.key.codePointAt(0) === event.keyCode)) {
    return event.key;
  } else {
    let code;
    if (event.which === null) {
      code = event.keyCode;
    } else if ((event.which !== 0) && (event.charCode !== 0)) {
      code = event.charCode;
    }

    if ((code != null) && (keyNames[code] !== "escape")) {
      return UTF16String.fromCodepoints([code]).toString();
    }
  }
};

var pasteEventIsCrippledSafariHTMLPaste = function(event) {
  let paste;
  if (paste = event.clipboardData) {
    if (Array.from(paste.types).includes("text/html")) {
      // Answer is yes if there's any possibility of Paste and Match Style in Safari,
      // which is nearly impossible to detect confidently: https://bugs.webkit.org/show_bug.cgi?id=174165
      for (let type of Array.from(paste.types)) {
        const hasPasteboardFlavor = /^CorePasteboardFlavorType/.test(type);
        const hasReadableDynamicData = /^dyn\./.test(type) && paste.getData(type);
        const mightBePasteAndMatchStyle = hasPasteboardFlavor || hasReadableDynamicData;
        if (mightBePasteAndMatchStyle) { return true; }
      }
      return false;
    } else {
      const isExternalHTMLPaste = Array.from(paste.types).includes("com.apple.webarchive");
      const isExternalRichTextPaste = Array.from(paste.types).includes("com.apple.flat-rtfd");
      return isExternalHTMLPaste || isExternalRichTextPaste;
    }
  }
};

class CompositionInput extends BasicObject {
  static initClass() {
  
    this.proxyMethod("inputController.setInputSummary");
    this.proxyMethod("inputController.requestRender");
    this.proxyMethod("inputController.requestReparse");
    this.proxyMethod("responder?.selectionIsExpanded");
    this.proxyMethod("responder?.insertPlaceholder");
    this.proxyMethod("responder?.selectPlaceholder");
    this.proxyMethod("responder?.forgetPlaceholder");
  }
  constructor(inputController) {
    super(...arguments);
    this.inputController = inputController;
    ({responder: this.responder, delegate: this.delegate, inputSummary: this.inputSummary} = this.inputController);
    this.data = {};
  }

  start(data) {
    this.data.start = data;

    if (this.isSignificant()) {
      if ((this.inputSummary.eventName === "keypress") && this.inputSummary.textAdded) {
        this.responder?.deleteInDirection("left");
      }

      if (!this.selectionIsExpanded()) {
        this.insertPlaceholder();
        this.requestRender();
      }

      return this.range = this.responder?.getSelectedRange();
    }
  }

  update(data) {
    this.data.update = data;

    if (this.isSignificant()) {
      let range;
      if (range = this.selectPlaceholder()) {
        this.forgetPlaceholder();
        return this.range = range;
      }
    }
  }

  end(data) {
    this.data.end = data;

    if (this.isSignificant()) {
      this.forgetPlaceholder();

      if (this.canApplyToDocument()) {
        this.setInputSummary({preferDocument: true, didInput: false});
        this.delegate?.inputControllerWillPerformTyping();
        this.responder?.setSelectedRange(this.range);
        this.responder?.insertString(this.data.end);
        return this.responder?.setSelectedRange(this.range[0] + this.data.end.length);

      } else if ((this.data.start != null) || (this.data.update != null)) {
        this.requestReparse();
        return this.inputController.reset();
      }
    } else {
      return this.inputController.reset();
    }
  }

  getEndData() {
    return this.data.end;
  }

  isEnded() {
    return (this.getEndData() != null);
  }

  isSignificant() {
    if (browser.composesExistingText) {
      return this.inputSummary.didInput;
    } else {
      return true;
    }
  }

  // Private

  canApplyToDocument() {
    return (this.data.start?.length === 0) && (this.data.end?.length > 0) && (this.range != null);
  }
}
CompositionInput.initClass();
