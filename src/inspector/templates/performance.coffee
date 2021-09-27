window.JST ||= {}

window.JST["trix/inspector/templates/performance"] = () ->
  metrics = for name, data of @data
    dataMetrics(name, data, @round)

  metrics.join("\n")

dataMetrics = (name, data, round) ->
  item = "<strong>#{name}</strong> (#{ data.calls })<br>"

  if data.calls > 0
    item += """
      <div class="metrics">
        Mean: #{ round(data.mean) }ms<br>
        Max: #{ round(data.max) }ms<br>
        Last: #{ round(data.last) }ms
      </div>
    """

    item
