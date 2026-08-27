/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

#include <dirent.h>
#include <sys/syscall.h>
#include <unistd.h>

#include <cstdlib>

#include <cstdio>
#include <cstring>
#include <string>
#include <vector>

#include "gtest/gtest.h"

extern "C" {
#include "c/tests/integration/test_driver.h"
}

// Names of the threads this process still has, other than the one calling. Empty where they cannot
// be listed, which is anywhere without /proc.
static std::vector<std::string> surviving_threads() {
    std::vector<std::string> found;
#ifdef __linux__
    const pid_t self = syscall(SYS_gettid);
    DIR* tasks = opendir("/proc/self/task");
    if (tasks == nullptr) return found;
    while (struct dirent* task = readdir(tasks)) {
        if (task->d_name[0] == '.' || atoi(task->d_name) == self) continue;
        const std::string path = std::string("/proc/self/task/") + task->d_name + "/comm";
        FILE* comm = fopen(path.c_str(), "r");
        if (comm == nullptr) continue;
        char name[64] = {0};
        if (fgets(name, sizeof(name), comm) != nullptr) {
            name[strcspn(name, "\n")] = '\0';
            found.emplace_back(name);
        }
        fclose(comm);
    }
    closedir(tasks);
#endif
    return found;
}

// The driver names its threads; Linux truncates thread names to 15 characters.
static bool is_driver_thread(const std::string& name) {
    return name.rfind("gRPC worker", 0) == 0 || name.rfind("Callback handl", 0) == 0;
}

TEST(TestDatabaseManagement, TestDatabaseManagement) {
    EXPECT_TRUE(test_database_management());
}

TEST(TestQuery, TestSchema) {
    EXPECT_TRUE(test_query_schema());
}
TEST(TestQuery, TestData) {
    EXPECT_TRUE(test_query_data());
}
TEST(TestQuery, TestGiven) {
    EXPECT_TRUE(test_query_given());
}

TEST(TestExample, TestExample) {
    EXPECT_TRUE(test_example());
}

int main(int argc, char **argv) {
    fprintf(stderr, "test-driver: entered main\n");
    // Unbuffered, so that a crash during teardown cannot swallow the record of how far the suite got.
    setvbuf(stdout, nullptr, _IONBF, 0);

    ::testing::InitGoogleTest(&argc, argv);
    int result = RUN_ALL_TESTS();

    // A thread still running here races the teardown of the process, which is only observable as a
    // sanitiser crash with no report. Report them, and fail on the ones the driver owns.
    const std::vector<std::string> alive = surviving_threads();
    for (const std::string& name : alive) {
        fprintf(stderr, "thread outlived the tests: '%s'%s\n", name.c_str(), is_driver_thread(name) ? " (driver)" : "");
        if (is_driver_thread(name)) result = 1;
    }
    return result;
}
