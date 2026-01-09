module Trix
  class Engine < ::Rails::Engine
    initializer "trix.asset" do |app|
      if app.config.respond_to?(:assets)
        app.config.assets.precompile += %w[ trix.js trix.css trix/actiontext.esm.js trix/actiontext.esm.min.js ]
      end
    end
  end
end
