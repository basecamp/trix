class Trix.Collection
  constructor: (models) ->
    @reset(models)

  get: (id) ->
    @models[id]

  has: (id) ->
    id of @models

  add: (model) ->
    unless @has(model.id)
      @models[model.id] = model

  remove: (id) ->
    if model = @get(id)
      delete @models[id]
      model

  reset: (models = []) ->
    @models = {}
    @add(model) for model in models

  toArray: ->
    model for id, model of @models
