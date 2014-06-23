### Glossary

* **Piece:** Bundles a string together with a set of character-level formatting attributes that apply to the entire string. (The string can optionally represent an attachment.)

* **Attachment:** Holds the URL, content type, and original dimensions of an inline attachment. A Piece with an attachment has a single Unicode object replacement character as its string value.

* **Text:** Provides an interface for editing and querying character-level formatting attributes across arbitrary ranges of a string. Internally, Text splits its string into a list of Piece objects for each inline attachment and unique span of formatting attributes.

* **Block:** Bundles a Text together with a set of formatting attributes that apply to the entire Text. Used to implement block- or paragraph-level attributes such as block quotes and bulleted lists.

* **Document:** Provides an interface for editing and querying character- and block-level attributes across arbitrary ranges of rich text. Internally, Document maintains an ordered list of Block objects for each unique span of attributes. This is the primary interface for programmatically interacting with rich text.

* **Responder:** An abstract interface for performing rich text editing operations at the current selection point or across the current selected range.

* **Composition:** Implements the Responder interface for editing a rich text in a document, querying the state of the editor's formatting attributes, maintaining a collection of attachments, and notifying a delegate of state changes. This class models the editing session between an EditorController and its Document.

* **Location:** An abstract interface that defines two properties, _index_ and _offset_, representing an object's index in an ordered collection, and an offset of a particular point in the object, respectively.

* **LocationRange:** Groups a start and end Location into a single unit and provides a convenience method for checking whether the range is collapsed (i.e. whether its start and end values are the same).

* **Splittable:** An abstract interface that specifies methods for splitting an object into two objects at an integer offset, and optionally consolidating two splittable objects into a single object.

* **SplittableList:** Maps integer _positions_ to indexes of, and offsets into, an ordered list of Splittable objects. Provides an interface for extracting and manipulating ranges of lists across arbitrary positions.

* **AttachmentManager:** Manages a set of Attachment objects. Asks its delegate for permission to store attachments, and notifies its delegate when attachments are added to or removed from the set. Provides the delegate with an interface for updating attachment attributes.

* **SelectionManager:** Manages mapping the DOM selection to a LocationRange and vice versa by inspecting special DOM attributes on elements rendered by the view. Notifies its delegate when the DOM selection changes.

* **UndoManager:** Manages a stack of previous states of a Composition, and provides methods for querying, saving, and restoring those states.

* **BlockView:** Provides a method for rendering a Block into a DOM element. Annotates rendered elements with an assortment of properties, including `trixPosition`, `trixLength`, and `trixIndex` which can be used to map DOM selection ranges to Document locations.

* **DocumentView:** Renders a Document into the DOM by iteratively rendering a BlockView for each Block in the document.

* **ImageAttachmentController:** Provides a graphical interface for resizing inline image attachments.

* **DocumentController:** Manages a DocumentView, notifies its delegate of DOM focus changes, and intercepts and dispatches click events to an ImageAttachmentController as necessary.

* **InputController:** Handles DOM keyboard, drag-and-drop, and input events, and transforms them into method calls on a Responder instance.

* **ToolbarController:** Handles input from a client-provided toolbar element, and reflects changes in the editor state by adding or removing DOM classes from associated elements in the toolbar.

* **EditorController:** Coordinates interactions at a high level between a DocumentController, a SelectionManager, a Composition, an UndoManager, an InputController, and a ToolbarController. This is the outermost component in an editor.




