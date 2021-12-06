/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Text from "trix/models/text";
import Block from "trix/models/block";
import Document from "trix/models/document";

import { assert, clickToolbarButton, defer, expandSelection, isToolbarButtonActive, isToolbarButtonDisabled, moveCursor, pressKey, replaceDocument, selectAll, test, testGroup, typeCharacters } from "test/test_helper";

testGroup("Block formatting", {template: "editor_empty"}, function() {
  test("applying block attributes", done => typeCharacters("abc", () => clickToolbarButton({attribute: "quote"}, function() {
    assert.blockAttributes([0, 4], ["quote"]);
    assert.ok(isToolbarButtonActive({attribute: "quote"}));
    return clickToolbarButton({attribute: "code"}, function() {
      assert.blockAttributes([0, 4], ["quote", "code"]);
      assert.ok(isToolbarButtonActive({attribute: "code"}));
      return clickToolbarButton({attribute: "code"}, function() {
        assert.blockAttributes([0, 4], ["quote"]);
        assert.notOk(isToolbarButtonActive({attribute: "code"}));
        assert.ok(isToolbarButtonActive({attribute: "quote"}));
        return done();
      });
    });
  })));

  test("applying block attributes to text after newline", done => typeCharacters("a\nbc", () => clickToolbarButton({attribute: "quote"}, function() {
    assert.blockAttributes([0, 2], []);
    assert.blockAttributes([2, 4], ["quote"]);
    return done();
  })));

  test("applying block attributes to text between newlines", done => typeCharacters(`\
ab
def
ghi
j\
`, () => moveCursor({direction: "left", times: 2}, () => expandSelection({direction: "left", times: 5}, () => clickToolbarButton({attribute: "quote"}, function() {
    assert.blockAttributes([0, 3], []);
    assert.blockAttributes([3, 11], ["quote"]);
    assert.blockAttributes([11, 13], []);
    return done();
  })))));

  test("applying bullets to text with newlines", done => typeCharacters(`\
abc
def
ghi
jkl
mno\
`, () => moveCursor({direction: "left", times: 2}, () => expandSelection({direction: "left", times: 15}, () => clickToolbarButton({attribute: "bullet"}, function() {
    assert.blockAttributes([0, 4], ["bulletList", "bullet"]);
    assert.blockAttributes([4, 8], ["bulletList", "bullet"]);
    assert.blockAttributes([8, 12], ["bulletList", "bullet"]);
    assert.blockAttributes([12, 16], ["bulletList", "bullet"]);
    assert.blockAttributes([16, 20], ["bulletList", "bullet"]);
    return done();
  })))));

  test("applying block attributes to adjacent unformatted blocks consolidates them", function(done) {
    const document = new Document([
        new Block(Text.textForStringWithAttributes("1"), ["bulletList", "bullet"]),
        new Block(Text.textForStringWithAttributes("a"), []),
        new Block(Text.textForStringWithAttributes("b"), []),
        new Block(Text.textForStringWithAttributes("c"), []),
        new Block(Text.textForStringWithAttributes("2"), ["bulletList", "bullet"]),
        new Block(Text.textForStringWithAttributes("3"), ["bulletList", "bullet"])
      ]);

    replaceDocument(document);
    getEditorController().setLocationRange([{index: 0, offset: 0}, {index: 5, offset: 1}]);
    return defer(() => clickToolbarButton({attribute: "quote"}, function() {
      assert.blockAttributes([0, 2], ["bulletList", "bullet", "quote"]);
      assert.blockAttributes([2, 8], ["quote"]);
      assert.blockAttributes([8, 10], ["bulletList", "bullet", "quote"]);
      assert.blockAttributes([10, 12], ["bulletList", "bullet", "quote"]);
      return done();
    }));
  });

  test("breaking out of the end of a block", done => typeCharacters("abc", () => clickToolbarButton({attribute: "quote"}, () => typeCharacters("\n\n", function() {
    const document = getDocument();
    assert.equal(document.getBlockCount(), 2);

    let block = document.getBlockAtIndex(0);
    assert.deepEqual(block.getAttributes(), ["quote"]);
    assert.equal(block.toString(), "abc\n");

    block = document.getBlockAtIndex(1);
    assert.deepEqual(block.getAttributes(), []);
    assert.equal(block.toString(), "\n");

    assert.locationRange({index: 1, offset: 0});
    return done();
  }))));


  test("breaking out of the middle of a block before character", done => // * = cursor
  //
  // ab
  // *c
  //
  typeCharacters(
    "abc",
    () => clickToolbarButton({attribute: "quote"}, () => moveCursor("left", () => typeCharacters("\n\n", function() {
      const document = getDocument();
      assert.equal(document.getBlockCount(), 3);

      let block = document.getBlockAtIndex(0);
      assert.deepEqual(block.getAttributes(), ["quote"]);
      assert.equal(block.toString(), "ab\n");

      block = document.getBlockAtIndex(1);
      assert.deepEqual(block.getAttributes(), []);
      assert.equal(block.toString(), "\n");

      block = document.getBlockAtIndex(2);
      assert.deepEqual(block.getAttributes(), ["quote"]);
      assert.equal(block.toString(), "c\n");

      assert.locationRange({index: 2, offset: 0});
      return done();
    })))
  ));

  test("breaking out of the middle of a block before newline", done => // * = cursor
  //
  // ab
  // *
  // c
  //
  typeCharacters(
    "abc",
    () => clickToolbarButton({attribute: "quote"}, () => moveCursor("left", () => typeCharacters("\n", () => moveCursor("left", () => typeCharacters("\n\n", function() {
      const document = getDocument();
      assert.equal(document.getBlockCount(), 3);

      let block = document.getBlockAtIndex(0);
      assert.deepEqual(block.getAttributes(), ["quote"]);
      assert.equal(block.toString(), "ab\n");

      block = document.getBlockAtIndex(1);
      assert.deepEqual(block.getAttributes(), []);
      assert.equal(block.toString(), "\n");

      block = document.getBlockAtIndex(2);
      assert.deepEqual(block.getAttributes(), ["quote"]);
      assert.equal(block.toString(), "c\n");

      return done();
    })))))
  ));

  test("breaking out of a formatted block with adjacent non-formatted blocks", function(expectDocument) {
    // * = cursor
    //
    // a
    // b*
    // c
    let document = new Document([
        new Block(Text.textForStringWithAttributes("a"), []),
        new Block(Text.textForStringWithAttributes("b"), ["quote"]),
        new Block(Text.textForStringWithAttributes("c"), [])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(3);

    return typeCharacters("\n\n", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 4);
      assert.blockAttributes([0, 1], []);
      assert.blockAttributes([2, 3], ["quote"]);
      assert.blockAttributes([4, 5], []);
      assert.blockAttributes([5, 6], []);
      return expectDocument("a\nb\n\nc\n");
    });
  });

  test("breaking out a block after newline at offset 0", done => // * = cursor
  //
  //
  // *a
  //
  typeCharacters(
    "a",
    () => clickToolbarButton({attribute: "quote"}, () => moveCursor("left", () => typeCharacters("\n\n", function() {
      const document = getDocument();
      assert.equal(document.getBlockCount(), 2);

      let block = document.getBlockAtIndex(0);
      assert.deepEqual(block.getAttributes(), []);
      assert.equal(block.toString(), "\n");

      block = document.getBlockAtIndex(1);
      assert.deepEqual(block.getAttributes(), ["quote"]);
      assert.equal(block.toString(), "a\n");
      assert.locationRange({index: 1, offset: 0});

      return done();
    })))
  ));

  test("deleting the only non-block-break character in a block", done => typeCharacters("ab", () => clickToolbarButton({attribute: "quote"}, () => typeCharacters("\b\b", function() {
    assert.blockAttributes([0, 1], ["quote"]);
    return done();
  }))));

  test("backspacing a quote", done => clickToolbarButton({attribute: "quote"}, function() {
    assert.blockAttributes([0, 1], ["quote"]);
    return pressKey("backspace", function() {
      assert.blockAttributes([0, 1], []);
      return done();
    });
  }));

  test("backspacing a nested quote", done => clickToolbarButton({attribute: "quote"}, () => clickToolbarButton({action: "increaseNestingLevel"}, function() {
    assert.blockAttributes([0, 1], ["quote", "quote"]);
    return pressKey("backspace", function() {
      assert.blockAttributes([0, 1], ["quote"]);
      return pressKey("backspace", function() {
        assert.blockAttributes([0, 1], []);
        return done();
      });
    });
  })));

  test("backspacing a list item", done => clickToolbarButton({attribute: "bullet"}, function() {
    assert.blockAttributes([0, 1], ["bulletList", "bullet"]);
    return pressKey("backspace", function() {
      assert.blockAttributes([0, 0], []);
      return done();
    });
  }));

  test("backspacing a nested list item", expectDocument => clickToolbarButton({attribute: "bullet"}, () => typeCharacters("a\n", () => clickToolbarButton({action: "increaseNestingLevel"}, function() {
    assert.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"]);
    return pressKey("backspace", function() {
      assert.blockAttributes([2, 3], ["bulletList", "bullet"]);
      return expectDocument("a\n\n");
    });
  }))));

  test("backspacing a list item inside a quote", done => clickToolbarButton({attribute: "quote"}, () => clickToolbarButton({attribute: "bullet"}, function() {
    assert.blockAttributes([0, 1], ["quote", "bulletList", "bullet"]);
    return pressKey("backspace", function() {
      assert.blockAttributes([0, 1], ["quote"]);
      return pressKey("backspace", function() {
        assert.blockAttributes([0, 1], []);
        return done();
      });
    });
  })));

  test("backspacing selected nested list items", expectDocument => clickToolbarButton({attribute: "bullet"}, () => typeCharacters("a\n", () => clickToolbarButton({action: "increaseNestingLevel"}, () => typeCharacters("b", function() {
    getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}]);
    return pressKey("backspace", function() {
      assert.blockAttributes([0, 1], ["bulletList", "bullet"]);
      return expectDocument("\n");
    });
  })))));

  test("backspace selection spanning formatted blocks", expectDocument => clickToolbarButton({attribute: "quote"}, () => typeCharacters("ab\n\n", () => clickToolbarButton({attribute: "code"}, () => typeCharacters("cd", function() {
    getSelectionManager().setLocationRange([{index: 0, offset: 1}, {index: 1, offset: 1}]);
    getComposition().deleteInDirection("backward");
    assert.blockAttributes([0, 2], ["quote"]);
    return expectDocument("ad\n");
  })))));

  test("backspace selection spanning and entire formatted block and a formatted block", expectDocument => clickToolbarButton({attribute: "quote"}, () => typeCharacters("ab\n\n", () => clickToolbarButton({attribute: "code"}, () => typeCharacters("cd", function() {
    getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}]);
    getComposition().deleteInDirection("backward");
    assert.blockAttributes([0, 2], ["code"]);
    return expectDocument("d\n");
  })))));

  test("increasing list level", function(done) {
    assert.ok(isToolbarButtonDisabled({action: "increaseNestingLevel"}));
    assert.ok(isToolbarButtonDisabled({action: "decreaseNestingLevel"}));
    return clickToolbarButton({attribute: "bullet"}, function() {
      assert.ok(isToolbarButtonDisabled({action: "increaseNestingLevel"}));
      assert.notOk(isToolbarButtonDisabled({action: "decreaseNestingLevel"}));
      return typeCharacters("a\n", function() {
        assert.notOk(isToolbarButtonDisabled({action: "increaseNestingLevel"}));
        assert.notOk(isToolbarButtonDisabled({action: "decreaseNestingLevel"}));
        return clickToolbarButton({action: "increaseNestingLevel"}, () => typeCharacters("b", function() {
          assert.ok(isToolbarButtonDisabled({action: "increaseNestingLevel"}));
          assert.notOk(isToolbarButtonDisabled({action: "decreaseNestingLevel"}));
          assert.blockAttributes([0, 2], ["bulletList", "bullet"]);
          assert.blockAttributes([2, 4], ["bulletList", "bullet", "bulletList", "bullet"]);
          return done();
        }));
      });
    });
  });

  test("changing list type", done => clickToolbarButton({attribute: "bullet"}, function() {
    assert.blockAttributes([0, 1], ["bulletList", "bullet"]);
    return clickToolbarButton({attribute: "number"}, function() {
      assert.blockAttributes([0, 1], ["numberList", "number"]);
      return done();
    });
  }));

  test("adding bullet to heading block", done => clickToolbarButton({attribute: "heading1"}, () => clickToolbarButton({attribute: "bullet"}, function() {
    assert.ok(isToolbarButtonActive({attribute: "heading1"}));
    assert.blockAttributes([1, 2], []);
    return done();
  })));

  test("removing bullet from heading block", done => clickToolbarButton({attribute: "bullet"}, () => clickToolbarButton({attribute: "heading1"}, function() {
    assert.ok(isToolbarButtonDisabled({attribute: "bullet"}));
    return done();
  })));

  test("breaking out of heading in list", expectDocument => clickToolbarButton({attribute: "bullet"}, () => clickToolbarButton({attribute: "heading1"}, function() {
    assert.ok(isToolbarButtonActive({attribute: "heading1"}));
    return typeCharacters("abc", () => typeCharacters("\n", function() {
      assert.ok(isToolbarButtonActive({attribute: "bullet"}));
      const document = getDocument();
      assert.equal(document.getBlockCount(), 2);
      assert.blockAttributes([0, 4], ["bulletList", "bullet", "heading1"]);
      assert.blockAttributes([4, 5], ["bulletList", "bullet"]);
      return expectDocument("abc\n\n");
    }));
  })));

  test("breaking out of middle of heading block", expectDocument => clickToolbarButton({attribute: "heading1"}, () => typeCharacters("abc", function() {
    assert.ok(isToolbarButtonActive({attribute: "heading1"}));
    return moveCursor({direction: "left", times: 1}, () => typeCharacters("\n", function() {
      const document = getDocument();
      assert.equal(document.getBlockCount(), 2);
      assert.blockAttributes([0, 3], ["heading1"]);
      assert.blockAttributes([3, 4], ["heading1"]);
      return expectDocument("ab\nc\n");
    }));
  })));

  test("breaking out of middle of heading block with preceding blocks", function(expectDocument) {
    let document = new Document([
        new Block(Text.textForStringWithAttributes("a"), ["heading1"]),
        new Block(Text.textForStringWithAttributes("b"), []),
        new Block(Text.textForStringWithAttributes("cd"), ["heading1"])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(5);
    assert.ok(isToolbarButtonActive({attribute: "heading1"}));

    return typeCharacters("\n", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 4);
      assert.blockAttributes([0, 1], ["heading1"]);
      assert.blockAttributes([2, 3], []);
      assert.blockAttributes([4, 5], ["heading1"]);
      assert.blockAttributes([6, 7], ["heading1"]);
      return expectDocument("a\nb\nc\nd\n");
    });
  });

  test("breaking out of end of heading block with preceding blocks", function(expectDocument) {
    let document = new Document([
        new Block(Text.textForStringWithAttributes("a"), ["heading1"]),
        new Block(Text.textForStringWithAttributes("b"), []),
        new Block(Text.textForStringWithAttributes("cd"), ["heading1"])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(6);
    assert.ok(isToolbarButtonActive({attribute: "heading1"}));

    return typeCharacters("\n", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 4);
      assert.blockAttributes([0, 1], ["heading1"]);
      assert.blockAttributes([2, 3], []);
      assert.blockAttributes([4, 6], ["heading1"]);
      assert.blockAttributes([7, 8], []);
      return expectDocument("a\nb\ncd\n\n");
    });
  });

  test("inserting newline before heading", function(done) {
    let document = new Document([
        new Block(Text.textForStringWithAttributes("\n"), []),
        new Block(Text.textForStringWithAttributes("abc"), ["heading1"])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(0);

    return typeCharacters("\n", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 2);

      let block = document.getBlockAtIndex(0);
      assert.deepEqual(block.getAttributes(), []);
      assert.equal(block.toString(), "\n\n\n");

      block = document.getBlockAtIndex(1);
      assert.deepEqual(block.getAttributes(), ["heading1"]);
      assert.equal(block.toString(), "abc\n");

      return done();
    });
  });

  test("inserting multiple newlines before heading", function(done) {
    let document = new Document([
        new Block(Text.textForStringWithAttributes("\n"), []),
        new Block(Text.textForStringWithAttributes("abc"), ["heading1"])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(0);

    return typeCharacters("\n\n", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 2);

      let block = document.getBlockAtIndex(0);
      assert.deepEqual(block.getAttributes(), []);
      assert.equal(block.toString(), "\n\n\n\n");

      block = document.getBlockAtIndex(1);
      assert.deepEqual(block.getAttributes(), ["heading1"]);
      assert.equal(block.toString(), "abc\n");
      return done();
    });
  });

  test("inserting multiple newlines before formatted block", function(expectDocument) {
    let document = new Document([
        new Block(Text.textForStringWithAttributes("\n"), []),
        new Block(Text.textForStringWithAttributes("abc"), ["quote"])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(1);

    return typeCharacters("\n\n", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 2);
      assert.blockAttributes([0, 1], []);
      assert.blockAttributes([2, 3], []);
      assert.blockAttributes([4, 6], ["quote"]);
      assert.locationRange({index: 0, offset: 3});
      return expectDocument("\n\n\n\nabc\n");
    });
  });

  test("inserting newline after heading with text in following block", function(expectDocument) {
    let document = new Document([
        new Block(Text.textForStringWithAttributes("ab"), ["heading1"]),
        new Block(Text.textForStringWithAttributes("cd"), [])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(2);

    return typeCharacters("\n", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 3);
      assert.blockAttributes([0, 2], ["heading1"]);
      assert.blockAttributes([3, 4], []);
      assert.blockAttributes([5, 6], []);
      return expectDocument("ab\n\ncd\n");
    });
  });

  test("backspacing a newline in an empty block with adjacent formatted blocks", function(expectDocument) {
    let document = new Document([
        new Block(Text.textForStringWithAttributes("abc"), ["heading1"]),
        new Block,
        new Block(Text.textForStringWithAttributes("d"), ["heading1"])
      ]);

    replaceDocument(document);
    getEditor().setSelectedRange(4);

    return pressKey("backspace", function() {
      document = getDocument();
      assert.equal(document.getBlockCount(), 2);
      assert.blockAttributes([0, 1], ["heading1"]);
      assert.blockAttributes([2, 3], ["heading1"]);
      return expectDocument("abc\nd\n");
    });
  });

  test("backspacing a newline at beginning of non-formatted block", function(expectDocument) {
     let document = new Document([
         new Block(Text.textForStringWithAttributes("ab"), ["heading1"]),
         new Block(Text.textForStringWithAttributes("\ncd"), [])
       ]);

     replaceDocument(document);
     getEditor().setSelectedRange(3);

     return pressKey("backspace", function() {
       document = getDocument();
       assert.equal(document.getBlockCount(), 2);
       assert.blockAttributes([0, 2], ["heading1"]);
       assert.blockAttributes([3, 5], []);
       return expectDocument("ab\ncd\n");
     });
  });

  test("inserting newline after single character header", expectDocument => clickToolbarButton({attribute: "heading1"}, () => typeCharacters("a", () => typeCharacters("\n", function() {
    const document = getDocument();
    assert.equal(document.getBlockCount(), 2);
    assert.blockAttributes([0, 1], ["heading1"]);
    return expectDocument("a\n\n");
  }))));

  test("terminal attributes are only added once", function(expectDocument) {
    replaceDocument(new Document([
        new Block(Text.textForStringWithAttributes("a"), []),
        new Block(Text.textForStringWithAttributes("b"), ["heading1"]),
        new Block(Text.textForStringWithAttributes("c"), [])
      ]));

    return selectAll(() => clickToolbarButton({attribute: "heading1"}, function() {
      assert.equal(getDocument().getBlockCount(), 3);
      assert.blockAttributes([0, 1], ["heading1"]);
      assert.blockAttributes([2, 3], ["heading1"]);
      assert.blockAttributes([4, 5], ["heading1"]);
      return expectDocument("a\nb\nc\n");
    }));
  });

  test("terminal attributes replace existing terminal attributes", function(expectDocument) {
    replaceDocument(new Document([
        new Block(Text.textForStringWithAttributes("a"), []),
        new Block(Text.textForStringWithAttributes("b"), ["heading1"]),
        new Block(Text.textForStringWithAttributes("c"), [])
      ]));

    return selectAll(() => clickToolbarButton({attribute: "code"}, function() {
      assert.equal(getDocument().getBlockCount(), 3);
      assert.blockAttributes([0, 1], ["code"]);
      assert.blockAttributes([2, 3], ["code"]);
      assert.blockAttributes([4, 5], ["code"]);
      return expectDocument("a\nb\nc\n");
    }));
  });

  test("code blocks preserve newlines", expectDocument => typeCharacters("a\nb", () => selectAll(() => clickToolbarButton({attribute: "code"}, function() {
    assert.equal(getDocument().getBlockCount(), 1);
    assert.blockAttributes([0, 3], ["code"]);
    return expectDocument("a\nb\n");
  }))));

  test("code blocks are not indentable", done => clickToolbarButton({attribute: "code"}, function() {
    assert.notOk(isToolbarButtonActive({action: "increaseNestingLevel"}));
    return done();
  }));

  test("code blocks are terminal", done => clickToolbarButton({attribute: "code"}, function() {
    assert.ok(isToolbarButtonDisabled({attribute: "quote"}));
    assert.ok(isToolbarButtonDisabled({attribute: "heading1"}));
    assert.ok(isToolbarButtonDisabled({attribute: "bullet"}));
    assert.ok(isToolbarButtonDisabled({attribute: "number"}));
    assert.notOk(isToolbarButtonDisabled({attribute: "code"}));
    assert.notOk(isToolbarButtonDisabled({attribute: "bold"}));
    assert.notOk(isToolbarButtonDisabled({attribute: "italic"}));
    return done();
  }));

  test("unindenting a code block inside a bullet", expectDocument => clickToolbarButton({attribute: "bullet"}, () => clickToolbarButton({attribute: "code"}, () => typeCharacters("a", () => clickToolbarButton({action: "decreaseNestingLevel"}, function() {
    const document = getDocument();
    assert.equal(document.getBlockCount(), 1);
    assert.blockAttributes([0, 1], ["code"]);
    return expectDocument("a\n");
  })))));

  test("indenting a heading inside a bullet", expectDocument => clickToolbarButton({attribute: "bullet"}, () => typeCharacters("a", () => typeCharacters("\n", () => clickToolbarButton({attribute: "heading1"}, () => typeCharacters("b", () => clickToolbarButton({action: "increaseNestingLevel"}, function() {
    const document = getDocument();
    assert.equal(document.getBlockCount(), 2);
    assert.blockAttributes([0, 1], ["bulletList", "bullet"]);
    assert.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet", "heading1"]);
    return expectDocument("a\nb\n");
  })))))));

  test("indenting a quote inside a bullet", expectDocument => clickToolbarButton({attribute: "bullet"}, () => clickToolbarButton({attribute: "quote"}, () => clickToolbarButton({action: "increaseNestingLevel"}, function() {
    const document = getDocument();
    assert.equal(document.getBlockCount(), 1);
    assert.blockAttributes([0, 1], ["bulletList", "bullet", "quote", "quote"]);
    return expectDocument("\n");
  }))));

  return test("list indentation constraints consider the list type", expectDocument => clickToolbarButton({attribute: "bullet"}, () => typeCharacters("a\n\n", () => clickToolbarButton({attribute: "number"}, () => clickToolbarButton({action: "increaseNestingLevel"}, function() {
    const document = getDocument();
    assert.equal(document.getBlockCount(), 2);
    assert.blockAttributes([0, 1], ["bulletList", "bullet"]);
    assert.blockAttributes([2, 3], ["numberList", "number"]);
    return expectDocument("a\n\n");
  })))));
});
