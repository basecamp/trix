editorModule "HTML replacement", template: "editor_empty"

copyWith = (object, properties = {}) ->
  result = {}
  result[key] = value for key, value of object
  result[key] = value for key, value of properties
  result

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
  {}
  { textRendering: "optimizeSpeed" }
  { textRendering: "optimizeLegibility" }
  { textRendering: "geometricPrecision" }
]

testStyleVariants = [
  { padding: "3px" }
]

for styles in testStyles
  for variant in testStyleVariants
    testStyles.push(copyWith(styles, variant))

for styles in testStyles
  for name, testCase of testCases
    for range in testCase.selections
      do (styles, name, testCase, range) ->
        editorTest "#{name} with selected range #{JSON.stringify(range)} and styles #{JSON.stringify(styles)}", (expectDocument) ->
          {document, documentString} = testCase

          applyStyles(styles)
          getEditor().loadDocument(document)
          getEditor().setSelectedRange(range)
          getComposition().replaceHTML(getEditorElement().innerHTML)

          deepEqual getEditor().getSelectedRange(), range
          expectDocument documentString

applyStyles = (styles) ->
  element = getEditorElement()
  element.style[key] = value for key, value of styles
