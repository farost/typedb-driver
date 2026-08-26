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

use std::{
    sync::atomic::{AtomicBool, Ordering},
    thread::sleep,
    time::Duration,
};

use typedb_driver::{Addresses, Credentials, DriverOptions, DriverTlsConfig, TypeDBDriver};

pub async fn new_driver() -> TypeDBDriver {
    TypeDBDriver::new(
        Addresses::try_from_address_str(TypeDBDriver::DEFAULT_ADDRESS).unwrap(),
        Credentials::new("admin", "password"),
        DriverOptions::new(DriverTlsConfig::disabled()),
    )
    .await
    .unwrap()
}

/// Deletes the database if it exists, so that suites sharing a server find it clean.
pub async fn delete_database_if_exists(name: &str) {
    let driver = new_driver().await;
    if driver.databases().contains(name).await.unwrap() {
        driver.databases().get(name).await.unwrap().delete().await.unwrap();
    }
}

/// Waits for `flag`, failing rather than hanging if it is never set.
pub fn await_flag(flag: &AtomicBool, what: &str) {
    const TIMEOUT: Duration = Duration::from_secs(5);
    const INTERVAL: Duration = Duration::from_millis(50);
    for _ in 0..(TIMEOUT.as_millis() / INTERVAL.as_millis()) {
        if flag.load(Ordering::SeqCst) {
            return;
        }
        sleep(INTERVAL);
    }
    panic!("{what} did not happen within {TIMEOUT:?}");
}
