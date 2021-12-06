/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { assert, test, testGroup } from "test/test_helper";

testGroup("HTML Reparsing", {template: "editor_empty"}, function() {
  test("mutation resulting in identical blocks", function(expectDocument) {
    const element = getEditorElement();
    element.editor.loadHTML("<ul><li>a</li><li>b</li></ul>");
    return requestAnimationFrame(function() {
      element.querySelector("li").textContent = "b";
      return requestAnimationFrame(function() {
        assert.blockAttributes([0, 1], ["bulletList", "bullet"]);
        assert.blockAttributes([2, 3], ["bulletList", "bullet"]);
        assert.equal(element.value, "<ul><li>b</li><li>b</li></ul>");
        return expectDocument("b\nb\n");
      });
    });
  });

  return test("mutation resulting in identical pieces", function(expectDocument) {
    const element = getEditorElement();
    element.editor.loadHTML("<div><strong>a</strong> <strong>b</strong></div>");
    return requestAnimationFrame(function() {
      element.querySelector("strong").textContent = "b";
      return requestAnimationFrame(function() {
        assert.textAttributes([0, 1], {bold: true});
        assert.textAttributes([2, 3], {bold: true});
        assert.equal(element.value, "<div><strong>b</strong> <strong>b</strong></div>");
        return expectDocument("b b\n");
      });
    });
  });
});
