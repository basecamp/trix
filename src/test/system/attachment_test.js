import * as config from "trix/config"
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"

import {
  after,
  assert,
  clickElement,
  clickToolbarButton,
  createFile,
  defer,
  dragToCoordinates,
  moveCursor,
  pressKey,
  test,
  testGroup,
  triggerEvent,
  typeCharacters,
} from "test/test_helper"

testGroup("Attachments", { template: "editor_with_image" }, () => {
  test("moving an image by drag and drop", (expectDocument) => {
    typeCharacters("!", () => {
      moveCursor({ direction: "right", times: 1 }, (coordinates) => {
        const img = document.activeElement.querySelector("img")
        triggerEvent(img, "mousedown")
        defer(() => {
          dragToCoordinates(coordinates, () => {
            expectDocument(`!a${OBJECT_REPLACEMENT_CHARACTER}b\n`)
          })
        })
      })
    })
  })

  test("removing an image", (expectDocument) => {
    after(20, () => {
      clickElement(getFigure(), () => {
        const closeButton = getFigure().querySelector("[data-trix-action=remove]")
        clickElement(closeButton, () => {
          expectDocument("ab\n")
        })
      })
    })
  })

  test("editing an image caption", (expectDocument) => {
    after(20, () => {
      clickElement(findElement("figure"), () => {
        clickElement(findElement("figcaption"), () => {
          defer(() => {
            const textarea = findElement("textarea")
            assert.ok(textarea)
            textarea.focus()
            textarea.value = "my"
            triggerEvent(textarea, "input")
            defer(() => {
              textarea.value = ""
              defer(() => {
                textarea.value = "my caption"
                triggerEvent(textarea, "input")
                pressKey("return", () => {
                  assert.notOk(findElement("textarea"))
                  assert.textAttributes([ 2, 3 ], { caption: "my caption" })
                  assert.locationRange({ index: 0, offset: 3 })
                  expectDocument(`ab${OBJECT_REPLACEMENT_CHARACTER}\n`)
                })
              })
            })
          })
        })
      })
    })
  })

  test("editing an attachment caption with no filename", (done) =>
    after(20, () => {
      let captionElement = findElement("figcaption")
      assert.ok(captionElement.clientHeight > 0)
      assert.equal(captionElement.getAttribute("data-trix-placeholder"), config.lang.captionPlaceholder)

      clickElement(findElement("figure"), () => {
        captionElement = findElement("figcaption")
        assert.ok(captionElement.clientHeight > 0)
        assert.equal(captionElement.getAttribute("data-trix-placeholder"), config.lang.captionPlaceholder)
        done()
      })
    }))

  test("updating an attachment's href attribute while editing its caption", (expectDocument) => {
    const attachment = getEditorController().attachmentManager.getAttachments()[0]

    after(20, () => {
      clickElement(findElement("figure"), () => {
        clickElement(findElement("figcaption"), () => {
          defer(() => {
            let textarea = findElement("textarea")
            assert.ok(textarea)
            textarea.focus()
            textarea.value = "my caption"
            triggerEvent(textarea, "input")
            attachment.setAttributes({ href: "https://example.com" })
            defer(() => {
              textarea = findElement("textarea")
              assert.ok(document.activeElement === textarea)
              assert.equal(textarea.value, "my caption")
              pressKey("return", () => {
                assert.notOk(findElement("textarea"))
                assert.textAttributes([ 2, 3 ], { caption: "my caption" })
                assert.locationRange({ index: 0, offset: 3 })
                expectDocument(`ab${OBJECT_REPLACEMENT_CHARACTER}\n`)
              })
            })
          })
        })
      })
    })
  })

  testGroup("File insertion", { template: "editor_empty" }, () => {
    test("inserting a file in a formatted block", (expectDocument) => {
      clickToolbarButton({ attribute: "bullet" }, () => {
        clickToolbarButton({ attribute: "bold" }, () => {
          getComposition().insertFile(createFile())
          assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
          assert.textAttributes([ 0, 1 ], {})
          expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`)
        })
      })
    })

    test("inserting a files in a formatted block", (expectDocument) => {
      clickToolbarButton({ attribute: "quote" }, () => {
        clickToolbarButton({ attribute: "italic" }, () => {
          getComposition().insertFiles([ createFile(), createFile() ])

          assert.blockAttributes([ 0, 2 ], [ "quote" ])
          assert.textAttributes([ 0, 1 ], {})
          assert.textAttributes([ 1, 2 ], {})
          expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}${OBJECT_REPLACEMENT_CHARACTER}\n`)
        })
      })
    })
  })
})

const getFigure = () => findElement("figure")

const findElement = (selector) => getEditorElement().querySelector(selector)
