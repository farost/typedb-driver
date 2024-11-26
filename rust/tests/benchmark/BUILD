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

load("@typedb_dependencies//tool/checkstyle:rules.bzl", "checkstyle_test")
load("@rules_rust//rust:defs.bzl", "rust_test")
package(default_visibility = ["//visibility:public",])

benchmark_deps = [
    "//rust:typedb_driver",
    "@crates//:async-std",
    "@crates//:chrono",
    "@crates//:futures",
    "@crates//:itertools",
    "@crates//:smol",
    "@crates//:tokio",
    "@crates//:env_logger",
        "@crates//:log",

    "@crates//:criterion",
    "@crates//:rand",
    "@crates//:pprof",
]

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:connection_open -- --bench
rust_test(
    name = "connection_open",
    srcs = glob([
        "connection_open.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:connection_open_multithreaded -- --bench
rust_test(
    name = "connection_open_multithreaded",
    srcs = glob([
        "connection_open_multithreaded.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:transaction_open -- --bench
rust_test(
    name = "transaction_open",
    srcs = glob([
        "transaction_open.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:transaction_open_multithreaded -- --bench
rust_test(
    name = "transaction_open_multithreaded",
    srcs = glob([
        "transaction_open_multithreaded.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:rollback -- --bench
rust_test(
    name = "rollback",
    srcs = glob([
        "rollback.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:rollback_multithreaded -- --bench
rust_test(
    name = "rollback_multithreaded",
    srcs = glob([
        "rollback_multithreaded.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:schema_query -- --bench
rust_test(
    name = "schema_query",
    srcs = glob([
        "schema_query.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:write_query -- --bench
rust_test(
    name = "write_query",
    srcs = glob([
        "write_query.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:large_write_query -- --bench
rust_test(
    name = "large_write_query",
    srcs = glob([
        "large_write_query.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

# To run this via Bazel, Criterion must be provided the --bench argument:
#   bazel run --compilation_mode=opt //rust/tests/benchmark:large_write_query_fetch -- --bench
rust_test(
    name = "large_write_query_fetch",
    srcs = glob([
        "large_write_query_fetch.rs",
    ]),
    deps = benchmark_deps,
    use_libtest_harness = False,
)

checkstyle_test(
    name = "checkstyle",
    include = glob(["*", "*/*", "*/*/*"]),
    license_type = "apache-header",
)
