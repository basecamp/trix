import Trix from "trix/global"

import "test/test_helpers/test_helpers"
import "test/test_helpers/fixtures/fixtures"
import "test/test_helpers/assertions"
import "test/test_helpers/editor_helpers"
import "test/test_helpers/input_helpers"
import "test/test_helpers/selection_helpers"
import "test/test_helpers/test_stubs"
import "test/test_helpers/toolbar_helpers"

# Remove QUnit's globals
delete window[key] for key, value of QUnit when window[key] is value


