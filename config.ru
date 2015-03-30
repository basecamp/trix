require 'bundler/setup'
require 'rack/rewrite'
require 'pathname'
require 'json'

root = Pathname.new(File.dirname(__FILE__))

require root.join('lib/trix/environment')
environment = Trix::Environment.new(root)
environment.paths = %w( assets polyfills src test/assets test/src test/vendor )

require root.join('lib/trix/attachment_server')
Trix::AttachmentServer.root = root.join('tmp/attachments')

map '/' do
  run environment.sprockets_environment
  use Rack::Rewrite do
    rewrite '/', '/demo.html'
    rewrite /\/test((\?.*)|$)/, 'test.html$1'
  end
end

map '/attachments' do
  run Trix::AttachmentServer
end

map '/submit' do
  run -> (env) do
    request = Rack::Request.new(env)
    response = JSON.dump(request.params)
    [200, {'Content-Type' => 'application/json'}, [response]]
  end
end
