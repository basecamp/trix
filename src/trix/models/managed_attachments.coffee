#= require trix/utilities/collection
#= require trix/models/managed_attachment

class Trix.ManagedAttachments
  constructor: (@document) ->
    @collection = new Trix.Collection

  get: (id) ->
    @collection.get(id)

  findWhere: (attributes) ->
    @collection.findWhere(attributes)

  add: (manager) ->
    unless @collection.has(manager.id)
      @collection.add(manager)
      @delegate?.didAddAttachment?(manager)
      manager

  remove: (id) ->
    if manager = @collection.remove(id)
      @delegate?.didRemoveAttachment?(manager)

  refresh: ->
    managers = for attachment in @document.getAttachments()
      @get(attachment.id) ? new Trix.ManagedAttachment attachment, @document

    for manager in @collection.difference(managers)
      @remove(manager.id)

    for manager in managers
      @add(manager)

  shouldAcceptFile: (file) ->
    @delegate?.shouldAcceptFile?(file)
