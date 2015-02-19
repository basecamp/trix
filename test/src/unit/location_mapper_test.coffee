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
    [[0, 0],  [[],          0]]
    [[0, 0],  [[0],         0]]
    [[0, 0],  [[0],         1]]
    [[0, 0],  [[0, 1],      0]]
    [[0, 0],  [[0, 1, 0],   0]]
    [[0, 1],  [[0, 1, 0],   1]]
    [[0, 1],  [[0, 1],      1]]
    [[0, 2],  [[0, 1],      2]]
    [[0, 2],  [[0],         2]]
    [[0, 2],  [[],          1]]
    [[0, 2],  [[1],         0]]
    [[1, 0],  [[1],         1]]
    [[1, 0],  [[1, 1],      0]]
    [[1, 1],  [[1, 1],      1]]
    [[1, 2],  [[1, 1],      2]]
    [[1, 2],  [[1, 1],      3]]
    [[1, 3],  [[1, 1],      4]]
    [[1, 4],  [[1, 1],      5]]
    [[1, 4],  [[1, 1],      6]]
    [[1, 4],  [[1],         2]]
    [[1, 4],  [[1, 2],      0]]
    [[1, 4],  [[1, 2],      1]]
    [[1, 4],  [[1],         3]]
    [[1, 4],  [[1, 3],      0]]
    [[1, 5],  [[1, 3],      1]]
    [[1, 5],  [[1],         4]]
    [[1, 5],  [[1, 4],      0]]
    [[1, 5],  [[1, 4],      1]]
    [[1, 5],  [[1],         5]]
    [[1, 5],  [[1, 5],      0]]
    [[1, 6],  [[1, 5],      1]]
    [[1, 6],  [[],          2]]
  ]

  for assertion in assertions
    [[index, offset], [path, containerOffset]] = assertion
    container = findContainer(path)
    location = mapper.findLocationFromContainerAndOffset(container, containerOffset)

    equal "#{location.index}/#{location.offset}", "#{index}/#{offset}",
      "#{describe(container)} at [#{path.join(", ")}], offset #{containerOffset} = #{index}/#{offset}"

findContainer = (path) ->
  el = element
  el = el.childNodes[index] for index in path
  el

describe = (node) ->
  if node.nodeType is Node.TEXT_NODE
    "text node #{JSON.stringify(node.textContent)}"
  else
    "container <#{node.tagName.toLowerCase()}>"
