/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import MutationObserver from "trix/observers/mutation_observer";

import { assert, defer, test, testGroup } from "test/test_helper";

let observer = null;
let element = null;
let summaries = [];

const install = function(html) {
  element = document.createElement("div");
  if (html) { element.innerHTML = html; }
  observer = new MutationObserver(element);
  return observer.delegate = {
    elementDidMutate(summary) {
      return summaries.push(summary);
    }
  };
};

const uninstall = function() {
  observer?.stop();
  observer = null;
  element = null;
  return summaries = [];
};

const observerTest = (name, options = {}, callback) => test(name, function(done) {
  install(options.html);
  return callback(function() {
    uninstall();
    return done();
  });
});


testGroup("MutationObserver", function() {
  observerTest("add character", {html: "a"}, function(done) {
    element.firstChild.data += "b";
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textAdded: "b"});
      return done();
    });
  });

  observerTest("remove character", {html: "ab"}, function(done) {
    element.firstChild.data = "a";
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textDeleted: "b"});
      return done();
    });
  });

  observerTest("replace character", {html: "ab"}, function(done) {
    element.firstChild.data = "ac";
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textAdded: "c", textDeleted: "b"});
      return done();
    });
  });

  observerTest("add <br>", {html: "a"}, function(done) {
    element.appendChild(document.createElement("br"));
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textAdded: "\n"});
      return done();
    });
  });

  observerTest("remove <br>", {html: "a<br>"}, function(done) {
    element.removeChild(element.lastChild);
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textDeleted: "\n"});
      return done();
    });
  });

  observerTest("remove block comment", {html: "<div><!--block-->a</div>"}, function(done) {
    element.firstChild.removeChild(element.firstChild.firstChild);
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textDeleted: "\n"});
      return done();
    });
  });

  observerTest("remove formatted element", {html: "a<strong>b</strong>"}, function(done) {
    element.removeChild(element.lastChild);
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textDeleted: "b"});
      return done();
    });
  });

  return observerTest("remove nested formatted elements", {html: "a<strong>b<em>c</em></strong>"}, function(done) {
    element.removeChild(element.lastChild);
    return defer(function() {
      assert.equal(summaries.length, 1);
      assert.deepEqual(summaries[0], {textDeleted: "bc"});
      return done();
    });
  });
});
