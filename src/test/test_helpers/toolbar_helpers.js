/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { defer } from "trix/core/helpers";
import { createEvent, triggerEvent } from "./event_helpers";
import { selectionChangeObserver } from "trix/observers/selection_change_observer";

export var clickToolbarButton = function(selector, callback) {
  selectionChangeObserver.update();
  const button = getToolbarButton(selector);
  triggerEvent(button, "mousedown");
  return defer(callback);
};

export var typeToolbarKeyCommand = function(selector, callback) {
  let trixKey;
  const button = getToolbarButton(selector);
  if ({trixKey} = button.dataset) {
    const keyCode = trixKey.toUpperCase().charCodeAt(0);
    triggerEvent(getEditorElement(), "keydown", {keyCode, charCode: 0, metaKey: true, ctrlKey: true});
  }
  return defer(callback);
};

export var clickToolbarDialogButton = function({method}, callback) {
  const button = getToolbarElement().querySelector(`[data-trix-dialog] [data-trix-method='${method}']`);
  triggerEvent(button, "click");
  return defer(callback);
};

export var isToolbarButtonActive = function(selector) {
  const button = getToolbarButton(selector);
  return button.hasAttribute("data-trix-active") && button.classList.contains("trix-active");
};

export var isToolbarButtonDisabled = selector => getToolbarButton(selector).disabled;

export var typeInToolbarDialog = function(string, {attribute}, callback) {
  const dialog = getToolbarDialog({attribute});
  const input = dialog.querySelector(`[data-trix-input][name='${attribute}']`);
  const button = dialog.querySelector("[data-trix-method='setAttribute']");
  input.value = string;
  triggerEvent(button, "click");
  return defer(callback);
};

export var isToolbarDialogActive = function(selector) {
  const dialog = getToolbarDialog(selector);
  return dialog.hasAttribute("data-trix-active") && dialog.classList.contains("trix-active");
};

var getToolbarButton = ({attribute, action}) => getToolbarElement().querySelector(`[data-trix-attribute='${attribute}'], [data-trix-action='${action}']`);

var getToolbarDialog = ({attribute, action}) => getToolbarElement().querySelector(`[data-trix-dialog='${attribute}']`);
