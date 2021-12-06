/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { after, assert, test, testGroup, TEST_IMAGE_URL } from "test/test_helper";
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants";

testGroup("HTML loading", function() {
  testGroup("inline elements", {template: "editor_with_styled_content"}, function() {
    const cases = {
      "BR before block element styled otherwise": {
        html: `a<br><figure class="attachment"><img src="${TEST_IMAGE_URL}"></figure>`,
        expectedDocument: `a\n${OBJECT_REPLACEMENT_CHARACTER}\n`
      },

      "BR in text before block element styled otherwise": {
        html: `<div>a<br>b<figure class="attachment"><img src="${TEST_IMAGE_URL}"></figure></div>`,
        expectedDocument: `a\nb${OBJECT_REPLACEMENT_CHARACTER}\n`
      }
    };

    return (() => {
      const result = [];
      for (let name in cases) {
        const details = cases[name];
        result.push((((name, details) => test(name, function(expectDocument) {
          getEditor().loadHTML(details.html);
          return expectDocument(details.expectedDocument);
        })))(name, details));
      }
      return result;
    })();
  });

  testGroup("bold elements", {template: "editor_with_bold_styles"}, function() {
    test("<strong> with font-weight: 500", function(expectDocument) {
      getEditor().loadHTML("<strong>a</strong>");
      assert.textAttributes([0, 1], {bold: true});
      return expectDocument("a\n");
    });

    test("<span> with font-weight: 600", function(expectDocument) {
      getEditor().loadHTML("<span>a</span>");
      assert.textAttributes([0, 1], {bold: true});
      return expectDocument("a\n");
    });

    return test("<article> with font-weight: bold", function(expectDocument) {
      getEditor().loadHTML("<article>a</article>");
      assert.textAttributes([0, 1], {bold: true});
      return expectDocument("a\n");
    });
  });

  testGroup("styled block elements", {template: "editor_with_block_styles"}, function() {
    test("<em> in <blockquote> with font-style: italic", function(expectDocument) {
      getEditor().loadHTML("<blockquote>a<em>b</em></blockquote>");
      assert.textAttributes([0, 1], {});
      assert.textAttributes([1, 2], {italic: true});
      assert.blockAttributes([0, 2], ["quote"]);
      return expectDocument("ab\n");
    });

    test("<strong> in <li> with font-weight: bold", function(expectDocument) {
      getEditor().loadHTML("<ul><li>a<strong>b</strong></li></ul>");
      assert.textAttributes([0, 1], {});
      assert.textAttributes([1, 2], {bold: true});
      assert.blockAttributes([0, 2], ["bulletList","bullet"]);
      return expectDocument("ab\n");
    });

    return test("newline in <li> with font-weight: bold", function(expectDocument) {
      getEditor().loadHTML("<ul><li>a<br>b</li></ul>");
      assert.textAttributes([0, 2], {});
      assert.blockAttributes([0, 2], ["bulletList","bullet"]);
      return expectDocument("a\nb\n");
    });
  });

  testGroup("in a table", {template: "editor_in_table"}, () => test("block elements", function(expectDocument) {
    getEditor().loadHTML("<h1>a</h1><blockquote>b</blockquote>");
    assert.blockAttributes([0, 2], ["heading1"]);
    assert.blockAttributes([2, 4], ["quote"]);
    return expectDocument("a\nb\n");
  }));

  testGroup("images", {template: "editor_empty"}, function() {
    test("without dimensions", function(expectDocument) {
      getEditor().loadHTML(`<img src="${TEST_IMAGE_URL}">`);
      return after(20, function() {
        const attachment = getDocument().getAttachments()[0];
        const image = getEditorElement().querySelector("img");
        assert.equal(attachment.getWidth(), 1);
        assert.equal(attachment.getHeight(), 1);
        assert.equal(image.getAttribute("width"), "1");
        assert.equal(image.getAttribute("height"), "1");
        return expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`);
      });
    });

    return test("with dimensions", function(expectDocument) {
      getEditor().loadHTML(`<img src="${TEST_IMAGE_URL}" width="10" height="20">`);
      return after(20, function() {
        const attachment = getDocument().getAttachments()[0];
        const image = getEditorElement().querySelector("img");
        assert.equal(attachment.getWidth(), 10);
        assert.equal(attachment.getHeight(), 20);
        assert.equal(image.getAttribute("width"),  "10");
        assert.equal(image.getAttribute("height"), "20");
        return expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`);
      });
    });
  });

  return testGroup("text after closing tag", {template: "editor_empty"}, () => test("parses text as separate block", function(expectDocument) {
    getEditor().loadHTML("<h1>a</h1>b");
    assert.blockAttributes([0, 2], ["heading1"]);
    assert.blockAttributes([2, 4], []);
    return expectDocument("a\nb\n");
  }));
});
