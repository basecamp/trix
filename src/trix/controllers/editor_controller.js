/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let EditorController;
import config from "trix/config";

import { serializeToContentType } from "trix/core/serialization";

import Controller from "trix/controllers/controller";
import Level0InputController from "trix/controllers/level_0_input_controller";
import Level2InputController from "trix/controllers/level_2_input_controller";
import CompositionController from "trix/controllers/composition_controller";
import ToolbarController from "trix/controllers/toolbar_controller";
import Composition from "trix/models/composition";
import Editor from "trix/models/editor";
import AttachmentManager from "trix/models/attachment_manager";
import SelectionManager from "trix/models/selection_manager";

import { rangeIsCollapsed, rangesAreEqual, objectsAreEqual, getBlockConfig } from "trix/core/helpers";
import { selectionChangeObserver } from "trix/observers/selection_change_observer";

export default EditorController = (function() {
  let snapshotsAreEqual = undefined;
  EditorController = class EditorController extends Controller {
    static initClass() {
  
      this.proxyMethod("getSelectionManager().setLocationRange");
      this.proxyMethod("getSelectionManager().getLocationRange");
  
      // Actions
  
      this.prototype.actions = {
        undo: {
          test() { return this.editor.canUndo(); },
          perform() { return this.editor.undo(); }
        },
        redo: {
          test() { return this.editor.canRedo(); },
          perform() { return this.editor.redo(); }
        },
        link: {
          test() { return this.editor.canActivateAttribute("href"); }
        },
        increaseNestingLevel: {
          test() { return this.editor.canIncreaseNestingLevel(); },
          perform() { return this.editor.increaseNestingLevel() && this.render(); }
        },
        decreaseNestingLevel: {
          test() { return this.editor.canDecreaseNestingLevel(); },
          perform() { return this.editor.decreaseNestingLevel() && this.render(); }
        },
        attachFiles: {
          test() { return true; },
          perform() { return config.input.pickFiles(this.editor.insertFiles); }
        }
      };
  
      snapshotsAreEqual = (a, b) => rangesAreEqual(a.selectedRange, b.selectedRange) &&
        a.document.isEqualTo(b.document);
    }
    constructor({editorElement, document, html}) {
      super(...arguments);
      this.editorElement = editorElement;
      this.selectionManager = new SelectionManager(this.editorElement);
      this.selectionManager.delegate = this;

      this.composition = new Composition;
      this.composition.delegate = this;

      this.attachmentManager = new AttachmentManager(this.composition.getAttachments());
      this.attachmentManager.delegate = this;

      this.inputController = config.input.getLevel() === 2 ?
        new Level2InputController(this.editorElement)
      :
        new Level0InputController(this.editorElement);

      this.inputController.delegate = this;
      this.inputController.responder = this.composition;

      this.compositionController = new CompositionController(this.editorElement, this.composition);
      this.compositionController.delegate = this;

      this.toolbarController = new ToolbarController(this.editorElement.toolbarElement);
      this.toolbarController.delegate = this;

      this.editor = new Editor(this.composition, this.selectionManager, this.editorElement);
      if (document != null) {
        this.editor.loadDocument(document);
      } else {
        this.editor.loadHTML(html);
      }
    }

    registerSelectionManager() {
      return selectionChangeObserver.registerSelectionManager(this.selectionManager);
    }

    unregisterSelectionManager() {
      return selectionChangeObserver.unregisterSelectionManager(this.selectionManager);
    }

    render() {
      return this.compositionController.render();
    }

    reparse() {
      return this.composition.replaceHTML(this.editorElement.innerHTML);
    }

    // Composition delegate

    compositionDidChangeDocument(document) {
      this.notifyEditorElement("document-change");
      if (!this.handlingInput) { return this.render(); }
    }

    compositionDidChangeCurrentAttributes(currentAttributes) {
      this.currentAttributes = currentAttributes;
      this.toolbarController.updateAttributes(this.currentAttributes);
      this.updateCurrentActions();
      return this.notifyEditorElement("attributes-change", {attributes: this.currentAttributes});
    }

    compositionDidPerformInsertionAtRange(range) {
      if (this.pasting) { return this.pastedRange = range; }
    }

    compositionShouldAcceptFile(file) {
      return this.notifyEditorElement("file-accept", {file});
    }

    compositionDidAddAttachment(attachment) {
      const managedAttachment = this.attachmentManager.manageAttachment(attachment);
      return this.notifyEditorElement("attachment-add", {attachment: managedAttachment});
    }

    compositionDidEditAttachment(attachment) {
      this.compositionController.rerenderViewForObject(attachment);
      const managedAttachment = this.attachmentManager.manageAttachment(attachment);
      this.notifyEditorElement("attachment-edit", {attachment: managedAttachment});
      return this.notifyEditorElement("change");
    }

    compositionDidChangeAttachmentPreviewURL(attachment) {
      this.compositionController.invalidateViewForObject(attachment);
      return this.notifyEditorElement("change");
    }

    compositionDidRemoveAttachment(attachment) {
      const managedAttachment = this.attachmentManager.unmanageAttachment(attachment);
      return this.notifyEditorElement("attachment-remove", {attachment: managedAttachment});
    }

    compositionDidStartEditingAttachment(attachment, options) {
      this.attachmentLocationRange = this.composition.document.getLocationRangeOfAttachment(attachment);
      this.compositionController.installAttachmentEditorForAttachment(attachment, options);
      return this.selectionManager.setLocationRange(this.attachmentLocationRange);
    }

    compositionDidStopEditingAttachment(attachment) {
      this.compositionController.uninstallAttachmentEditor();
      return this.attachmentLocationRange = null;
    }

    compositionDidRequestChangingSelectionToLocationRange(locationRange) {
      if (this.loadingSnapshot && !this.isFocused()) { return; }
      this.requestedLocationRange = locationRange;
      this.compositionRevisionWhenLocationRangeRequested = this.composition.revision;
      if (!this.handlingInput) { return this.render(); }
    }

    compositionWillLoadSnapshot() {
      return this.loadingSnapshot = true;
    }

    compositionDidLoadSnapshot() {
      this.compositionController.refreshViewCache();
      this.render();
      return this.loadingSnapshot = false;
    }

    getSelectionManager() {
      return this.selectionManager;
    }

    // Attachment manager delegate

    attachmentManagerDidRequestRemovalOfAttachment(attachment) {
      return this.removeAttachment(attachment);
    }

    // Document controller delegate

    compositionControllerWillSyncDocumentView() {
      this.inputController.editorWillSyncDocumentView();
      this.selectionManager.lock();
      return this.selectionManager.clearSelection();
    }

    compositionControllerDidSyncDocumentView() {
      this.inputController.editorDidSyncDocumentView();
      this.selectionManager.unlock();
      this.updateCurrentActions();
      return this.notifyEditorElement("sync");
    }

    compositionControllerDidRender() {
      if (this.requestedLocationRange != null) {
        if (this.compositionRevisionWhenLocationRangeRequested === this.composition.revision) {
          this.selectionManager.setLocationRange(this.requestedLocationRange);
        }
        this.requestedLocationRange = null;
        this.compositionRevisionWhenLocationRangeRequested = null;
      }

      if (this.renderedCompositionRevision !== this.composition.revision) {
        this.runEditorFilters();
        this.composition.updateCurrentAttributes();
        this.notifyEditorElement("render");
      }

      return this.renderedCompositionRevision = this.composition.revision;
    }

    compositionControllerDidFocus() {
      if (this.isFocusedInvisibly()) { this.setLocationRange({index: 0, offset: 0}); }
      this.toolbarController.hideDialog();
      return this.notifyEditorElement("focus");
    }

    compositionControllerDidBlur() {
      return this.notifyEditorElement("blur");
    }

    compositionControllerDidSelectAttachment(attachment, options) {
      this.toolbarController.hideDialog();
      return this.composition.editAttachment(attachment, options);
    }

    compositionControllerDidRequestDeselectingAttachment(attachment) {
      const locationRange = this.attachmentLocationRange != null ? this.attachmentLocationRange : this.composition.document.getLocationRangeOfAttachment(attachment);
      return this.selectionManager.setLocationRange(locationRange[1]);
    }

    compositionControllerWillUpdateAttachment(attachment) {
      return this.editor.recordUndoEntry("Edit Attachment", {context: attachment.id, consolidatable: true});
    }

    compositionControllerDidRequestRemovalOfAttachment(attachment) {
      return this.removeAttachment(attachment);
    }

    // Input controller delegate

    inputControllerWillHandleInput() {
      this.handlingInput = true;
      return this.requestedRender = false;
    }

    inputControllerDidRequestRender() {
      return this.requestedRender = true;
    }

    inputControllerDidHandleInput() {
      this.handlingInput = false;
      if (this.requestedRender) {
        this.requestedRender = false;
        return this.render();
      }
    }

    inputControllerDidAllowUnhandledInput() {
      return this.notifyEditorElement("change");
    }

    inputControllerDidRequestReparse() {
      return this.reparse();
    }

    inputControllerWillPerformTyping() {
      return this.recordTypingUndoEntry();
    }

    inputControllerWillPerformFormatting(attributeName) {
      return this.recordFormattingUndoEntry(attributeName);
    }

    inputControllerWillCutText() {
      return this.editor.recordUndoEntry("Cut");
    }

    inputControllerWillPaste(paste) {
      this.editor.recordUndoEntry("Paste");
      this.pasting = true;
      return this.notifyEditorElement("before-paste", {paste});
    }

    inputControllerDidPaste(paste) {
      paste.range = this.pastedRange;
      this.pastedRange = null;
      this.pasting = null;
      return this.notifyEditorElement("paste", {paste});
    }

    inputControllerWillMoveText() {
      return this.editor.recordUndoEntry("Move");
    }

    inputControllerWillAttachFiles() {
      return this.editor.recordUndoEntry("Drop Files");
    }

    inputControllerWillPerformUndo() {
      return this.editor.undo();
    }

    inputControllerWillPerformRedo() {
      return this.editor.redo();
    }

    inputControllerDidReceiveKeyboardCommand(keys) {
      return this.toolbarController.applyKeyboardCommand(keys);
    }

    inputControllerDidStartDrag() {
      return this.locationRangeBeforeDrag = this.selectionManager.getLocationRange();
    }

    inputControllerDidReceiveDragOverPoint(point) {
      return this.selectionManager.setLocationRangeFromPointRange(point);
    }

    inputControllerDidCancelDrag() {
      this.selectionManager.setLocationRange(this.locationRangeBeforeDrag);
      return this.locationRangeBeforeDrag = null;
    }

    // Selection manager delegate

    locationRangeDidChange(locationRange) {
      this.composition.updateCurrentAttributes();
      this.updateCurrentActions();
      if (this.attachmentLocationRange && !rangesAreEqual(this.attachmentLocationRange, locationRange)) {
        this.composition.stopEditingAttachment();
      }
      return this.notifyEditorElement("selection-change");
    }

    // Toolbar controller delegate

    toolbarDidClickButton() {
      if (!this.getLocationRange()) { return this.setLocationRange({index: 0, offset: 0}); }
    }

    toolbarDidInvokeAction(actionName) {
      return this.invokeAction(actionName);
    }

    toolbarDidToggleAttribute(attributeName) {
      this.recordFormattingUndoEntry(attributeName);
      this.composition.toggleCurrentAttribute(attributeName);
      this.render();
      if (!this.selectionFrozen) { return this.editorElement.focus(); }
    }

    toolbarDidUpdateAttribute(attributeName, value) {
      this.recordFormattingUndoEntry(attributeName);
      this.composition.setCurrentAttribute(attributeName, value);
      this.render();
      if (!this.selectionFrozen) { return this.editorElement.focus(); }
    }

    toolbarDidRemoveAttribute(attributeName) {
      this.recordFormattingUndoEntry(attributeName);
      this.composition.removeCurrentAttribute(attributeName);
      this.render();
      if (!this.selectionFrozen) { return this.editorElement.focus(); }
    }

    toolbarWillShowDialog(dialogElement) {
      this.composition.expandSelectionForEditing();
      return this.freezeSelection();
    }

    toolbarDidShowDialog(dialogName) {
      return this.notifyEditorElement("toolbar-dialog-show", {dialogName});
    }

    toolbarDidHideDialog(dialogName) {
      this.thawSelection();
      this.editorElement.focus();
      return this.notifyEditorElement("toolbar-dialog-hide", {dialogName});
    }

    // Selection

    freezeSelection() {
      if (!this.selectionFrozen) {
        this.selectionManager.lock();
        this.composition.freezeSelection();
        this.selectionFrozen = true;
        return this.render();
      }
    }

    thawSelection() {
      if (this.selectionFrozen) {
        this.composition.thawSelection();
        this.selectionManager.unlock();
        this.selectionFrozen = false;
        return this.render();
      }
    }

    canInvokeAction(actionName) {
      if (this.actionIsExternal(actionName)) {
        return true;
      } else {
        return !!this.actions[actionName]?.test?.call(this);
      }
    }

    invokeAction(actionName) {
      if (this.actionIsExternal(actionName)) {
        return this.notifyEditorElement("action-invoke", {actionName});
      } else {
        return this.actions[actionName]?.perform?.call(this);
      }
    }

    actionIsExternal(actionName) {
      return /^x-./.test(actionName);
    }

    getCurrentActions() {
      const result = {};
      for (let actionName in this.actions) {
        result[actionName] = this.canInvokeAction(actionName);
      }
      return result;
    }

    updateCurrentActions() {
      const currentActions = this.getCurrentActions();
      if (!objectsAreEqual(currentActions, this.currentActions)) {
        this.currentActions = currentActions;
        this.toolbarController.updateActions(this.currentActions);
        return this.notifyEditorElement("actions-change", {actions: this.currentActions});
      }
    }

    // Editor filters

    runEditorFilters() {
      let snapshot = this.composition.getSnapshot();

      for (let filter of Array.from(this.editor.filters)) {
        var left;
        const {document, selectedRange} = snapshot;
        snapshot = (left = filter.call(this.editor, snapshot)) != null ? left : {};
        if (snapshot.document == null) { snapshot.document = document; }
        if (snapshot.selectedRange == null) { snapshot.selectedRange = selectedRange; }
      }

      if (!snapshotsAreEqual(snapshot, this.composition.getSnapshot())) {
        return this.composition.loadSnapshot(snapshot);
      }
    }

    // Private

    updateInputElement() {
      const element = this.compositionController.getSerializableElement();
      const value = serializeToContentType(element, "text/html");
      return this.editorElement.setInputElementValue(value);
    }

    notifyEditorElement(message, data) {
      switch (message) {
        case "document-change":
          this.documentChangedSinceLastRender = true;
          break;
        case "render":
          if (this.documentChangedSinceLastRender) {
            this.documentChangedSinceLastRender = false;
            this.notifyEditorElement("change");
          }
          break;
        case "change": case "attachment-add": case "attachment-edit": case "attachment-remove":
          this.updateInputElement();
          break;
      }

      return this.editorElement.notify(message, data);
    }

    removeAttachment(attachment) {
      this.editor.recordUndoEntry("Delete Attachment");
      this.composition.removeAttachment(attachment);
      return this.render();
    }

    recordFormattingUndoEntry(attributeName) {
      const blockConfig = getBlockConfig(attributeName);
      const locationRange = this.selectionManager.getLocationRange();
      if (blockConfig || !rangeIsCollapsed(locationRange)) {
        return this.editor.recordUndoEntry("Formatting", {context: this.getUndoContext(), consolidatable: true});
      }
    }

    recordTypingUndoEntry() {
      return this.editor.recordUndoEntry("Typing", {context: this.getUndoContext(this.currentAttributes), consolidatable: true});
    }

    getUndoContext(...context) {
      return [this.getLocationContext(), this.getTimeContext(), ...Array.from(context)];
    }

    getLocationContext() {
      const locationRange = this.selectionManager.getLocationRange();
      if (rangeIsCollapsed(locationRange)) {
        return locationRange[0].index;
      } else {
        return locationRange;
      }
    }

    getTimeContext() {
      if (config.undoInterval > 0) {
        return Math.floor(new Date().getTime() / config.undoInterval);
      } else {
        return 0;
      }
    }

    isFocused() {
      return this.editorElement === this.editorElement.ownerDocument?.activeElement;
    }

    // Detect "Cursor disappears sporadically" Firefox bug.
    // - https://bugzilla.mozilla.org/show_bug.cgi?id=226301
    isFocusedInvisibly() {
      return this.isFocused() && !this.getLocationRange();
    }
  };
  EditorController.initClass();
  return EditorController;
})();
