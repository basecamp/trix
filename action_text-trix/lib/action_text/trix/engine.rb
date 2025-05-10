module Trix
  class Engine < ::Rails::Engine
    initializer "trix.asset" do |app|
      if app.config.respond_to?(:assets)
        app.config.assets.precompile += %w[ trix.js trix.css ]
      end
    end
  end
end
