# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import os
import unittest
from unittest import TestCase

from hamcrest import *

from typedb.driver import *

TYPEDB = "typedb"
DATA = SessionType.DATA
WRITE = TransactionType.WRITE


class TestDebug(TestCase):

    def test_missing_port(self):
        assert_that(calling(lambda: TypeDB.core_driver("localhost")), raises(TypeDBDriverException))

    def test_open_close_transaction(self):
        driver = TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS)
        assert_that(driver.is_open(), is_(True))
        driver.close()
        assert_that(driver.is_open(), is_(False))


if __name__ == "__main__":
    unittest.main(verbosity=2)

