Trix.extend
  rangeIsCollapsed: (range) ->
    range[0] is range[1]

  createRange: (start, end) ->
    switch
      when Array.isArray(start)
        start
      when start? and end?
        [start, end]
      when start? and not end?
        [start, start]
      when end? and not start?
        [end, end]
