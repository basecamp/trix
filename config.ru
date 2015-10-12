require 'bundler/setup'
require 'blade'
require 'json'

Blade.initialize!

map '/' do
  run Blade::Assets.environment(:user)
end

map '/test' do
  run Blade::RackAdapter.new
end

map '/submit' do
  run -> (env) do
    request = Rack::Request.new(env)
    response = JSON.dump(request.params)
    [200, {'Content-Type' => 'application/json'}, [response]]
  end
end
