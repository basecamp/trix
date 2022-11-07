import { TEST_IMAGE_URL, assert, test, testGroup } from "test/test_helper"

import DocumentView from "trix/views/document_view"
import Document from "trix/models/document"
import LocationMapper from "trix/models/location_mapper"

testGroup("LocationMapper", () => {
  test("findLocationFromContainerAndOffset", () => {
    setDocument([
      // <trix-editor>
      // 0 <div>
      //     0 <!--block-->
      //     1 <strong>
      //         0 a
      //         1 <br>
      //       </strong>
      //     2 <br>
      //   </div>
      // 1 <blockquote>
      //     0 <!--block-->
      //     1 b😭cd
      //     2 <span data-trix-cursor-target>
      //         0 (zero-width space)
      //       </span>
      //     3 <a href="data:image/png," data-trix-attachment="" ...>
      //         0 <figure ...>...</figure>
      //       </a>
      //     4 <span data-trix-cursor-target>
      //         0 (zero-width space)
      //       </span>
      //     5 e
      //   </blockquote>
      // </trix-editor>
      {
        text: [
          { type: "string", attributes: { bold: true }, string: "a\n" },
          { type: "string", attributes: { blockBreak: true }, string: "\n" },
        ],
        attributes: [],
      },
      {
        text: [
          { type: "string", attributes: {}, string: "b😭cd" },
          {
            type: "attachment",
            attributes: {},
            attachment: {
              contentType: "image/png",
              filename: "x.png",
              filesize: 0,
              height: 13,
              href: TEST_IMAGE_URL,
              identifier: "1",
              url: TEST_IMAGE_URL,
              width: 15,
            },
          },
          { type: "string", attributes: {}, string: "e" },
          { type: "string", attributes: { blockBreak: true }, string: "\n" },
        ],
        attributes: [ "quote" ],
      },
    ])

    const assertions = [
      { location: [ 0, 0 ], container: [], offset: 0 },
      { location: [ 0, 0 ], container: [ 0 ], offset: 0 },
      { location: [ 0, 0 ], container: [ 0 ], offset: 1 },
      { location: [ 0, 0 ], container: [ 0, 1 ], offset: 0 },
      { location: [ 0, 0 ], container: [ 0, 1, 0 ], offset: 0 },
      { location: [ 0, 1 ], container: [ 0, 1, 0 ], offset: 1 },
      { location: [ 0, 1 ], container: [ 0, 1 ], offset: 1 },
      { location: [ 0, 2 ], container: [ 0, 1 ], offset: 2 },
      { location: [ 0, 2 ], container: [ 0 ], offset: 2 },
      { location: [ 0, 3 ], container: [], offset: 1 },
      { location: [ 0, 3 ], container: [ 1 ], offset: 0 },
      { location: [ 1, 0 ], container: [ 1 ], offset: 1 },
      { location: [ 1, 0 ], container: [ 1, 1 ], offset: 0 },
      { location: [ 1, 1 ], container: [ 1, 1 ], offset: 1 },
      { location: [ 1, 2 ], container: [ 1, 1 ], offset: 2 },
      { location: [ 1, 3 ], container: [ 1, 1 ], offset: 3 },
      { location: [ 1, 4 ], container: [ 1, 1 ], offset: 4 },
      { location: [ 1, 5 ], container: [ 1, 1 ], offset: 5 },
      { location: [ 1, 6 ], container: [ 1, 1 ], offset: 6 },
      { location: [ 1, 5 ], container: [ 1 ], offset: 2 },
      { location: [ 1, 5 ], container: [ 1, 2 ], offset: 0 },
      { location: [ 1, 5 ], container: [ 1, 2 ], offset: 1 },
      { location: [ 1, 5 ], container: [ 1 ], offset: 3 },
      { location: [ 1, 5 ], container: [ 1, 3 ], offset: 0 },
      { location: [ 1, 5 ], container: [ 1, 3 ], offset: 1 },
      { location: [ 1, 6 ], container: [ 1 ], offset: 4 },
      { location: [ 1, 6 ], container: [ 1, 4 ], offset: 0 },
      { location: [ 1, 6 ], container: [ 1, 4 ], offset: 1 },
      { location: [ 1, 6 ], container: [ 1 ], offset: 5 },
      { location: [ 1, 6 ], container: [ 1, 5 ], offset: 0 },
      { location: [ 1, 7 ], container: [ 1, 5 ], offset: 1 },
      { location: [ 1, 7 ], container: [], offset: 2 },
    ]

    for (const assertion of assertions) {
      const path = assertion.container
      const container = findContainer(path)
      const { offset } = assertion

      const expectedLocation = { index: assertion.location[0], offset: assertion.location[1] }
      const actualLocation = mapper.findLocationFromContainerAndOffset(container, offset)

      assert.equal(
        format(actualLocation),
        format(expectedLocation),
        `${describe(container)} at [${path.join(", ")}], offset ${offset} = ${format(expectedLocation)}`
      )
    }
  })

  test("findContainerAndOffsetFromLocation: (0/0)", () => {
    setDocument([
      // <trix-editor>
      // 0 <ul>
      //     0 <li>
      //         0 <!--block-->
      //         1 <br>
      //       </li>
      //   </ul>
      // </trix-editor>
      {
        text: [ { type: "string", attributes: { blockBreak: true }, string: "\n" } ],
        attributes: [ "bulletList", "bullet" ],
      },
    ])

    const location = { index: 0, offset: 0 }
    const container = findContainer([ 0, 0 ])
    const offset = 1

    assert.deepEqual(mapper.findContainerAndOffsetFromLocation(location), [ container, offset ])
  })

  test("findContainerAndOffsetFromLocation after newline in formatted text", () => {
    setDocument([
      // <trix-editor>
      // 0 <div>
      //     0 <!--block-->
      //     0 <strong>
      //         0 a
      //         1 <br>
      //       </strong>
      //   </div>
      // </trix-editor>
      {
        text: [
          { type: "string", attributes: { bold: true }, string: "a\n" },
          { type: "string", attributes: { blockBreak: true }, string: "\n" },
        ],
        attributes: [],
      },
    ])

    const location = { index: 0, offset: 2 }
    const container = findContainer([ 0 ])
    const offset = 2

    assert.deepEqual(mapper.findContainerAndOffsetFromLocation(location), [ container, offset ])
  })

  test("findContainerAndOffsetFromLocation after nested block", () => {
    setDocument([
      // <trix-editor>
      //   <blockquote>
      //     <ul>
      //       <li>
      //         <!--block-->
      //         a
      //       </li>
      //     </ul>
      //     <!--block-->
      //     <br>
      //   </blockquote>
      // </trix-editor>
      {
        text: [
          { type: "string", attributes: {}, string: "a" },
          { type: "string", attributes: { blockBreak: true }, string: "\n" },
        ],
        attributes: [ "quote", "bulletList", "bullet" ],
      },
      {
        text: [ { type: "string", attributes: { blockBreak: true }, string: "\n" } ],
        attributes: [ "quote" ],
      },
    ])

    const location = { index: 1, offset: 0 }
    const container = findContainer([ 0 ])
    const offset = 2

    assert.deepEqual(mapper.findContainerAndOffsetFromLocation(location), [ container, offset ])
  })
})

// ---
let document = null
let element = null
let mapper = null

const setDocument = (json) => {
  document = Document.fromJSON(json)
  element = DocumentView.render(document)
  mapper = new LocationMapper(element)
}

const findContainer = (path) => {
  let el = element
  for (const index of path) {
    el = el.childNodes[index]
  }
  return el
}

const format = ({ index, offset }) => `${index}/${offset}`

const describe = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return `text node ${JSON.stringify(node.textContent)}`
  } else {
    return `container <${node.tagName.toLowerCase()}>`
  }
}
