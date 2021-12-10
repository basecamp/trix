/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
if (!window.JST) { window.JST = {}; }

window.JST["trix/inspector/templates/performance"] = function() {
  const metrics = (() => {
    const result = [];
    for (let name in this.data) {
      const data = this.data[name];
      result.push(dataMetrics(name, data, this.round));
    }
    return result;
  })();

  return metrics.join("\n");
};

var dataMetrics = function(name, data, round) {
  let item = `<strong>${name}</strong> (${ data.calls })<br>`;

  if (data.calls > 0) {
    item += `\
<div class="metrics">
  Mean: ${ round(data.mean) }ms<br>
  Max: ${ round(data.max) }ms<br>
  Last: ${ round(data.last) }ms
</div>\
`;

    return item;
  }
};
