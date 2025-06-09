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
use std::time::Duration;

use futures::{StreamExt, TryStreamExt};
use serial_test::serial;
use typedb_driver::{
    answer::{
        concept_document::{Leaf, Node},
        ConceptRow, QueryAnswer,
    },
    concept::{Concept, ValueType},
    Credentials, DriverOptions, Error, QueryOptions, TransactionOptions, TransactionType, TypeDBDriver,
};

const DB_NAME: &str = "typedb-export";
const BATCH_SIZE: usize = 10_000;
const DATA_SIZE: usize = 10_000_000;

async fn cleanup() {
    let driver = TypeDBDriver::new(
        TypeDBDriver::DEFAULT_ADDRESS,
        Credentials::new("admin", "password"),
        DriverOptions::new(false, None).unwrap(),
    )
    .await
    .unwrap();
    if driver.databases().contains(DB_NAME).await.unwrap() {
        driver.databases().get(DB_NAME).await.unwrap().delete().await.unwrap();
    }
}

fn main() {
    async_std::task::block_on(async {
        cleanup().await;
        let driver = TypeDBDriver::new(
            TypeDBDriver::DEFAULT_ADDRESS,
            Credentials::new("admin", "password"),
            DriverOptions::new(false, None).unwrap(),
        )
        .await
        .unwrap();

        // Create a database
        driver.databases().create(DB_NAME).await.unwrap();
        let database = driver.databases().get(DB_NAME).await.unwrap();

        let options = TransactionOptions::new().transaction_timeout(Duration::from_secs(24 * 60 * 60));
        let transaction =
            driver.transaction_with_options(database.name(), TransactionType::Schema, options).await.unwrap();
        let define_query = r#"
        define entity person, owns name @card(0..), owns id @card(0..), owns bio @card(0..);
          attribute name value string;
          attribute id value integer;
          attribute bio value string;
          relation friendship relates friend @card(0..), owns bio @card(0..);
          person plays friendship:friend;
        "#;
        transaction.query(define_query).await.unwrap();
        transaction.commit().await.unwrap();

        let mut count = 0;
        while count < DATA_SIZE {
            let transaction =
                driver.transaction_with_options(database.name(), TransactionType::Write, options).await.unwrap();
            let left = DATA_SIZE - count;
            let to_generate = std::cmp::min(BATCH_SIZE, left);
            let query = generate_insert(to_generate);
            use std::time::Instant;
            let start = Instant::now();
            transaction.query(query).await.unwrap();
            let duration = start.elapsed();
            count += to_generate;
            println!("Processed {count}, took: {duration:?}");
            transaction.commit().await.unwrap();
        }
        println!("DONE!");
    });
}

pub fn generate_insert(batch_size: usize) -> String {
    use std::str::FromStr;

    use rand::Rng;
    let mut rng = rand::thread_rng();
    let mut result = String::from_str("insert\n").unwrap();

    fn random_str(rng: &mut impl rand::Rng, len: usize) -> String {
        rng.sample_iter(&rand::distributions::Alphanumeric).take(len).map(char::from).collect()
    }

    for i in 0..batch_size {
        let id1 = i;
        let id2 = batch_size + i;
        for j in [id1, id2] {
            let name = format!("\"{}-{}\"", random_str(&mut rng, 6), rng.gen::<u64>());
            let bio = format!("\"Bio: {}\"", random_str(&mut rng, 20));
            let id = rng.gen::<u64>();
            result.push_str(&format!("$p{} isa person, has name {}, has id {}, has bio {};\n", j, name, id, bio));
        }
        let friendship_bio =
            format!("\"Friendship#{}:{}-{}\"", rng.gen::<u32>(), random_str(&mut rng, 8), random_str(&mut rng, 6));
        result
            .push_str(&format!("(friend: $p{}, friend: $p{}) isa friendship, has bio {};\n", id1, id2, friendship_bio));
    }
    result
}
