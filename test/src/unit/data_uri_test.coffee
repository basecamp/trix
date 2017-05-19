{assert, test, testGroup} = Trix.TestHelpers

parseTest = (uriString, expectations) ->
  test uriString, ->
    uri = Trix.DataUri.parse(uriString)
    if expectations?
      assert.ok(uri)
      for key, value of expectations
        assert.equal(uri[key](), value)
    else
      assert.notOk(uri)

testGroup "Trix.DataUri", ->
  parseTest "data:", null
  parseTest "data:base64", null

  parseTest "data:,",
    getContentType: "text/plain"
    getCharset:     "US-ASCII"
    getData:        ""
    toString:       "data:base64,"

  parseTest "data:,<div>Hello world</div>",
    getContentType: "text/plain"
    getCharset:     "US-ASCII"
    getData:        "<div>Hello world</div>"
    toString:       "data:base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

  parseTest "data:base64,",
    getContentType: "text/plain"
    getCharset:     "US-ASCII"
    getData:        ""
    toString:       "data:base64,"

  parseTest "data:base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg==",
    getContentType: "text/plain"
    getCharset:     "US-ASCII"
    getData:        "<div>Hello world</div>"
    toString:       "data:base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

  parseTest "data:text/html,",
    getContentType: "text/html"
    getCharset:     "US-ASCII"
    getData:        ""
    toString:       "data:text/html;base64,"

  parseTest "data:text/html,<div>Hello world</div>",
    getContentType: "text/html"
    getCharset:     "US-ASCII"
    getData:        "<div>Hello world</div>"
    toString:       "data:text/html;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

  parseTest "data:text/html;base64,",
    getContentType: "text/html"
    getCharset:     "US-ASCII"
    getData:        ""
    toString:       "data:text/html;base64,"

  parseTest "data:text/html;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg==",
    getContentType: "text/html"
    getCharset:     "US-ASCII"
    getData:        "<div>Hello world</div>"
    toString:       "data:text/html;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

  parseTest "data:text/html;charset=UTF-8,",
    getContentType: "text/html"
    getCharset:     "UTF-8"
    getData:        ""
    toString:       "data:text/html;charset=UTF-8;base64,"

  parseTest "data:text/html;charset=UTF-8,<div>Hello world</div>",
    getContentType: "text/html"
    getCharset:     "UTF-8"
    getData:        "<div>Hello world</div>"
    toString:       "data:text/html;charset=UTF-8;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

  parseTest "data:text/html;charset=UTF-8;base64,",
    getContentType: "text/html"
    getCharset:     "UTF-8"
    getData:        ""
    toString:       "data:text/html;charset=UTF-8;base64,"

  parseTest "data:text/html;charset=UTF-8;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg==",
    getContentType: "text/html"
    getCharset:     "UTF-8"
    getData:        "<div>Hello world</div>"
    toString:       "data:text/html;charset=UTF-8;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

  parseTest "data:;charset=UTF-8,",
    getContentType: "text/plain"
    getCharset:     "UTF-8"
    getData:        ""
    toString:       "data:;charset=UTF-8;base64,"

  parseTest "data:;charset=UTF-8,<div>Hello world</div>",
    getContentType: "text/plain"
    getCharset:     "UTF-8"
    getData:        "<div>Hello world</div>"
    toString:       "data:;charset=UTF-8;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

  parseTest "data:;charset=UTF-8;base64,",
    getContentType: "text/plain"
    getCharset:     "UTF-8"
    getData:        ""
    toString:       "data:;charset=UTF-8;base64,"

  parseTest "data:;charset=UTF-8;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg==",
    getContentType: "text/plain"
    getCharset:     "UTF-8"
    getData:        "<div>Hello world</div>"
    toString:       "data:;charset=UTF-8;base64,PGRpdj5IZWxsbyB3b3JsZDwvZGl2Pg=="

