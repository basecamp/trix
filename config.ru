require 'bundler/setup'
require 'blade'

Blade.initialize!

map '/' do
  run Blade::Assets.environment
end

map '/test' do
  run Blade::RackAdapter.new
end

map '/attachments' do
  path = Pathname.new('tmp/attachments').tap(&:mkpath)

  run -> (env) do
    request = Rack::Request.new(env)

    case
    when request.post?
      file = request.body.read
      key = Digest::MD5.hexdigest(file)
      path.join(key).write(file)
      [201, {}, ["#{request.base_url}/attachments/#{key}"]]
    when request.get?
      Rack::File.new(path, {}).call(env)
    else
      [405, {}, []]
    end
  end
end
