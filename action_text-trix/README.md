## Building the Trix Ruby gem

1. `cd action_text-trix`
2. `bundle exec rake sync` (updates files which must be committed to git)
3. `bundle exec rake build`
4. `gem push pkg/*.gem`
