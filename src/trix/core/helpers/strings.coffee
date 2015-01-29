Trix.extend
  convertDashesToCamelCase: (string, {initial} = {}) ->
    if initial
      pattern = initialDashesToCamelCasePattern
    else
      pattern = trailingDashesToCamelCasePattern

    string.replace pattern, (match) ->
      match.toString().slice(-1).toUpperCase()

trailingDashesToCamelCasePattern = /-[a-z]/g
initialDashesToCamelCasePattern = /^[a-z]|-[a-z]/g
