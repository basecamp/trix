require 'bundler/setup'
require 'rack/rewrite'

root = File.dirname(__FILE__)
require File.join(root + '/lib/trix')

environment = Trix::Environment.new(root)
environment.paths = %w( assets src test/assets test/src test/vendor )

map '/' do
  run environment.sprockets_environment
  use Rack::Rewrite do
    rewrite '/', '/index.html'
    rewrite '/tests', 'tests.html'
  end
end
