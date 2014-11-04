failures = []

QUnit.testStart (testDetails) ->
  QUnit.log (details) ->
    failures.push(details) unless details.result

QUnit.done (results) ->
  results.failures = failures
  window.global_test_results = results
