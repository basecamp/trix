if (!window.JST) window.JST = {}

window.JST["trix/inspector/templates/performance"] = function() {
  return Object.keys(this.data).map((name) => {
      const data = this.data[name]
      return dataMetrics(name, data, this.round)
  }).join("\n")
}

const dataMetrics = function(name, data, round) {
  let item = `<strong>${name}</strong> (${data.calls})<br>`

  if (data.calls > 0) {
    item += `<div class="metrics">
        Mean: ${round(data.mean)}ms<br>
        Max: ${round(data.max)}ms<br>
        Last: ${round(data.last)}ms
      </div>`

    return item
  }
}
