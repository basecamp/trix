Trix.extend
  normalizeSpaces: (string) ->
    string
      .replace(///#{Trix.ZERO_WIDTH_SPACE}///g, "")
      .replace(///#{Trix.NON_BREAKING_SPACE}///g, " ")

  convertDashesToCamelCase: (string, {initial} = {}) ->
    if initial
      pattern = initialDashesToCamelCasePattern
    else
      pattern = trailingDashesToCamelCasePattern

    string.replace pattern, (match) ->
      match.toString().slice(-1).toUpperCase()

trailingDashesToCamelCasePattern = /-[a-z]/g
initialDashesToCamelCasePattern = /^[a-z]|-[a-z]/g
