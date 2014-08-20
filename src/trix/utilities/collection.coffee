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

  difference: (otherModels = []) ->
    model for model in @toArray() when model not in otherModels

  where: (attributes = {}, {limit} = {}) ->
    models = []
    for id, model of @models when modelHasAttributes(model, attributes)
      break if limit? and models.length is limit
      models.push(model)
    models

  findWhere: (attributes) ->
    @where(attributes, limit: 1)[0]

  toArray: ->
    model for id, model of @models

  modelHasAttributes = (model, attributes) ->
    modelAttributes = model.getAttributes()
    return false for key, value of attributes when modelAttributes[key] isnt value
    true
