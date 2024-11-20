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

#![deny(unused_must_use)]

use std::{
    array,
    sync::{Arc, RwLock},
    thread,
    thread::{sleep, JoinHandle},
    time::{Duration, Instant},
};

use typedb_driver::{TransactionType, TypeDBDriver};

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

fn multi_threaded_inserts() {
    let driver = Arc::new(prepare());

    const NUM_THREADS: usize = 16;
    const INTERNAL_ITERS: usize = 1000;
    let start_signal_rw_lock = Arc::new(RwLock::new(()));
    let write_guard = start_signal_rw_lock.write().unwrap();
    let join_handles: [JoinHandle<()>; NUM_THREADS] = array::from_fn(|_| {
        let driver_cloned = driver.clone();
        let rw_lock_cloned = start_signal_rw_lock.clone();
        thread::spawn(move || {
            drop(rw_lock_cloned.read().unwrap());
            for _ in 0..INTERNAL_ITERS {
                open_transaction(driver_cloned.as_ref())
            }
        })
    });
    println!("Sleeping 1s before starting threads");
    sleep(Duration::from_secs(1));
    println!("Start!");
    let start = Instant::now();
    drop(write_guard); // Start
    for join_handle in join_handles {
        join_handle.join().unwrap()
    }
    let time_taken_ms = start.elapsed().as_millis();
    println!(
        "{NUM_THREADS} threads * {INTERNAL_ITERS} iters took: {time_taken_ms} ms = {} transactions/s",
        (NUM_THREADS * INTERNAL_ITERS * 1000) / time_taken_ms as usize
    );
}

fn main() {
    multi_threaded_inserts();
}
