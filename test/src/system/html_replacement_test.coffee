editorModule "HTML replacement", template: "editor_empty"

testCases =
  "single character":
    document: [{"text":[{"type":"string","attributes":{},"string":"a"},{"type":"string","attributes":{"blockBreak":true},"string":"\n"}],"attributes":[]}]
    selections: [ 0, 1, [0,1] ]

  "character and newline":
    document: [{"text":[{"type":"string","attributes":{},"string":"a\n"},{"type":"string","attributes":{"blockBreak":true},"string":"\n"}],"attributes":[]}]
    selections: [ 0, 1, 2, [0,1], [0,2] ]

  "bullets":
    document: [{"text":[{"type":"string","attributes":{},"string":"a"},{"type":"string","attributes":{"blockBreak":true},"string":"\n"}],"attributes":["bulletList","bullet"]},{"text":[{"type":"string","attributes":{},"string":"b"},{"type":"string","attributes":{"blockBreak":true},"string":"\n"}],"attributes":["bulletList","bullet"]}]
    selections: [ 0, 1, 2, 3, [0,1], [0,3], [2,3] ]

for name, testCase of testCases
  testCase.document = Trix.Document.fromJSON(testCase.document)
  testCase.documentString = testCase.document.toString()
  testCase.selections = testCase.selections.map (selection) -> Trix.normalizeRange(selection)

testStyles = [
  { }
  { textRendering: "auto" }
  { textRendering: "optimizeSpeed" }
  { textRendering: "optimizeLegibility" }
  { textRendering: "geometricPrecision" }
]

for styles in testStyles
  for name, testCase of testCases
    for range in testCase.selections
      do (styles, name, testCase, range) ->
        editorTest "#{name} with selected range #{JSON.stringify(range)} and styles #{JSON.stringify(styles)}", (expectDocument) ->
          {document, documentString} = testCase

          getEditor().loadDocument(document)
          getEditor().setSelectedRange(range)
          getComposition().replaceHTML(getEditorElement().innerHTML)

          assertLocationRange document.locationRangeFromRange(range)...
          expectDocument documentString
