/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ToolbarController;
import BasicObject from "trix/core/basic_object";

import { handleEvent, triggerEvent, findClosestElementFromNode } from "trix/core/helpers";

export default ToolbarController = (function() {
  let attributeButtonSelector = undefined;
  let actionButtonSelector = undefined;
  let toolbarButtonSelector = undefined;
  let dialogSelector = undefined;
  let activeDialogSelector = undefined;
  let dialogButtonSelector = undefined;
  let dialogInputSelector = undefined;
  let getInputForDialog = undefined;
  let getActionName = undefined;
  let getAttributeName = undefined;
  let getDialogName = undefined;
  ToolbarController = class ToolbarController extends BasicObject {
    static initClass() {
      attributeButtonSelector = "[data-trix-attribute]";
      actionButtonSelector = "[data-trix-action]";
      toolbarButtonSelector = `${attributeButtonSelector}, ${actionButtonSelector}`;
  
      dialogSelector = "[data-trix-dialog]";
      activeDialogSelector = `${dialogSelector}[data-trix-active]`;
      dialogButtonSelector = `${dialogSelector} [data-trix-method]`;
      dialogInputSelector = `${dialogSelector} [data-trix-input]`;
  
      getInputForDialog = function(element, attributeName) {
        if (attributeName == null) { attributeName = getAttributeName(element); }
        return element.querySelector(`[data-trix-input][name='${attributeName}']`);
      };
  
      // General helpers
  
      getActionName = element => element.getAttribute("data-trix-action");
  
      getAttributeName = function(element) {
        let left;
        return (left = element.getAttribute("data-trix-attribute")) != null ? left : element.getAttribute("data-trix-dialog-attribute");
      };
  
      getDialogName = element => element.getAttribute("data-trix-dialog");
    }

    constructor(element) {
      this.didClickActionButton = this.didClickActionButton.bind(this);
      this.didClickAttributeButton = this.didClickAttributeButton.bind(this);
      this.didClickDialogButton = this.didClickDialogButton.bind(this);
      this.didKeyDownDialogInput = this.didKeyDownDialogInput.bind(this);
      super(...arguments);
      this.element = element;
      this.attributes = {};
      this.actions = {};
      this.resetDialogInputs();

      handleEvent("mousedown", {onElement: this.element, matchingSelector: actionButtonSelector, withCallback: this.didClickActionButton});
      handleEvent("mousedown", {onElement: this.element, matchingSelector: attributeButtonSelector, withCallback: this.didClickAttributeButton});
      handleEvent("click", {onElement: this.element, matchingSelector: toolbarButtonSelector, preventDefault: true});
      handleEvent("click", {onElement: this.element, matchingSelector: dialogButtonSelector, withCallback: this.didClickDialogButton});
      handleEvent("keydown", {onElement: this.element, matchingSelector: dialogInputSelector, withCallback: this.didKeyDownDialogInput});
    }

    // Event handlers

    didClickActionButton(event, element) {
      this.delegate?.toolbarDidClickButton();
      event.preventDefault();
      const actionName = getActionName(element);

      if (this.getDialog(actionName)) {
        return this.toggleDialog(actionName);
      } else {
        return this.delegate?.toolbarDidInvokeAction(actionName);
      }
    }

    didClickAttributeButton(event, element) {
      this.delegate?.toolbarDidClickButton();
      event.preventDefault();
      const attributeName = getAttributeName(element);

      if (this.getDialog(attributeName)) {
        this.toggleDialog(attributeName);
      } else {
        this.delegate?.toolbarDidToggleAttribute(attributeName);
      }

      return this.refreshAttributeButtons();
    }

    didClickDialogButton(event, element) {
      const dialogElement = findClosestElementFromNode(element, {matchingSelector: dialogSelector});
      const method = element.getAttribute("data-trix-method");
      return this[method].call(this, dialogElement);
    }

    didKeyDownDialogInput(event, element) {
      if (event.keyCode === 13) { // Enter key
        event.preventDefault();
        const attribute = element.getAttribute("name");
        const dialog = this.getDialog(attribute);
        this.setAttribute(dialog);
      }
      if (event.keyCode === 27) { // Escape key
        event.preventDefault();
        return this.hideDialog();
      }
    }

    // Action buttons

    updateActions(actions) {
      this.actions = actions;
      return this.refreshActionButtons();
    }

    refreshActionButtons() {
      return this.eachActionButton((element, actionName) => {
        return element.disabled = this.actions[actionName] === false;
      });
    }

    eachActionButton(callback) {
      return Array.from(this.element.querySelectorAll(actionButtonSelector)).map((element) =>
        callback(element, getActionName(element)));
    }

    // Attribute buttons

    updateAttributes(attributes) {
      this.attributes = attributes;
      return this.refreshAttributeButtons();
    }

    refreshAttributeButtons() {
      return this.eachAttributeButton((element, attributeName) => {
        element.disabled = this.attributes[attributeName] === false;
        if (this.attributes[attributeName] || this.dialogIsVisible(attributeName)) {
          element.setAttribute("data-trix-active", "");
          return element.classList.add("trix-active");
        } else {
          element.removeAttribute("data-trix-active");
          return element.classList.remove("trix-active");
        }
      });
    }

    eachAttributeButton(callback) {
      return Array.from(this.element.querySelectorAll(attributeButtonSelector)).map((element) =>
        callback(element, getAttributeName(element)));
    }

    applyKeyboardCommand(keys) {
      const keyString = JSON.stringify(keys.sort());
      for (let button of Array.from(this.element.querySelectorAll("[data-trix-key]"))) {
        const buttonKeys = button.getAttribute("data-trix-key").split("+");
        const buttonKeyString = JSON.stringify(buttonKeys.sort());
        if (buttonKeyString === keyString) {
          triggerEvent("mousedown", {onElement: button});
          return true;
        }
      }
      return false;
    }

    // Dialogs

    dialogIsVisible(dialogName) {
      let element;
      if (element = this.getDialog(dialogName)) {
        return element.hasAttribute("data-trix-active");
      }
    }

    toggleDialog(dialogName) {
      if (this.dialogIsVisible(dialogName)) {
        return this.hideDialog();
      } else {
        return this.showDialog(dialogName);
      }
    }

    showDialog(dialogName) {
      let attributeName;
      this.hideDialog();
      this.delegate?.toolbarWillShowDialog();

      const element = this.getDialog(dialogName);
      element.setAttribute("data-trix-active", "");
      element.classList.add("trix-active");

      for (let disabledInput of Array.from(element.querySelectorAll("input[disabled]"))) {
        disabledInput.removeAttribute("disabled");
      }

      if (attributeName = getAttributeName(element)) {
        let input;
        if (input = getInputForDialog(element, dialogName)) {
          input.value = this.attributes[attributeName] != null ? this.attributes[attributeName] : "";
          input.select();
        }
      }

      return this.delegate?.toolbarDidShowDialog(dialogName);
    }

    setAttribute(dialogElement) {
      const attributeName = getAttributeName(dialogElement);
      const input = getInputForDialog(dialogElement, attributeName);
      if (input.willValidate && !input.checkValidity()) {
        input.setAttribute("data-trix-validate", "");
        input.classList.add("trix-validate");
        return input.focus();
      } else {
        this.delegate?.toolbarDidUpdateAttribute(attributeName, input.value);
        return this.hideDialog();
      }
    }

    removeAttribute(dialogElement) {
      const attributeName = getAttributeName(dialogElement);
      this.delegate?.toolbarDidRemoveAttribute(attributeName);
      return this.hideDialog();
    }

    hideDialog() {
      let element;
      if (element = this.element.querySelector(activeDialogSelector)) {
        element.removeAttribute("data-trix-active");
        element.classList.remove("trix-active");
        this.resetDialogInputs();
        return this.delegate?.toolbarDidHideDialog(getDialogName(element));
      }
    }

    resetDialogInputs() {
      return (() => {
        const result = [];
        for (let input of Array.from(this.element.querySelectorAll(dialogInputSelector))) {
          input.setAttribute("disabled", "disabled");
          input.removeAttribute("data-trix-validate");
          result.push(input.classList.remove("trix-validate"));
        }
        return result;
      })();
    }

    getDialog(dialogName) {
      return this.element.querySelector(`[data-trix-dialog=${dialogName}]`);
    }
  };
  ToolbarController.initClass();
  return ToolbarController;
})();
