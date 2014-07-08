require 'bundler/setup'
require 'rack/rewrite'

root = File.dirname(__FILE__)
require File.join(root + '/lib/trix/environment')

environment = Trix::Environment.new(root)
environment.paths = %w( assets src test/assets test/src test/vendor )

map '/' do
  run environment.sprockets_environment
  use Rack::Rewrite do
    rewrite '/', '/demo.html'
    rewrite '/test', 'test.html'
  end
end
