Trix.extend
  normalizeSpaces: (string) ->
    string
      .replace(///#{Trix.ZERO_WIDTH_SPACE}///g, "")
      .replace(///#{Trix.NON_BREAKING_SPACE}///g, " ")

  normalizeNewlines: (string) ->
    string.replace(/\r\n/g, "\n")

  breakableWhitespacePattern: ///[^\S#{Trix.NON_BREAKING_SPACE}]///

  squishBreakableWhitespace: (string) ->
    string
      # Replace all breakable whitespace characters with a space
      .replace(///#{Trix.breakableWhitespacePattern.source}///g, " ")
      # Replace two or more spaces with a single space
      .replace(/\ {2,}/g, " ")

  summarizeStringChange: (oldString, newString) ->
    oldString = Trix.UTF16String.box(oldString)
    newString = Trix.UTF16String.box(newString)

    if newString.length < oldString.length
      [removed, added] = utf16StringDifferences(oldString, newString)
    else
      [added, removed] = utf16StringDifferences(newString, oldString)

    {added, removed}

utf16StringDifferences = (a, b) ->
  return ["", ""] if a.isEqualTo(b)

  diffA = utf16StringDifference(a, b)
  {length} = diffA.utf16String

  diffB = if length
    {offset} = diffA
    codepoints = a.codepoints.slice(0, offset).concat(a.codepoints.slice(offset + length))
    utf16StringDifference(b, Trix.UTF16String.fromCodepoints(codepoints))
  else
    utf16StringDifference(b, a)

  [diffA.utf16String.toString(), diffB.utf16String.toString()]

utf16StringDifference = (a, b) ->
  leftIndex = 0
  rightIndexA = a.length
  rightIndexB = b.length

  while leftIndex < rightIndexA and a.charAt(leftIndex).isEqualTo(b.charAt(leftIndex))
    leftIndex++

  while rightIndexA > leftIndex + 1 and a.charAt(rightIndexA - 1).isEqualTo(b.charAt(rightIndexB - 1))
    rightIndexA--
    rightIndexB--

  utf16String: a.slice(leftIndex, rightIndexA)
  offset: leftIndex
