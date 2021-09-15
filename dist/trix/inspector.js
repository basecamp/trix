/*
Trix 2.0.0-alpha
Copyright © 2021 Basecamp, LLC
 */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  /*
  Details Element Polyfill 1.0.0
  Copyright © 2016 Javan Makhmali
   */
  ((function(){})).call(window),function(){var t,e,n,r,o,u,i,a,l;i={element:function(){var t,e,n,r,o;return e=document.createElement("details"),"open"in e?(e.innerHTML="<summary>a</summary>b",e.setAttribute("style","position: absolute; left: -9999px"),r=null!=(o=document.body)?o:document.documentElement,r.appendChild(e),t=e.offsetHeight,e.open=!0,n=e.offsetHeight,r.removeChild(e),t!==n):!1}(),toggleEvent:function(){var t;return t=document.createElement("details"),"ontoggle"in t}()},i.element&&i.toggleEvent||(r=function(){return document.head.insertAdjacentHTML("afterbegin",'<style>@charset"UTF-8";details:not([open])>*:not(summary){display:none;}details>summary{display:block;}details>summary::before{content:"\u25ba";padding-right:0.3rem;font-size:0.6rem;cursor:default;}details[open]>summary::before{content:"\u25bc";}</style>')},n=function(){var t,e,n,r,o;return t=document.createElement("details").constructor.prototype,r=t.setAttribute,n=t.removeAttribute,o=null!=(e=Object.getOwnPropertyDescriptor(t,"open"))?e.set:void 0,Object.defineProperties(t,{open:{set:function(t){return "DETAILS"===this.tagName?(t?this.setAttribute("open",""):this.removeAttribute("open"),t):null!=o?o.call(this,t):void 0}},setAttribute:{value:function(t,e){return l(this,function(n){return function(){return r.call(n,t,e)}}(this))}},removeAttribute:{value:function(t){return l(this,function(e){return function(){return n.call(e,t)}}(this))}}})},o=function(){return e(function(t){return t.hasAttribute("open")?t.removeAttribute("open"):t.setAttribute("open","")})},u=function(){var t;return "undefined"!=typeof MutationObserver&&null!==MutationObserver?(t=new MutationObserver(function(t){var e,n,r,o,u,i;for(u=[],n=0,r=t.length;r>n;n++)o=t[n],i=o.target,e=o.attributeName,"DETAILS"===i.tagName&&"open"===e?u.push(a(i)):u.push(void 0);return u}),t.observe(document.documentElement,{attributes:!0,subtree:!0})):e(function(t){var e;return e=t.getAttribute("open"),setTimeout(function(){return t.getAttribute("open")!==e?a(t):void 0},1)})},t=function(t){return !(t.defaultPrevented||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey||t.target.isContentEditable)},e=function(e){return addEventListener("click",function(n){var r,o,u;return t(n)&&(o=n.target,u=o.tagName,r=o.parentElement,"SUMMARY"===u&&"DETAILS"===(null!=r?r.tagName:void 0))?e(r):void 0},!1)},a=function(t){var e;return e=document.createEvent("Events"),e.initEvent("toggle",!0,!1),t.dispatchEvent(e)},l=function(t,e){var n,r;return n=t.getAttribute("open"),r=e(),t.getAttribute("open")!==n&&a(t),r},i.element||(r(),n(),o()),i.element&&!i.toggleEvent&&u());}.call(window),function(){}.call(window);

  Trix.registerElement("trix-inspector", {
    defaultCSS: `%t {
  display: block;
}

%t {
  position: fixed;
  background: #fff;
  border: 1px solid #444;
  border-radius: 5px;
  padding: 10px;
  font-family: sans-serif;
  font-size: 12px;
  overflow: auto;
  word-wrap: break-word;
}

%t details {
  margin-bottom: 10px;
}

%t summary:focus {
  outline: none;
}

%t details .panel {
  padding: 10px;
}

%t .performance .metrics {
  margin: 0 0 5px 5px;
}

%t .selection .characters {
  margin-top: 10px;
}

%t .selection .character {
  display: inline-block;
  font-size: 8px;
  font-family: courier, monospace;
  line-height: 10px;
  vertical-align: middle;
  text-align: center;
  width: 10px;
  height: 10px;
  margin: 0 1px 1px 0;
  border: 1px solid #333;
  border-radius: 1px;
  background: #676666;
  color: #fff;
}

%t .selection .character.selected {
  background: yellow;
  color: #000;
}`,
    connect: function() {
      var i, len, ref, view;
      this.editorElement = document.querySelector(`trix-editor[trix-id='${this.dataset.trixId}']`);
      this.views = this.createViews();
      ref = this.views;
      for (i = 0, len = ref.length; i < len; i++) {
        view = ref[i];
        view.render();
        this.appendChild(view.element);
      }
      this.reposition();
      this.resizeHandler = this.reposition.bind(this);
      return addEventListener("resize", this.resizeHandler);
    },
    disconnect: function() {
      return removeEventListener("resize", this.resizeHandler);
    },
    createViews: function() {
      var View, views;
      views = (function() {
        var i, len, ref, results;
        ref = Trix.Inspector.views;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          View = ref[i];
          results.push(new View(this.editorElement));
        }
        return results;
      }).call(this);
      return views.sort(function(a, b) {
        return a.title.toLowerCase() > b.title.toLowerCase();
      });
    },
    reposition: function() {
      var right, top;
      ({top, right} = this.editorElement.getBoundingClientRect());
      this.style.top = `${top}px`;
      this.style.left = `${right + 10}px`;
      this.style.maxWidth = `${window.innerWidth - right - 40}px`;
      return this.style.maxHeight = `${window.innerHeight - top - 30}px`;
    }
  });

  window.Trix.Inspector = {
    views: [],
    registerView: function(constructor) {
      return this.views.push(constructor);
    },
    install: function(editorElement) {
      var element;
      this.editorElement = editorElement;
      element = document.createElement("trix-inspector");
      element.dataset.trixId = this.editorElement.trixId;
      return document.body.appendChild(element);
    }
  };

  window.JST || (window.JST = {});

  window.JST["trix/inspector/templates/debug"] = function() {
    return `<p>
  <label>
    <input type="checkbox" name="viewCaching" checked="${this.compositionController.isViewCachingEnabled()}">
    Cache views between renders
  </label>
</p>

<p>
  <button data-action="render">Force Render</button> <button data-action="parse">Parse current HTML</button>
</p>

<p>
  <label>
    <input type="checkbox" name="controlElement">
    Show <code>contenteditable</code> control element
  </label>
</p>`;
  };

  var pieces;

  window.JST || (window.JST = {});

  window.JST["trix/inspector/templates/document"] = function() {
    var details;
    details = this.document.getBlocks().map((block, index) => {
      var text;
      ({text} = block);
      return `<details class="block">
  <summary class="title">
    Block ${block.id}, Index: ${index}
  </summary>
  <div class="attributes">
    Attributes: ${JSON.stringify(block.attributes)}
  </div>

  <div class="text">
    <div class="title">
      Text: ${text.id}, Pieces: ${pieces.length}, Length: ${text.getLength()}
    </div>
    <div class="pieces">
      ${pieces(text.pieceList.toArray()).join("\n")}
    </div>
  </div>
</details>`;
    });
    return details.join("\n");
  };

  pieces = function() {
    var i, index, len, piece, results;
    results = [];
    for (index = i = 0, len = pieces.length; i < len; index = ++i) {
      piece = pieces[index];
      results.push(`<div class="piece">
  <div class="title">
    Piece ${piece.id}, Index: ${index}
  </div>
  <div class="attributes">
    Attributes: ${JSON.stringify(piece.attributes)}
  </div>
  <div class="content">
    ${JSON.stringify(piece.toString())}
  </div>
</div>`);
    }
    return results;
  };

  var dataMetrics;

  window.JST || (window.JST = {});

  window.JST["trix/inspector/templates/performance"] = function() {
    var data, metrics, name;
    metrics = (function() {
      var ref, results;
      ref = this.data;
      results = [];
      for (name in ref) {
        data = ref[name];
        results.push(dataMetrics(name, data, this.round));
      }
      return results;
    }).call(this);
    return metrics.join("\n");
  };

  dataMetrics = function(name, data, round) {
    var item;
    item = `<strong>${name}</strong> (${data.calls})<br>`;
    if (data.calls > 0) {
      item += `<div class="metrics">
  Mean: ${round(data.mean)}ms<br>
  Max: ${round(data.max)}ms<br>
  Last: ${round(data.last)}ms
</div>`;
      return item;
    }
  };

  window.JST || (window.JST = {});

  window.JST["trix/inspector/templates/render"] = function() {
    return `Syncs: ${this.syncCount}`;
  };

  var charSpans;

  window.JST || (window.JST = {});

  window.JST["trix/inspector/templates/selection"] = function() {
    return `Location range: [${this.locationRange[0].index}:${this.locationRange[0].offset}, ${this.locationRange[1].index}:${this.locationRange[1].offset}]

${charSpans(this.characters).join("\n")}`;
  };

  charSpans = function(characters) {
    var char, i, len, results;
    results = [];
    for (i = 0, len = characters.length; i < len; i++) {
      char = characters[i];
      results.push(`<span class=\"character ${char.selected ? "selected" : void 0}\">${char.string}</span>`);
    }
    return results;
  };

  var entryList;

  window.JST || (window.JST = {});

  window.JST["trix/inspector/templates/undo"] = function() {
    return `<h4>Undo stack</h4>
<ol class="undo-entries">
   ${entryList(this.undoEntries)}
</ol>

<h4>Redo stack</h4>
<ol class="redo-entries">
  ${entryList(this.redoEntries)}
</ol>`;
  };

  entryList = function(entries) {
    var entry, i, len, results;
    results = [];
    for (i = 0, len = entries.length; i < len; i++) {
      entry = entries[i];
      results.push(`<li>${entry.description} ${JSON.stringify({
      selectedRange: entry.snapshot.selectedRange,
      context: entry.context
    })}</li>`);
    }
    return results;
  };

  Trix.Inspector.ControlElement = (function() {
    var compositionEvents, inspectNode, keyEvents, observerOptions;

    class ControlElement {
      constructor(editorElement) {
        this.didMutate = this.didMutate.bind(this);
        this.editorElement = editorElement;
        this.install();
      }

      install() {
        this.createElement();
        this.logInputEvents();
        return this.logMutations();
      }

      uninstall() {
        this.observer.disconnect();
        return this.element.parentNode.removeChild(this.element);
      }

      createElement() {
        this.element = document.createElement("div");
        this.element.setAttribute("contenteditable", "");
        this.element.style.width = getComputedStyle(this.editorElement).width;
        this.element.style.minHeight = "50px";
        this.element.style.border = "1px solid green";
        return this.editorElement.parentNode.insertBefore(this.element, this.editorElement.nextSibling);
      }

      logInputEvents() {
        var eventName, i, j, len, len1, results;
        for (i = 0, len = keyEvents.length; i < len; i++) {
          eventName = keyEvents[i];
          this.element.addEventListener(eventName, function(event) {
            return console.log(`${event.type}: keyCode = ${event.keyCode}`);
          });
        }
        results = [];
        for (j = 0, len1 = compositionEvents.length; j < len1; j++) {
          eventName = compositionEvents[j];
          results.push(this.element.addEventListener(eventName, function(event) {
            return console.log(`${event.type}: data = ${JSON.stringify(event.data)}`);
          }));
        }
        return results;
      }

      logMutations() {
        this.observer = new window.MutationObserver(this.didMutate);
        return this.observer.observe(this.element, observerOptions);
      }

      didMutate(mutations) {
        var i, index, j, len, len1, mutation, node, ref, results;
        console.log(`Mutations (${mutations.length}):`);
        results = [];
        for (index = i = 0, len = mutations.length; i < len; index = ++i) {
          mutation = mutations[index];
          console.log(` ${index + 1}. ${mutation.type}:`);
          switch (mutation.type) {
            case "characterData":
              results.push(console.log(`  oldValue = ${JSON.stringify(mutation.oldValue)}, newValue = ${JSON.stringify(mutation.target.data)}`));
              break;
            case "childList":
              ref = mutation.addedNodes;
              for (j = 0, len1 = ref.length; j < len1; j++) {
                node = ref[j];
                console.log(`  node added ${inspectNode(node)}`);
              }
              results.push((function() {
                var k, len2, ref1, results1;
                ref1 = mutation.removedNodes;
                results1 = [];
                for (k = 0, len2 = ref1.length; k < len2; k++) {
                  node = ref1[k];
                  results1.push(console.log(`  node removed ${inspectNode(node)}`));
                }
                return results1;
              })());
              break;
            default:
              results.push(void 0);
          }
        }
        return results;
      }

    };

    keyEvents = "keydown keypress input".split(" ");

    compositionEvents = "compositionstart compositionupdate compositionend textInput".split(" ");

    observerOptions = {
      attributes: true,
      childList: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true
    };

    inspectNode = function(node) {
      if (node.data != null) {
        return JSON.stringify(node.data);
      } else {
        return JSON.stringify(node.outerHTML);
      }
    };

    return ControlElement;

  }).call(window);

  var handleEvent$1;

  ({handleEvent: handleEvent$1} = Trix);

  Trix.Inspector.View = class View {
    constructor(editorElement) {
      this.editorElement = editorElement;
      ({editorController: this.editorController, editor: this.editor} = this.editorElement);
      ({compositionController: this.compositionController, composition: this.composition} = this.editorController);
      this.element = document.createElement("details");
      if (this.getSetting("open") === "true") {
        this.element.open = true;
      }
      this.element.classList.add(this.template);
      this.titleElement = document.createElement("summary");
      this.element.appendChild(this.titleElement);
      this.panelElement = document.createElement("div");
      this.panelElement.classList.add("panel");
      this.element.appendChild(this.panelElement);
      this.element.addEventListener("toggle", (event) => {
        if (event.target === this.element) {
          return this.didToggle();
        }
      });
      if (this.events) {
        this.installEventHandlers();
      }
    }

    installEventHandlers() {
      var eventName, handler, ref, results;
      ref = this.events;
      results = [];
      for (eventName in ref) {
        handler = ref[eventName];
        results.push(((eventName, handler) => {
          return handleEvent$1(eventName, {
            onElement: this.editorElement,
            withCallback: (event) => {
              return requestAnimationFrame(() => {
                return handler.call(this, event);
              });
            }
          });
        })(eventName, handler));
      }
      return results;
    }

    didToggle(event) {
      this.saveSetting("open", this.isOpen());
      return this.render();
    }

    isOpen() {
      return this.element.hasAttribute("open");
    }

    getTitle() {
      var ref;
      return (ref = this.title) != null ? ref : "";
    }

    render() {
      this.renderTitle();
      if (this.isOpen()) {
        return this.panelElement.innerHTML = JST[`trix/inspector/templates/${this.template}`].apply(this);
      }
    }

    renderTitle() {
      return this.titleElement.innerHTML = this.getTitle();
    }

    getSetting(key) {
      var ref;
      key = this.getSettingsKey(key);
      return (ref = window.sessionStorage) != null ? ref[key] : void 0;
    }

    saveSetting(key, value) {
      var ref;
      key = this.getSettingsKey(key);
      return (ref = window.sessionStorage) != null ? ref[key] = value : void 0;
    }

    getSettingsKey(key) {
      return `trix/inspector/${this.template}/${key}`;
    }

  };

  var _class, handleEvent,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({handleEvent} = Trix);

  Trix.Inspector.registerView(_class = (function() {
    var _Class;

    _Class = class extends Trix.Inspector.View {
      constructor() {
        super(...arguments);
        this.didToggleViewCaching = this.didToggleViewCaching.bind(this);
        this.didClickRenderButton = this.didClickRenderButton.bind(this);
        this.didClickParseButton = this.didClickParseButton.bind(this);
        this.didToggleControlElement = this.didToggleControlElement.bind(this);
        handleEvent("change", {
          onElement: this.element,
          matchingSelector: "input[name=viewCaching]",
          withCallback: this.didToggleViewCaching
        });
        handleEvent("click", {
          onElement: this.element,
          matchingSelector: "button[data-action=render]",
          withCallback: this.didClickRenderButton
        });
        handleEvent("click", {
          onElement: this.element,
          matchingSelector: "button[data-action=parse]",
          withCallback: this.didClickParseButton
        });
        handleEvent("change", {
          onElement: this.element,
          matchingSelector: "input[name=controlElement]",
          withCallback: this.didToggleControlElement
        });
      }

      didToggleViewCaching({target}) {
        boundMethodCheck(this, _class);
        if (target.checked) {
          return this.compositionController.enableViewCaching();
        } else {
          return this.compositionController.disableViewCaching();
        }
      }

      didClickRenderButton() {
        boundMethodCheck(this, _class);
        return this.editorController.render();
      }

      didClickParseButton() {
        boundMethodCheck(this, _class);
        return this.editorController.reparse();
      }

      didToggleControlElement({target}) {
        var ref;
        boundMethodCheck(this, _class);
        if (target.checked) {
          return this.control = new Trix.Inspector.ControlElement(this.editorElement);
        } else {
          if ((ref = this.control) != null) {
            ref.uninstall();
          }
          return this.control = null;
        }
      }

    };

    _Class.prototype.title = "Debug";

    _Class.prototype.template = "debug";

    return _Class;

  }).call(window));

  Trix.Inspector.registerView((function() {
    var _Class;

    _Class = class extends Trix.Inspector.View {
      render() {
        this.document = this.editor.getDocument();
        return super.render(...arguments);
      }

    };

    _Class.prototype.title = "Document";

    _Class.prototype.template = "document";

    _Class.prototype.events = {
      "trix-change": function() {
        return this.render();
      }
    };

    return _Class;

  }).call(window));

  var splice = [].splice;

  Trix.Inspector.registerView((function() {
    var _Class, now, ref;

    _Class = class extends Trix.Inspector.View {
      constructor() {
        super(...arguments);
        ({documentView: this.documentView} = this.compositionController);
        this.data = {};
        this.track("documentView.render");
        this.track("documentView.sync");
        this.track("documentView.garbageCollectCachedViews");
        this.track("composition.replaceHTML");
        this.render();
      }

      track(methodPath) {
        var i, len, methodName, object, original, propertyName, propertyNames, ref;
        this.data[methodPath] = {
          calls: 0,
          total: 0,
          mean: 0,
          max: 0,
          last: 0
        };
        ref = methodPath.split("."), [...propertyNames] = ref, [methodName] = splice.call(propertyNames, -1);
        object = this;
        for (i = 0, len = propertyNames.length; i < len; i++) {
          propertyName = propertyNames[i];
          object = object[propertyName];
        }
        original = object[methodName];
        return object[methodName] = () => {
          var result, started, timing;
          started = now();
          result = original.apply(object, arguments);
          timing = now() - started;
          this.record(methodPath, timing);
          return result;
        };
      }

      record(methodPath, timing) {
        var data;
        data = this.data[methodPath];
        data.calls += 1;
        data.total += timing;
        data.mean = data.total / data.calls;
        if (timing > data.max) {
          data.max = timing;
        }
        data.last = timing;
        return this.render();
      }

      round(ms) {
        return Math.round(ms * 1000) / 1000;
      }

    };

    _Class.prototype.title = "Performance";

    _Class.prototype.template = "performance";

    now = ((ref = window.performance) != null ? ref.now : void 0) != null ? function() {
      return performance.now();
    } : function() {
      return new Date().getTime();
    };

    return _Class;

  }).call(window));

  Trix.Inspector.registerView((function() {
    var _Class;

    _Class = class extends Trix.Inspector.View {
      constructor() {
        super(...arguments);
        this.renderCount = 0;
        this.syncCount = 0;
      }

      getTitle() {
        return `${this.title} (${this.renderCount})`;
      }

    };

    _Class.prototype.title = "Renders";

    _Class.prototype.template = "render";

    _Class.prototype.events = {
      "trix-render": function() {
        this.renderCount++;
        return this.render();
      },
      "trix-sync": function() {
        this.syncCount++;
        return this.render();
      }
    };

    return _Class;

  }).call(window));

  Trix.Inspector.registerView((function() {
    var _Class;

    _Class = class extends Trix.Inspector.View {
      render() {
        this.document = this.editor.getDocument();
        this.range = this.editor.getSelectedRange();
        this.locationRange = this.composition.getLocationRange();
        this.characters = this.getCharacters();
        return super.render(...arguments);
      }

      getCharacters() {
        var chars, position, rangeIsExpanded, selected, string, utf16string;
        chars = [];
        utf16string = Trix.UTF16String.box(this.document.toString());
        rangeIsExpanded = this.range[0] !== this.range[1];
        position = 0;
        while (position < utf16string.length) {
          string = utf16string.charAt(position).toString();
          if (string === "\n") {
            string = "⏎";
          }
          selected = rangeIsExpanded && (position >= this.range[0] && position < this.range[1]);
          chars.push({string, selected});
          position++;
        }
        return chars;
      }

      getTitle() {
        return `${this.title} (${this.range.join()})`;
      }

    };

    _Class.prototype.title = "Selection";

    _Class.prototype.template = "selection";

    _Class.prototype.events = {
      "trix-selection-change": function() {
        return this.render();
      },
      "trix-render": function() {
        return this.render();
      }
    };

    return _Class;

  }).call(window));

  Trix.Inspector.registerView((function() {
    var _Class;

    _Class = class extends Trix.Inspector.View {
      render() {
        ({undoEntries: this.undoEntries, redoEntries: this.redoEntries} = this.editor.undoManager);
        return super.render(...arguments);
      }

    };

    _Class.prototype.title = "Undo";

    _Class.prototype.template = "undo";

    _Class.prototype.events = {
      "trix-change": function() {
        return this.render();
      }
    };

    return _Class;

  }).call(window));

})));
