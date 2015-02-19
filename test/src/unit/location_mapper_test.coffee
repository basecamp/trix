module "Trix.LocationMapper"

document = Trix.Document.fromJSON [
  {"text":[
    {"type":"string","attributes":{"bold":true},"string":"a\n"},
    {"type":"string","attributes":{"blockBreak":true},"string":"\n"}
  ],"attributes":[]},
  {"text":[
    {"type":"string","attributes":{},"string":"b😭cd"},
    {"type":"attachment","attributes":{},"attachment":{"contentType":"image/png","filename":"x.png","filesize":0,"height":13,"href":"data:image/png,","identifier":"1","url":"data:image/png,","width":15}},
    {"type":"string","attributes":{},"string":"e"},
    {"type":"string","attributes":{"blockBreak":true},"string":"\n"}
  ],"attributes":["quote"]}
]

# <trix-document>
# 0 <div>
#     0 <!--block-->
#     1 <strong>
#         0 a
#         1 <br>
#       </strong>
#     2 <br>
#   </div>
# 1 <blockquote>
#     0 <!--block-->
#     1 b😭cd
#     2 <span data-trix-cursor-target>
#         0 (zero-width space)
#       </span>
#     3 <a href="data:image/png," ...>
#         0 <figure ...>...</figure>
#       </a>
#     4 <span data-trix-cursor-target>
#         0 (zero-width space)
#       </span>
#     5 e
#   </blockquote>
# </trix-document>

element = Trix.DocumentView.render(document)
mapper = new Trix.LocationMapper element

test "findLocationFromContainerAndOffset", ->
  assertions = [
    { location: [0, 0],  container: [],         offset: 0 }
    { location: [0, 0],  container: [0],        offset: 0 }
    { location: [0, 0],  container: [0],        offset: 1 }
    { location: [0, 0],  container: [0, 1],     offset: 0 }
    { location: [0, 0],  container: [0, 1, 0],  offset: 0 }
    { location: [0, 1],  container: [0, 1, 0],  offset: 1 }
    { location: [0, 1],  container: [0, 1],     offset: 1 }
    { location: [0, 2],  container: [0, 1],     offset: 2 }
    { location: [0, 2],  container: [0],        offset: 2 }
    { location: [0, 2],  container: [],         offset: 1 }
    { location: [0, 2],  container: [1],        offset: 0 }
    { location: [1, 0],  container: [1],        offset: 1 }
    { location: [1, 0],  container: [1, 1],     offset: 0 }
    { location: [1, 1],  container: [1, 1],     offset: 1 }
    { location: [1, 2],  container: [1, 1],     offset: 2 }
    { location: [1, 2],  container: [1, 1],     offset: 3 }
    { location: [1, 3],  container: [1, 1],     offset: 4 }
    { location: [1, 4],  container: [1, 1],     offset: 5 }
    { location: [1, 4],  container: [1, 1],     offset: 6 }
    { location: [1, 4],  container: [1],        offset: 2 }
    { location: [1, 4],  container: [1, 2],     offset: 0 }
    { location: [1, 4],  container: [1, 2],     offset: 1 }
    { location: [1, 4],  container: [1],        offset: 3 }
    { location: [1, 4],  container: [1, 3],     offset: 0 }
    { location: [1, 5],  container: [1, 3],     offset: 1 }
    { location: [1, 5],  container: [1],        offset: 4 }
    { location: [1, 5],  container: [1, 4],     offset: 0 }
    { location: [1, 5],  container: [1, 4],     offset: 1 }
    { location: [1, 5],  container: [1],        offset: 5 }
    { location: [1, 5],  container: [1, 5],     offset: 0 }
    { location: [1, 6],  container: [1, 5],     offset: 1 }
    { location: [1, 6],  container: [],         offset: 2 }
  ]

  for assertion in assertions
    path = assertion.container
    container = findContainer(path)
    offset = assertion.offset

    expectedLocation = index: assertion.location[0], offset: assertion.location[1]
    actualLocation = mapper.findLocationFromContainerAndOffset(container, offset)

    equal format(actualLocation), format(expectedLocation),
      "#{describe(container)} at [#{path.join(", ")}], offset #{offset} = #{format(expectedLocation)}"


findContainer = (path) ->
  el = element
  el = el.childNodes[index] for index in path
  el

format = ({index, offset}) ->
  "#{index}/#{offset}"

describe = (node) ->
  if node.nodeType is Node.TEXT_NODE
    "text node #{JSON.stringify(node.textContent)}"
  else
    "container <#{node.tagName.toLowerCase()}>"
