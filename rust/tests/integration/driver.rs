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

use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};

use common::{await_flag, delete_database_if_exists, new_driver};
use serial_test::serial;
use typedb_driver::TransactionType;

const DATABASE_NAME: &str = "typedb";

async fn cleanup() {
    delete_database_if_exists(DATABASE_NAME).await;
}

#[test]
#[serial]
fn transaction_on_close_callback() {
    async_std::task::block_on(async {
        cleanup().await;
        let driver = new_driver().await;

        driver.databases().create(DATABASE_NAME).await.unwrap();
        let database = driver.databases().get(DATABASE_NAME).await.unwrap();
        assert_eq!(database.name(), DATABASE_NAME);

        let close_called = Arc::new(AtomicBool::new(false));
        let transaction = driver.transaction(database.name(), TransactionType::Read).await.unwrap();
        transaction
            .on_close(Box::new({
                let clone = close_called.clone();
                move |_| clone.store(true, Ordering::SeqCst)
            }))
            .await
            .unwrap();

        transaction.close().await.unwrap();
        drop(transaction);
        await_flag(&close_called, "transaction close callback");

        drop(driver);
        cleanup().await;
    })
}

// on_close (or a second close) after the transaction has already closed must not panic
#[test]
#[serial]
fn transaction_on_close_after_close_does_not_panic() {
    async_std::task::block_on(async {
        cleanup().await;
        let driver = new_driver().await;

        driver.databases().create(DATABASE_NAME).await.unwrap();
        let database = driver.databases().get(DATABASE_NAME).await.unwrap();

        let transaction = driver.transaction(database.name(), TransactionType::Read).await.unwrap();
        transaction.close().await.unwrap();

        transaction.on_close(Box::new(|_| {})).await.unwrap();
        transaction.close().await.unwrap();
        drop(driver);
        cleanup().await;
    })
}
