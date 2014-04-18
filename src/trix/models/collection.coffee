class Trix.Collection
  constructor: (models) ->
    @models = {}
    @reset(models)

  add: (model) ->
    unless @get(model.id)
      unless @notifyDelegate("add", model) is false
        @models[model.id] = model

  remove: (model) ->
    if @get(model.id)
      delete @models[model.id]
      @notifyDelegate("remove", model)

  get: (id) ->
    @models[id]

  reset: (models = []) ->
    for id, model of @models when model not in models
      @remove(model)

    for model in models
      @add(model)

  notifyDelegate: (message, model) ->
    @delegate?[message + model.modelName]?(model)
