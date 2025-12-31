# Pin npm packages by running ./bin/importmap

pin "application"

pin "trix"
pin "trix/actiontext", to: "trix/actiontext.esm.js"
pin "@rails/activestorage", to: "activestorage.esm.js"
pin "@rails/actiontext", to: "actiontext.esm.js"
