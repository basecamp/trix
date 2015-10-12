namespace :trix do
  desc "Print code statistics"
  task :stats do
    lines = `find src -name '*.coffee' -type f | xargs sed -n '/^ *\\(#.*\\)*\$/!p'`.strip.split("\n")
    classes = lines.grep(/(^|\s)class\s+/)
    methods = lines.grep(/^\s*[^:]+:.*[-=]>\s*$/)
    puts "#{lines.count} lines, #{classes.count} classes, #{methods.count} methods"
  end
end
