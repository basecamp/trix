require 'bundler/setup'
require 'rack/rewrite'
require File.join(File.dirname(__FILE__) + '/lib/trix')

map '/' do
  run Trix.environment
  use Rack::Rewrite do
    rewrite '/', '/index.html'
    rewrite '/tests', 'tests.html'
  end
end
