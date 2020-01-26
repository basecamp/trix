//= require turndown.browser.umd
//= require markdown-it

setupHtmlToMdParser = ->
  parser = TurndownService()

  parser.remove('figcaption')
  parser.addRule('code', filter: 'pre', replacement: (content) -> '`' + content + '`')
  parser.addRule('strikethrough', filter: 'del', replacement: (content) -> '~~' + content + '~~')

  parser

setupMdToHtmlParser = ->
  parser = markdownit()
  rules = parser.renderer.rules
  originalCodeInlineRule = rules.code_inline

  rules.code_inline = (tokens, idx, options, env, slf) ->
    original = originalCodeInlineRule(tokens, idx, options, env, slf)
    original.replace(/^(<)code(.*)code(>)$/, '$1pre$2pre$3')

  rules.s_open = ->
    "<del>"
  rules.s_close = ->
    "</del>"

  parser

htmlToMdParser = setupHtmlToMdParser()
mdToHtmlParser = setupMdToHtmlParser()

Trix.extend
  markdown:
    htmlToMd: (html) ->
      markdown = htmlToMdParser.turndown(html)
      markdown

    mdToHtml: (markdown) ->
      html = mdToHtmlParser.renderInline(markdown)
      html