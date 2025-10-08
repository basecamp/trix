# Trix
### A Rich Text Editor for Everyday Writing

**Compose beautifully formatted text in your web application.** Trix is a WYSIWYG editor for writing messages, comments, articles, and lists—the simple documents most web apps are made of. It features a sophisticated document model, support for embedded attachments, and outputs terse and consistent HTML.

Trix is an open-source project from [37signals](https://37signals.com), the creators of [Ruby on Rails](http://rubyonrails.org/). Millions of people trust their text to us, and we built Trix to give them the best possible editing experience. See Trix in action in [Basecamp 3](https://basecamp.com).

### Different By Design

When Trix was designed in 2014, most WYSIWYG editors were wrappers around HTML’s `contenteditable` and `execCommand` APIs, designed by Microsoft to support live editing of web pages in Internet Explorer 5.5, and [eventually reverse-engineered](https://blog.whatwg.org/the-road-to-html-5-contenteditable#history) and copied by other browsers.

Because these APIs were not fully specified or documented, and because WYSIWYG HTML editors are enormous in scope, each browser’s implementation has its own set of bugs and quirks, and JavaScript developers are left to resolve the inconsistencies.

Trix sidestepped these inconsistencies by treating `contenteditable` as an I/O device: when input makes its way to the editor, Trix converts that input into an editing operation on its internal document model, then re-renders that document back into the editor. This gives Trix complete control over what happens after every keystroke, and avoids the need to use `execCommand` at all.

This is the approach that all modern, production ready, WYSIWYG editors now take.

### Built on Web standards

<details><summary>Trix supports all evergreen, self-updating desktop and mobile browsers.</summary><img src="https://app.saucelabs.com/browser-matrix/basecamp_trix.svg"></details>

Trix is built with established web standards, notably [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements), [Element Internals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals), [Mutation Observer](https://dom.spec.whatwg.org/#mutation-observers), and [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

# Getting Started

Trix comes bundled in ESM and UMD formats and works with any asset packaging system.

The easiest way to start with Trix is including it from an npm CDN in the `<head>` of your page:

```html
<head>
  …
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/trix@2.0.8/dist/trix.css">
  <script type="text/javascript" src="https://unpkg.com/trix@2.0.8/dist/trix.umd.min.js"></script>
</head>
```

`trix.css` includes default styles for the Trix toolbar, editor, and attachments. Skip this file if you prefer to define these styles yourself.

Alternatively, you can install the npm package and import it in your application:

```js
import Trix from "trix"

document.addEventListener("trix-before-initialize", () => {
  // Change Trix.config if you need
})
```

## Creating an Editor

Place an empty `<trix-editor></trix-editor>` tag on the page. Trix will automatically insert a separate `<trix-toolbar>` before the editor.

Like an HTML `<textarea>`, `<trix-editor>` accepts `autofocus` and `placeholder` attributes. Unlike a `<textarea>`, `<trix-editor>` automatically expands vertically to fit its contents.

## Creating a Toolbar

Trix automatically will create a toolbar for you and attach it right before the `<trix-editor>` element. If you'd like to place the toolbar in a different place you can use the `toolbar` attribute:

```html
<main>
  <trix-toolbar id="my_toolbar"></trix-toolbar>
  <div class="more-stuff-inbetween"></div>
  <trix-editor toolbar="my_toolbar" input="my_input"></trix-editor>
</main>
```

To change the toolbar without modifying Trix, you can overwrite the `Trix.config.toolbar.getDefaultHTML()` function. The default toolbar HTML is in `config/toolbar.js`. Trix uses data attributes to determine how to respond to a toolbar button click.

**Toggle Attribute**

With `data-trix-attribute="<attribute name>"`, you can add an attribute to the current selection.
For example, to apply bold styling to the selected text the button is:

``` html
<button type="button" class="bold" data-trix-attribute="bold" data-trix-key="b"></button>
```

Trix will determine that a range of text is selected and will apply the formatting defined in `Trix.config.textAttributes` (found in `config/text_attributes.js`).

`data-trix-key="b"` tells Trix that this attribute should be applied when you use <kbd>meta</kbd>+<kbd>b</kdb>.

If the attribute is defined in `Trix.config.blockAttributes`, Trix will apply the attribute to the current block of text.

``` html
<button type="button" class="quote" data-trix-attribute="quote"></button>
```

Clicking the quote button toggles whether the block should be rendered with `<blockquote>`.

## Integrating with Element Internals

Trix will integrate `<trix-editor>` elements with forms depending on the browser's support for [Element Internals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals). If there is a need to disable support for `ElementInternals`, set `Trix.elements.TrixEditorElement.formAssociated = false`:

```js
import Trix from "trix"

Trix.elements.TrixEditorElement.formAssociated = false
```

When Trix is configured to be compatible with `ElementInternals`, it is also
capable of functioning without an `<input type="hidden">` element. To configure
a `<trix-editor>` element to skip creating its `<input type="hidden">`, set the
element's `willCreateInput = false`:

```js
addEventListener("before-trix-initialize", (event) => {
  const trixEditor = event.target

  trixEditor.willCreateInput = false
})
```

> [!NOTE]
> Trix will *always* use an associated `<input type="hidden">` element when the
> `[input]` attribute is set. To migrate to `<input>`-free support, set
> `willCreateInput = false`, then render the `<trix-editor>` without the
> `[input]` attribute.

> [!WARNING]
> In the absence of an `<input type="hidden">` element, the `<trix-editor>`
> element's value will not be included in `<form>` element submissions unless it
> is rendered with a `[name]` attribute. Set the `[name]` attribute to the same
> value that the `<input type="hidden">` element would have.

## Invoking Internal Trix Actions

Internal actions are defined in `controllers/editor_controller.js` and consist of:

* undo
* redo
* link
* increaseBlockLevel
* decreaseBlockLevel

``` html
<button type="button" class="block-level decrease" data-trix-action="decreaseBlockLevel"></button>
```

## Invoking External Custom Actions

If you want to add a button to the toolbar and have it invoke an external action, you can prefix your action name with `x-`. For example, if I want to print a log statement any time my new button is clicked, I would set by button's data attribute to be `data-trix-action="x-log"`

``` html
<button id="log-button" type="button" data-trix-action="x-log"></button>
```

To respond to the action, listen for `trix-action-invoke`. The event's `target` property returns a reference to the `<trix-editor>` element, its `invokingElement` property returns a reference to the `<button>` element, and its `actionName` property returns the value of the `[data-trix-action]` attribute. Use the value of the `actionName` property to detect which external action was invoked.

```javascript
document.addEventListener("trix-action-invoke", function(event) {
  const { target, invokingElement, actionName } = event

  if (actionName === "x-log") {
    console.log(`Custom ${actionName} invoked from ${invokingElement.id} button on ${target.id} trix-editor`)
  }
})
```

## Integrating With Forms

To submit the contents of a `<trix-editor>` with a form, first define a hidden input field in the form and assign it an `id`. Then reference that `id` in the editor’s `input` attribute.

```html
<form …>
  <input id="x" type="hidden" name="content">
  <trix-editor input="x"></trix-editor>
</form>
```

Trix will automatically update the value of the hidden input field with each change to the editor.

## Populating With Stored Content

To populate a `<trix-editor>` with stored content, include that content in the associated input element’s `value` attribute.

```html
<form …>
  <input id="x" value="Editor content goes here" type="hidden" name="content">
  <trix-editor input="x"></trix-editor>
</form>
```

Use an associated input element to initially populate an editor. When an associated input element is absent, Trix will safely sanitize then load any HTML content inside a `<trix-editor>…</trix-editor>` tag.

```html
<form …>
  <trix-editor>Editor content goes here</trix-editor>
</form>
```

> [!WARNING]
> When a `<trix-editor>` element initially connects with both HTML content *and*
> an associated input element, Trix will *always* disregard the HTML content and
> load its initial content from the associated input element.

## Validating the Editor

Out of the box, `<trix-editor>` elements support browsers' built-in [Constraint
validation][]. When rendered with the [required][] attribute, editors will be
invalid when they're completely empty. For example, consider the following HTML:

```html
<input id="x" value="" type="hidden" name="content">
<trix-editor input="x" required></trix-editor>
```

Since the `<trix-editor>` element is `[required]`, it is invalid when its value
is empty:

```js
const editor = document.querySelector("trix-editor")

editor.validity.valid        // => false
editor.validity.valueMissing // => true
editor.matches(":valid")     // => false
editor.matches(":invalid")   // => true

editor.value = "A value that isn't empty"

editor.validity.valid         // => true
editor.validity.valueMissing  // => false
editor.matches(":valid")      // => true
editor.matches(":invalid")    // => false
```

In addition to the built-in `[required]` attribute, `<trix-editor>`
elements support custom validation through their [setCustomValidity][] method.
For example, consider the following HTML:

```js
<input id="x" value="" type="hidden" name="content">
<trix-editor input="x"></trix-editor>
```

Custom validation can occur at any time. For example, validation can occur after
a `trix-change` event fired after the editor's contents change:

```js
addEventListener("trix-change", (event) => {
  const editorElement = event.target
  const trixDocument = editorElement.editor.getDocument()
  const isValid = (trixDocument) => {
    // determine the validity based on your custom criteria
    return true
  }

  if (isValid(trixDocument)) {
    editorElement.setCustomValidity("")
  } else {
    editorElement.setCustomValidity("The document is not valid.")
  }
}
```

[Constraint validation]: https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation
[required]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required
[setCustomValidity]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity

## Disabling the Editor

To disable the `<trix-editor>`, render it with the `[disabled]` attribute:

```html
<trix-editor disabled></trix-editor>
```

Disabled editors are not editable, cannot receive focus, and their values will
be ignored when their related `<form>` element is submitted.

To change whether or not an editor is disabled, either toggle the `[disabled]`
attribute or assign a boolean to the `.disabled` property:

```html
<trix-editor id="editor" disabled></trix-editor>

<script>
  const editor = document.getElementById("editor")

  editor.toggleAttribute("disabled", false)
  editor.disabled = true
</script>
```

When disabled, the editor will match the [:disabled CSS
pseudo-class][:disabled].

[:disabled]: https://developer.mozilla.org/en-US/docs/Web/CSS/:disabled

## Providing an Accessible Name

Like other form controls, `<trix-editor>` elements should have an accessible name. The `<trix-editor>` element integrates with `<label>` elements. It supports two styles of integrating with `<label>` elements:

1. render the `<trix-editor>` element with an `[id]` attribute that the `<label>` element references through its `[for]` attribute:

```html
<label for="editor">Editor</label>
<trix-editor id="editor"></trix-editor>
```

2. render the `<trix-editor>` element as a child of the `<label>` element:

```html
<trix-toolbar id="editor-toolbar"></trix-toolbar>
<label>
  Editor

  <trix-editor toolbar="editor-toolbar"></trix-editor>
</label>
```

> [!WARNING]
> When rendering the `<trix-editor>` element as a child of the `<label>` element, [explicitly render](#creating-an-editor) the corresponding `<trix-toolbar>` element outside of the `<label>` element.

In addition to integrating with `<label>` elements, `<trix-editor>` elements support `[aria-label]` and `[aria-labelledby]` attributes.

## Styling Formatted Content

To ensure what you see when you edit is what you see when you save, use a CSS class name to scope styles for Trix formatted content. Apply this class name to your `<trix-editor>` element, and to a containing element when you render stored Trix content for display in your application.

```html
<trix-editor class="trix-content"></trix-editor>
```

```html
<div class="trix-content">Stored content here</div>
```

The default `trix.css` file includes styles for basic formatted content—including bulleted and numbered lists, code blocks, and block quotes—under the class name `trix-content`. We encourage you to use these styles as a starting point by copying them into your application’s CSS with a different class name.

## Storing Attached Files

Trix automatically accepts files dragged or pasted into an editor and inserts them as attachments in the document. Each attachment is considered _pending_ until you store it remotely and provide Trix with a permanent URL.

To store attachments, listen for the `trix-attachment-add` event. Upload the attached files with XMLHttpRequest yourself and set the attachment’s URL attribute upon completion. See the [attachment example](https://trix-editor.org/js/attachments.js) for detailed information.

If you don’t want to accept dropped or pasted files, call `preventDefault()` on the `trix-file-accept` event, which Trix dispatches just before the `trix-attachment-add` event.

## Previewing Attached Files

Trix automatically previews attached image files. To determine whether or not to preview an attached file, Trix compares the file's content type against the [Trix.Attachment.previewablePattern](./src/trix/models/attachment.js#L7). By default, Trix will preview the following content types:

* `image/gif`
* `image/png`
* `image/webp`
* `image/jpg`
* `image/jpeg`

To customize an attachment's preview, listen for the `trix-attachment-add` event. When handling the event, set the attachment's `previewable` attribute, then change its preview URL by calling `setPreviewURL`:

```js
addEventListener("trix-attachment-add", (event) => {
  if (event.attachment.file instanceof File) {
    event.attachment.setAttribute("previewable", true)
    event.attachment.setPreviewURL("...")
  }
})
```

# Editing Text Programmatically

You can manipulate a Trix editor programmatically through the `Trix.Editor` interface, available on each `<trix-editor>` element through its `editor` property.

```js
var element = document.querySelector("trix-editor")
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

### Immutability and Equality

Documents are immutable values. Each change you make in an editor replaces the previous document with a new document. Capturing a snapshot of the editor’s content is as simple as keeping a reference to its document, since that document will never change over time. (This is how Trix implements undo.)

To compare two documents for equality, use the `document.isEqualTo` method.

```js
var document = element.editor.getDocument()
document.isEqualTo(element.editor.getDocument())  // true
```

## Getting and Setting the Selection

Trix documents are structured as sequences of individually addressable characters. The index of one character in a document is called a _position_, and a start and end position together make up a _range_.

To get the editor’s current selection, use the `editor.getSelectedRange` method, which returns a two-element array containing the start and end positions.

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

To programmatically move the cursor or selection through the document, call the `editor.moveCursorInDirection` or `editor.expandSelectionInDirection` methods with a _direction_ argument. The direction can be either `"forward"` or `"backward"`.

```js
// Move the cursor backward one character
element.editor.moveCursorInDirection("backward")

// Expand the end of the selection forward by one character
element.editor.expandSelectionInDirection("forward")
```

### Converting Positions to Pixel Offsets

Sometimes you need to know the _x_ and _y_ coordinates of a character at a given position in the editor. For example, you might want to absolutely position a pop-up menu element below the editor’s cursor.

Call the `editor.getClientRectAtPosition` method with a position argument to get a [`DOMRect`](https://drafts.fxtf.org/geometry/#DOMRect) instance representing the left and top offsets, width, and height of the character at the given position.

```js
var rect = element.editor.getClientRectAtPosition(0)
[rect.left, rect.top]  // [17, 49]
```

## Inserting and Deleting Text

The editor interface provides methods for inserting, replacing, and deleting text at the current selection.

To insert or replace text, begin by setting the selected range, then call one of the insertion methods below. Trix will first remove any selected text, then insert the new text at the start position of the selected range.

### Inserting Plain Text

To insert unformatted text into the document, call the `editor.insertString` method.

```js
// Insert “Hello” at the beginning of the document
element.editor.setSelectedRange([0, 0])
element.editor.insertString("Hello")
```

### Inserting HTML

To insert HTML into the document, call the `editor.insertHTML` method. Trix will first convert the HTML into its internal document model. During this conversion, any formatting that cannot be represented in a Trix document will be lost.

```js
// Insert a bold “Hello” at the beginning of the document
element.editor.setSelectedRange([0, 0])
element.editor.insertHTML("<strong>Hello</strong>")
```

### Inserting a File

To insert a DOM [`File`](http://www.w3.org/TR/FileAPI/#file) object into the document, call the `editor.insertFile` method. Trix will insert a pending attachment for the file as if you had dragged and dropped it onto the editor.

```js
// Insert the selected file from the first file input element
var file = document.querySelector("input[type=file]").file
element.editor.insertFile(file)
```

### Inserting a Content Attachment

Content attachments are self-contained units of HTML that behave like files in the editor. They can be moved or removed, but not edited directly, and are represented by a single character position in the document model.

To insert HTML as an attachment, create a `Trix.Attachment` with a `content` attribute and call the `editor.insertAttachment` method. The HTML inside a content attachment is not subject to Trix’s document conversion rules and will be rendered as-is.

```js
var attachment = new Trix.Attachment({ content: '<span class="mention">@trix</span>' })
element.editor.insertAttachment(attachment)
```

### Inserting a Line Break

To insert a line break, call the `editor.insertLineBreak` method, which is functionally equivalent to pressing the return key.

```js
// Insert “Hello\n”
element.editor.insertString("Hello")
element.editor.insertLineBreak()
```

### Deleting Text

If the current selection is collapsed, you can simulate deleting text before or after the cursor with the `editor.deleteInDirection` method.

```js
// “Backspace” the first character in the document
element.editor.setSelectedRange([1, 1])
element.editor.deleteInDirection("backward")

// Delete the second character in the document
element.editor.setSelectedRange([1, 1])
element.editor.deleteInDirection("forward")
```

To delete a range of text, first set the selected range, then call `editor.deleteInDirection` with either direction as the argument.

```js
// Delete the first five characters
element.editor.setSelectedRange([0, 4])
element.editor.deleteInDirection("forward")
```

## Working With Attributes and Nesting

Trix represents formatting as sets of _attributes_ applied across ranges of a document.

By default, Trix supports the inline attributes `bold`, `italic`, `href`, and `strike`, and the block-level attributes `heading1`, `quote`, `code`, `bullet`, and `number`.

### Applying Formatting

To apply formatting to the current selection, use the `editor.activateAttribute` method.

```js
element.editor.insertString("Hello")
element.editor.setSelectedRange([0, 5])
element.editor.activateAttribute("bold")
```

To set the `href` attribute, pass a URL as the second argument to `editor.activateAttribute`.

```js
element.editor.insertString("Trix")
element.editor.setSelectedRange([0, 4])
element.editor.activateAttribute("href", "https://trix-editor.org/")
```

### Removing Formatting

Use the `editor.deactivateAttribute` method to remove formatting from a selection.

```js
element.editor.setSelectedRange([2, 4])
element.editor.deactivateAttribute("bold")
```

### Formatting With a Collapsed Selection

If you activate or deactivate attributes when the selection is collapsed, your formatting changes will apply to the text inserted by any subsequent calls to `editor.insertString`.

```js
element.editor.activateAttribute("italic")
element.editor.insertString("This is italic")
```

### Adjusting the Nesting Level

To adjust the nesting level of quotes, bulleted lists, or numbered lists, call the `editor.increaseNestingLevel` and `editor.decreaseNestingLevel` methods.

```js
element.editor.activateAttribute("quote")
element.editor.increaseNestingLevel()
element.editor.decreaseNestingLevel()
```

## Using Undo and Redo

Trix editors support unlimited undo and redo. Successive typing and formatting changes are consolidated together at five-second intervals; all other input changes are recorded individually in undo history.

Call the `editor.undo` and `editor.redo` methods to perform an undo or redo operation.

```js
element.editor.undo()
element.editor.redo()
```

Changes you make through the editor interface will not automatically record undo entries. You can save your own undo entries by calling the `editor.recordUndoEntry` method with a description argument.

```js
element.editor.recordUndoEntry("Insert Text")
element.editor.insertString("Hello")
```

## Loading and Saving Editor State

Serialize an editor’s state with `JSON.stringify` and restore saved state with the `editor.loadJSON` method. The serialized state includes the document and current selection, but does not include undo history.

```js
// Save editor state to local storage
localStorage["editorState"] = JSON.stringify(element.editor)

// Restore editor state from local storage
element.editor.loadJSON(JSON.parse(localStorage["editorState"]))
```

## HTML Sanitization

Trix uses [DOMPurify](https://github.com/cure53/DOMPurify/) to sanitize the editor content. You can set the DOMPurify config via `Trix.config.dompurify`.

For example if you want to keep a custom tag, you can access do that with:

```js
Trix.config.dompurify.ADD_TAGS = [ "my-custom-tag" ]
```

## HTML Rendering

Trix renders changes to editor content by replacing existing nodes with new nodes.

To customize how Trix renders changes, set the `<trix-editor>` element's
`render` property to a function that accepts a `<trix-editor>` instance and a
[DocumentFragment][]:

```js
document.addEventListener("trix-before-render", (event) => {
  const defaultRender = event.render

  event.render = function(editorElement, documentFragment) {
    // modify the documentFragment…
    customize(documentFragment)

    // render it with the default rendering function
    defaultRender(editorElement, documentFragment)
  }
})
```

> [!CAUTION]
> By the time that `render(editorElement, documentFragment)` is
> invoked, Trix will have finalized modifications to the HTML content (like HTML
> sanitization, for example). If you make further modifications to the content,
> be sure that they are safe.

[DocumentFragment]: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment

## Observing Editor Changes

The `<trix-editor>` element emits several events which you can use to observe and respond to changes in editor state.

* `trix-before-initialize` fires when the `<trix-editor>` element is attached to the DOM just before Trix installs its `editor` object. If you need to use a custom Trix configuration you can change `Trix.config` here.

* `trix-initialize` fires when the `<trix-editor>` element is attached to the DOM and its `editor` object is ready for use.

* `trix-change` fires whenever the editor’s contents have changed.

* `trix-before-render` fires before the editor’s new contents are rendered. You can override the function used to render the content through the `render` property on the event. The `render` function expects two positional arguments: the `<trix-editor>` element that will render and a [DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment) instance that contains the new content. Read [HTML Rendering](#html-rendering) to learn more.

* `trix-before-paste` fires just before text is pasted into the editor. You can use this to modify the content being pasted or prevent the paste event from happening at all. The `paste` property on the event contains the pasted `string` or `html`, and the `range` of the inserted text.

* `trix-paste` fires whenever text is pasted into the editor. The `paste` property on the event contains the pasted `string` or `html`, and the `range` of the inserted text.

* `trix-selection-change` fires any time the selected range changes in the editor.

* `trix-focus` and `trix-blur` fire when the editor gains or loses focus, respectively.

* `trix-file-accept` fires when a file is dropped or inserted into the editor. You can access the DOM `File` object through the `file` property on the event. Call `preventDefault` on the event to prevent attaching the file to the document.

* `trix-attachment-add` fires after an attachment is added to the document. You can access the Trix attachment object through the `attachment` property on the event. If the `attachment` object has a `file` property, you should store this file remotely and set the attachment’s URL attribute. See the [attachment example](http://trix-editor.org/js/attachments.js) for detailed information.

* `trix-attachment-edit` fires after an attachment is edited in the document. You can access the Trix attachment object through the `attachment` property on the event.

* `trix-attachment-remove` fires when an attachment is removed from the document. You can access the Trix attachment object through the `attachment` property on the event. You may wish to use this event to clean up remotely stored files.

* `trix-action-invoke` fires when a Trix action is invoked. You can access the `<trix-editor>` element through the event's `target` property, the element responsible for invoking the action through the `invokingElement` property, and the action's name through the `actionName` property. The `trix-action-invoke` event will only fire for [custom](#invoking-external-custom-actions) actions and not for [built-in](#invoking-internal-trix-actions).

# Contributing to Trix

Trix is open-source software, freely distributable under the terms of an [MIT-style license](LICENSE). The [source code is hosted on GitHub](https://github.com/basecamp/trix).

We welcome contributions in the form of bug reports, pull requests, or thoughtful discussions in the [GitHub issue tracker](https://github.com/basecamp/trix/issues). Please see the [Code of Conduct](CODE_OF_CONDUCT.md) for our pledge to contributors.

Trix was created by [Javan Makhmali](https://twitter.com/javan) and [Sam Stephenson](https://twitter.com/sstephenson), with development sponsored by [37signals](https://37signals.com).

### Building From Source

Trix uses [Yarn](https://yarnpkg.com/) to manage dependencies and [Rollup](https://rollupjs.org/guide/en/) to bundle its source.

Install development dependencies with:

```
$ yarn install
```

To generate distribution files run:

```
$ yarn build
```

### Developing In-Browser

You can run a watch process to automatically generate distribution files when your source file change:

```
$ yarn watch
```

When the watch process is running you can run a web server to serve the compiled assets:

```
$ yarn dev
```

With the development server running, you can visit `/index.html` to see a Trix debugger inspector, or `/test.html` to run the tests on a browser.

For easier development, you can watch for changes to the JavaScript and style files, and serve the results in a browser, with a single command:

```
$ yarn start
```

### Running Tests

You can also run the test in a headless mode with:

```
$ yarn test
```

---

© 37signals, LLC.
