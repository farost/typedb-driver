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

use std::thread::sleep;
use std::time::Duration;
// EXAMPLE START MARKER
use futures::{StreamExt, TryStreamExt};
// EXAMPLE END MARKER
use serial_test::serial;
// EXAMPLE START MARKER
use typedb_driver::{
    answer::{
        concept_document::{Leaf, Node},
        ConceptRow, QueryAnswer,
    },
    concept::{Concept, ValueType},
    Error, TransactionType, TypeDBDriver,
};

const DB_NAME: &'static str = "benchmark";

fn prepare() -> TypeDBDriver {
    async_std::task::block_on(async {
        let driver = TypeDBDriver::new_core(TypeDBDriver::DEFAULT_ADDRESS).await.expect("Expected driver");
        if driver.databases().contains(DB_NAME).await.unwrap() {
            driver.databases().get(DB_NAME).await.expect("Expect database get").delete().await.expect("Expected database delete");
        }
        driver.databases().create(DB_NAME).await.expect("Expect database create");
        driver
    })
}

fn open_transaction(driver: &TypeDBDriver) {
    async_std::task::block_on(async {
        driver.transaction(DB_NAME, TransactionType::Read).await.expect("Expected transaction");
    })
}

#[test]
fn kek() {
    let _ = env_logger::builder().is_test(true).try_init();
    println!("Start");
    let driver = prepare();
    open_transaction(&driver);
    println!("Stop");
}
