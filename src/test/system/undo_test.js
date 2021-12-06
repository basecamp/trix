/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { assert, clickToolbarButton, expandSelection, moveCursor, test, testGroup, typeCharacters } from "test/test_helper";

testGroup("Undo/Redo", {template: "editor_empty"}, function() {
  test("typing and undoing", function(done) {
    const first = getDocument().copy();
    return typeCharacters("abc", function() {
      assert.notOk(getDocument().isEqualTo(first));
      return clickToolbarButton({action: "undo"}, function() {
        assert.ok(getDocument().isEqualTo(first));
        return done();
      });
    });
  });

  test("typing, formatting, typing, and undoing", function(done) {
    const first = getDocument().copy();
    return typeCharacters("abc", function() {
      const second = getDocument().copy();
      return clickToolbarButton({attribute: "bold"}, () => typeCharacters("def", function() {
        const third = getDocument().copy();
        return clickToolbarButton({action: "undo"}, function() {
          assert.ok(getDocument().isEqualTo(second));
          return clickToolbarButton({action: "undo"}, function() {
            assert.ok(getDocument().isEqualTo(first));
            return clickToolbarButton({action: "redo"}, function() {
              assert.ok(getDocument().isEqualTo(second));
              return clickToolbarButton({action: "redo"}, function() {
                assert.ok(getDocument().isEqualTo(third));
                return done();
              });
            });
          });
        });
      }));
    });
  });

  test("formatting changes are batched by location range", done => typeCharacters("abc", function() {
    const first = getDocument().copy();
    return expandSelection("left", () => clickToolbarButton({attribute: "bold"}, () => clickToolbarButton({attribute: "italic"}, function() {
      const second = getDocument().copy();
      return moveCursor("left", () => expandSelection("left", () => clickToolbarButton({attribute: "italic"}, function() {
        const third = getDocument().copy();
        return clickToolbarButton({action: "undo"}, function() {
          assert.ok(getDocument().isEqualTo(second));
          return clickToolbarButton({action: "undo"}, function() {
            assert.ok(getDocument().isEqualTo(first));
            return clickToolbarButton({action: "redo"}, function() {
              assert.ok(getDocument().isEqualTo(second));
              return clickToolbarButton({action: "redo"}, function() {
                assert.ok(getDocument().isEqualTo(third));
                return done();
              });
            });
          });
        });
      })));
    })));
  }));

  return test("block formatting are undoable", done => typeCharacters("abc", function() {
    const first = getDocument().copy();
    return clickToolbarButton({attribute: "heading1"}, function() {
      const second = getDocument().copy();
      return clickToolbarButton({action: "undo"}, function() {
        assert.ok(getDocument().isEqualTo(first));
        return clickToolbarButton({action: "redo"}, function() {
          assert.ok(getDocument().isEqualTo(second));
          return done();
        });
      });
    });
  }));
});
