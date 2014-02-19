require 'sprockets'
require 'coffee-script'

Root = File.expand_path(File.dirname(__FILE__))

Assets = Sprockets::Environment.new(Root) do |env|
  env.append_path "src"
end

map "/js" do
  run Assets
end

map("/") { run Rack::File.new("#{Root}/src/rich_text.html") }
