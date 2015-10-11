# Trix
### A Rich Text Editor for Everyday Writing

**Compose beautifully formatted text in your web application.** Trix is a WYSIWYG editor for writing messages, comments, articles, and lists—the simple documents most web apps are made of. It features a sophisticated document model, support for embedded attachments, and outputs terse and consistent HTML.

Trix is an open-source project from [Basecamp](https://basecamp.com/), the creators of [Ruby on Rails](http://rubyonrails.org/). Millions of people trust their text to Basecamp, and we built Trix to give them the best possible editing experience. See Trix in action in the [all-new Basecamp 3](https://basecamp.com/3-is-coming).

### Built for the Modern Web

Trix supports all evergreen, self-updating desktop and mobile browsers.

![Browser Test Status](https://saucelabs.com/browser-matrix/basecamp-trix.svg?auth=2a3e69c3aef98784a8828ddd533ec064)

Trix is built with emerging web standards, notably [Custom Elements](http://www.w3.org/TR/custom-elements/), [Mutation Observer](https://dom.spec.whatwg.org/#mutation-observers), and [Promises](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects). Eventually we expect all browsers to implement these standards. In the meantime, Trix includes [polyfills](https://en.wikipedia.org/wiki/Polyfill) for missing functionality.

# Installation

Include the bundled `trix.css` and `trix.js` files in the `<head>` of your page.

```html
<head>
  …
  <link rel="stylesheet" type="text/css" href="trix.css">
  <script type="text/javascript" src="trix.js"></script>
</head>
```

`trix.css` includes default styles for the Trix toolbar, editor, and attachments. Skip this file if you prefer to define these styles yourself.

To use your own polyfills, or to target only browsers that support all of the required standards, include `trix-core.js` instead.

# Basic Usage

Put an empty `<trix-editor></trix-editor>` tag on the page. Trix will automatically insert a separate `<trix-toolbar>` before the editor.

Like an HTML `<textarea>`, `<trix-editor>` accepts `autofocus` and `placeholder` attributes. Unlike a `<textarea>`, `<trix-editor>` automatically expands vertically to fit its contents. Specify a `height` in your page’s CSS to keep the editor at a fixed size.

## Integrating With Forms

To submit the contents of a `<trix-editor>` with a form, first define a hidden input field in the form and assign it an `id`. Then reference that `id` in the editor’s `input` attribute.

```html
<form …>
  <input id="x" type="hidden" name="content">
  <trix-editor input="x"></trix-editor>
</form>
```

Trix will automatically update the value of the hidden input field with each change to the editor.

## Populating With Existing Content

To populate a `<trix-editor>` with existing content, include that content in the associated input element’s `value` attribute.

```html
<form …>
  <input id="x" value="Editor content goes here" type="hidden" name="content">
  <trix-editor input="x"></trix-editor>
</form>
```

Always use an associated input element to safely populate an editor. Trix won’t load any HTML content inside a `<trix-editor>…</trix-editor>` tag.

## Storing Attached Files

Trix automatically accepts files dragged or pasted into an editor and inserts them as attachments in the document. Each attachment is considered _pending_ until you store it remotely and provide Trix with a permanent URL.

To store attachments, listen for the `trix-attachment-add` event. Upload the attached files with XMLHttpRequest yourself and set the attachment’s URL attribute upon completion. See the [attachment example](…) for detailed information.

If you don’t want to accept dropped or pasted files, call `preventDefault()` on the `trix-file-accept` event, which Trix dispatches just before the `trix-attachment-add` event.

# Editing Text Programmatically

You can manipulate a Trix editor programmatically through the `Trix.Editor` interface, available on each `<trix-editor>` element through its `editor` property.

```js
var element = document.querySelector(“trix-editor”)
element.editor  // is a Trix.Editor instance
```

## Understanding the Document Model

The formatted content of a Trix editor is known as a _document_, and is represented as an instance of the `Trix.Document` class. To get the editor’s current document, use the `editor.getDocument` method.

```js
element.editor.getDocument()  // is a Trix.Document instance
```

You can convert a document to an unformatted JavaScript string with the `document.toString` method.

```js
var document = element.editor.getDocument()
document.toString()  // is a JavaScript string
```

### Characters and Positions

Trix documents are structured as sequences of individually addressable characters. The index of one character in a document is called a _position_, and a start and end position together make up a _range_.

### Attributes

Trix represents formatting as sets of _attributes_ applied across ranges of a document. …

Block attributes …

### Immutability and Equality

Documents are immutable values. Each change you make in an editor replaces the previous document with a new document. Capturing a snapshot of the editor’s content is as simple as keeping a reference to its document, since that document will never change over time. (This is how Trix implements undo.)

To compare two documents for equality, use the `document.isEqualTo` method.

```js
var document = element.editor.getDocument()
document.isEqualTo(element.editor.getDocument())  // true
```

## Getting and Setting the Current Selection

To get the editor’s current selection, use the `editor.getSelectedRange` method, which returns a 2-element array containing the start and end positions.

```js
element.editor.getSelectedRange()  // [0, 0]
```

You can set the editor’s current selection by passing a range array to the `editor.setSelectedRange` method.

```js
// Select the first character in the document
element.editor.setSelectedRange([0, 1])
```

### Collapsed Selections

When the start and end positions of a range are equal, the range is said to be _collapsed_. In the editor, a collapsed selection appears as a blinking cursor rather than a highlighted span of text.

For convenience, the following calls to `setSelectedRange` are equivalent when working with collapsed selections:

```js
element.editor.setSelectedRange(1)
element.editor.setSelectedRange([1])
element.editor.setSelectedRange([1, 1])
```

### Directional Movement

moveCursorInDirection/expandSelectionInDirection

### Converting Positions to Pixel Offsets

getClientRectAtPosition

## Inserting and Deleting Text

* insertHTML
* insertString
* deleteInDirection

## Working With Current Attributes and Indentation

## Loading and Saving Editor State

Serialize an editor’s state with `JSON.stringify` and restore saved state with the `editor.loadJSON` method. The serialized state includes the document and current selection.

```js
// Save editor state to local storage
localStorage[“editorState”] = JSON.stringify(element.editor)

// Restore editor state from local storage
element.editor.loadJSON(JSON.parse(localStorage[“editorState”]))
```

## Using Undo and Redo

# Observing Editor Changes


---

© 2015 Basecamp, LLC. Trix is distributed under an MIT-style license; see `LICENSE` for details.
