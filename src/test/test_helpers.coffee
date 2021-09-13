import Trix from "global"

import "test_helpers/test_helpers"
import "test_helpers/fixtures/fixtures"
import "test_helpers/assertions"
import "test_helpers/editor_helpers"
import "test_helpers/input_helpers"
import "test_helpers/selection_helpers"
import "test_helpers/test_stubs"
import "test_helpers/toolbar_helpers"

# Remove QUnit's globals
delete window[key] for key, value of QUnit when window[key] is value


