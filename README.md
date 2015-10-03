# Trix: A Rich Text Editor for Everyday Writing

**Compose beautifully formatted text in your web application.** Trix is an editor for writing messages, comments, articles, and lists—the simple documents most web apps are made of. It features a sophisticated document model, support for embedded attachments, and outputs terse and consistent HTML.

Trix is an open-source project from [Basecamp](https://basecamp.com/), the creators of [Ruby on Rails](http://rubyonrails.org/). Millions of people write in Basecamp every day, and we built Trix to give them the best possible editing experience. See Trix in action in the [all-new Basecamp 3](https://basecamp.com/3-is-coming).

## Built for the Modern Web

Trix is built with emerging web standards, notably [Custom Elements](http://www.w3.org/TR/custom-elements/), [Mutation Observer](https://dom.spec.whatwg.org/#mutation-observers), and [Promises](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects). Eventually we expect all browsers to implement these standards. In the meantime, Trix includes [polyfills](https://en.wikipedia.org/wiki/Polyfill) for missing functionality.

Trix supports all evergreen, self-updating desktop browsers: Chrome, Safari, Firefox, and Internet Explorer 11 and up. It works great on mobile, too: Safari on iOS 8 and above, and Chrome on Android 4 and above.

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

Like an HTML `<textarea>`, `<trix-editor>` accepts `autofocus` and `placeholder` attributes.

Unlike a `<textarea>`, `<trix-editor>` expands vertically to fit its contents. Specify a `height` in your page’s CSS to fix the editor's size.

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

---

© 2015 Basecamp, LLC. Trix is distributed under an MIT-style license; see `LICENSE` for details.
