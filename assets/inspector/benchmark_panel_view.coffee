#= require vendor/lodash
#= require vendor/benchmark
#= require ./inspector_panel_view

class Trix.BenchmarkPanelView extends Trix.InspectorPanelView

  constructor: ->
    super
    @handleEvent "click", onElement: @element, matchingSelector: "button.run", withCallback: @run, preventDefault: true
    @handleEvent "click", onElement: @element, matchingSelector: "button.add", withCallback: @addBenchmark, preventDefault: true
    @addBenchmark() if @element.querySelectorAll("li.benchmark").length < 2

  addBenchmark: =>
    element = @getBenchmarkElement(0)
    clone = element.cloneNode(true)
    element.parentNode.appendChild(clone)
    clone.querySelector("textarea").select()

  run: =>
    suite = new Benchmark.Suite

    for element, index in @getBenchmarkElements()
      textarea = element.querySelector("textarea")
      if textarea.value
        suite.add("#{index}", textarea.value)

    suite.on "start", =>
      input.disabled = true for input in @getInputElements()

    suite.on "cycle", (event) =>
      benchmark = event.target
      mean = (benchmark.stats.mean * 1000).toFixed(3)
      element = @getBenchmarkElement(benchmark.name)
      element.querySelector(".results").textContent = "↳ Mean: #{mean}ms; #{benchmark}"

    suite.on "complete", =>
      input.disabled = false for input in @getInputElements()
      fastest = suite.filter("fastest")[0]
      @getBenchmarkElement(fastest.name).classList.add("fastest")

    suite.run(async: true)

  getBenchmarkElements: ->
    @element.querySelectorAll("li.benchmark")

  getBenchmarkElement: (index) ->
    @getBenchmarkElements()[Number(index)]

  getInputElements: ->
    @element.querySelectorAll("textarea, input, button")
