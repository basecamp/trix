require 'bundler/setup'
require 'blade'

Blade.initialize!

map '/' do
  run Blade::Assets.environment(:user)
end

map '/test' do
  run Blade::RackAdapter.new
end
