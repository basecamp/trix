/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import BasicObject from "trix/core/basic_object";
import AttachmentView from "trix/views/attachment_view";
import DocumentView from "trix/views/document_view";
import AttachmentEditorController from "trix/controllers/attachment_editor_controller";

import { findClosestElementFromNode, handleEvent, innerElementIsActive, defer } from "trix/core/helpers";
import { attachmentSelector } from "trix/config/attachments";

export default class CompositionController extends BasicObject {
  constructor(element, composition) {
    this.didFocus = this.didFocus.bind(this);
    this.didBlur = this.didBlur.bind(this);
    this.didClickAttachment = this.didClickAttachment.bind(this);
    super(...arguments);
    this.element = element;
    this.composition = composition;
    this.documentView = new DocumentView(this.composition.document, {element: this.element});

    handleEvent("focus", {onElement: this.element, withCallback: this.didFocus});
    handleEvent("blur", {onElement: this.element, withCallback: this.didBlur});
    handleEvent("click", {onElement: this.element, matchingSelector: "a[contenteditable=false]", preventDefault: true});
    handleEvent("mousedown", {onElement: this.element, matchingSelector: attachmentSelector, withCallback: this.didClickAttachment});
    handleEvent("click", {onElement: this.element, matchingSelector: `a${attachmentSelector}`, preventDefault: true});
  }

  didFocus(event) {
    let left;
    const perform = () => {
      if (!this.focused) {
        this.focused = true;
        return this.delegate?.compositionControllerDidFocus?.();
      }
    };

    return (left = this.blurPromise?.then(perform)) != null ? left : perform();
  }

  didBlur(event) {
    return this.blurPromise = new Promise(resolve => {
      return defer(() => {
        if (!innerElementIsActive(this.element)) {
          this.focused = null;
          this.delegate?.compositionControllerDidBlur?.();
        }
        this.blurPromise = null;
        return resolve();
      });
    });
  }

  didClickAttachment(event, target) {
    const attachment = this.findAttachmentForElement(target);
    const editCaption = (findClosestElementFromNode(event.target, {matchingSelector: "figcaption"}) != null);
    return this.delegate?.compositionControllerDidSelectAttachment?.(attachment, {editCaption});
  }

  getSerializableElement() {
    if (this.isEditingAttachment()) {
      return this.documentView.shadowElement;
    } else {
      return this.element;
    }
  }

  render() {
    if (this.revision !== this.composition.revision) {
      this.documentView.setDocument(this.composition.document);
      this.documentView.render();
      this.revision = this.composition.revision;
    }

    if (this.canSyncDocumentView() && !this.documentView.isSynced()) {
      this.delegate?.compositionControllerWillSyncDocumentView?.();
      this.documentView.sync();
      this.delegate?.compositionControllerDidSyncDocumentView?.();
    }

    return this.delegate?.compositionControllerDidRender?.();
  }

  rerenderViewForObject(object) {
    this.invalidateViewForObject(object);
    return this.render();
  }

  invalidateViewForObject(object) {
    return this.documentView.invalidateViewForObject(object);
  }

  isViewCachingEnabled() {
    return this.documentView.isViewCachingEnabled();
  }

  enableViewCaching() {
    return this.documentView.enableViewCaching();
  }

  disableViewCaching() {
    return this.documentView.disableViewCaching();
  }

  refreshViewCache() {
    return this.documentView.garbageCollectCachedViews();
  }

  // Attachment editor management

  isEditingAttachment() {
    return (this.attachmentEditor != null);
  }

  installAttachmentEditorForAttachment(attachment, options) {
    let element;
    if (this.attachmentEditor?.attachment === attachment) { return; }
    if (!(element = this.documentView.findElementForObject(attachment))) { return; }
    this.uninstallAttachmentEditor();
    const attachmentPiece = this.composition.document.getAttachmentPieceForAttachment(attachment);
    this.attachmentEditor = new AttachmentEditorController(attachmentPiece, element, this.element, options);
    return this.attachmentEditor.delegate = this;
  }

  uninstallAttachmentEditor() {
    return this.attachmentEditor?.uninstall();
  }

  // Attachment controller delegate

  didUninstallAttachmentEditor() {
    this.attachmentEditor = null;
    return this.render();
  }

  attachmentEditorDidRequestUpdatingAttributesForAttachment(attributes, attachment) {
    this.delegate?.compositionControllerWillUpdateAttachment?.(attachment);
    return this.composition.updateAttributesForAttachment(attributes, attachment);
  }

  attachmentEditorDidRequestRemovingAttributeForAttachment(attribute, attachment) {
    this.delegate?.compositionControllerWillUpdateAttachment?.(attachment);
    return this.composition.removeAttributeForAttachment(attribute, attachment);
  }

  attachmentEditorDidRequestRemovalOfAttachment(attachment) {
    return this.delegate?.compositionControllerDidRequestRemovalOfAttachment?.(attachment);
  }

  attachmentEditorDidRequestDeselectingAttachment(attachment) {
    return this.delegate?.compositionControllerDidRequestDeselectingAttachment?.(attachment);
  }

  // Private

  canSyncDocumentView() {
    return !this.isEditingAttachment();
  }

  findAttachmentForElement(element) {
    return this.composition.document.getAttachmentById(parseInt(element.dataset.trixId, 10));
  }
}
