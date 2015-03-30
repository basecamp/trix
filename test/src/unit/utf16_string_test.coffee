module "Trix.UTF16String"

stringComparisonAssertions =
  "no change":
    oldString: "abc"
    newString: "abc"
    change: stringAdded: "", stringRemoved: ""
  "adding a character":
    oldString: ""
    newString: "a"
    change: stringAdded: "a", stringRemoved: ""
  "appending a character":
    oldString: "ab"
    newString: "abc"
    change: stringAdded: "c", stringRemoved: ""
  "appending a multibyte character":
    oldString: "a💩"
    newString: "a💩💩"
    change: stringAdded: "💩", stringRemoved: ""
  "prepending a character":
    oldString: "bc"
    newString: "abc"
    change: stringAdded: "a", stringRemoved: ""
  "inserting a character":
    oldString: "ac"
    newString: "abc"
    change: stringAdded: "b", stringRemoved: ""
  "inserting a string":
    oldString: "ac"
    newString: "aZZZc"
    change: stringAdded: "ZZZ", stringRemoved: ""
  "replacing a character":
    oldString: "abc"
    newString: "aZc"
    change: stringAdded: "Z", stringRemoved: "b"
  "replacing a character with a string":
    oldString: "abc"
    newString: "aXYc"
    change: stringAdded: "XY", stringRemoved: "b"
  "replacing a string with a character":
    oldString: "abcde"
    newString: "aXe"
    change: stringAdded: "X", stringRemoved: "bcd"
  "replacing a string with a string":
    oldString: "abcde"
    newString: "aBCDe"
    change: stringAdded: "BCD", stringRemoved: "bcd"
  "removing a character":
    oldString: "abc"
    newString: "ac"
    change: stringAdded: "", stringRemoved: "b"

for name, details of stringComparisonAssertions
  do ({oldString, newString, change} = details) ->
    test "#compareToOlder - #{name}", ->
      deepEqual Trix.UTF16String.box(newString).compareToOlder(oldString), change
