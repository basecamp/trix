import {
  assert,
  clickToolbarButton,
  expandSelection,
  moveCursor,
  test,
  testGroup,
  typeCharacters,
} from "test/test_helper"

testGroup("Undo/Redo", { template: "editor_empty" }, () => {
  test("typing and undoing", (done) => {
    const first = getDocument().copy()
    typeCharacters("abc", () => {
      assert.notOk(getDocument().isEqualTo(first))
      clickToolbarButton({ action: "undo" }, () => {
        assert.ok(getDocument().isEqualTo(first))
        done()
      })
    })
  })

  test("typing, formatting, typing, and undoing", (done) => {
    const first = getDocument().copy()
    typeCharacters("abc", () => {
      const second = getDocument().copy()
      clickToolbarButton({ attribute: "bold" }, () =>
        typeCharacters("def", () => {
          const third = getDocument().copy()
          clickToolbarButton({ action: "undo" }, () => {
            assert.ok(getDocument().isEqualTo(second))
            clickToolbarButton({ action: "undo" }, () => {
              assert.ok(getDocument().isEqualTo(first))
              clickToolbarButton({ action: "redo" }, () => {
                assert.ok(getDocument().isEqualTo(second))
                clickToolbarButton({ action: "redo" }, () => {
                  assert.ok(getDocument().isEqualTo(third))
                  done()
                })
              })
            })
          })
        })
      )
    })
  })

  test("formatting changes are batched by location range", (done) =>
    typeCharacters("abc", () => {
      const first = getDocument().copy()
      expandSelection("left", () =>
        clickToolbarButton({ attribute: "bold" }, () =>
          clickToolbarButton({ attribute: "italic" }, () => {
            const second = getDocument().copy()
            moveCursor("left", () =>
              expandSelection("left", () =>
                clickToolbarButton({ attribute: "italic" }, () => {
                  const third = getDocument().copy()
                  clickToolbarButton({ action: "undo" }, () => {
                    assert.ok(getDocument().isEqualTo(second))
                    clickToolbarButton({ action: "undo" }, () => {
                      assert.ok(getDocument().isEqualTo(first))
                      clickToolbarButton({ action: "redo" }, () => {
                        assert.ok(getDocument().isEqualTo(second))
                        clickToolbarButton({ action: "redo" }, () => {
                          assert.ok(getDocument().isEqualTo(third))
                          done()
                        })
                      })
                    })
                  })
                })
              )
            )
          })
        )
      )
    }))

  test("block formatting are undoable", (done) => {
    typeCharacters("abc", () => {
      const first = getDocument().copy()
      clickToolbarButton({ attribute: "heading1" }, () => {
        const second = getDocument().copy()
        clickToolbarButton({ action: "undo" }, () => {
          assert.ok(getDocument().isEqualTo(first))
          clickToolbarButton({ action: "redo" }, () => {
            assert.ok(getDocument().isEqualTo(second))
            done()
          })
        })
      })
    })
  })
})
