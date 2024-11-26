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
    ffi::c_int,
    fs::File,
    path::Path,
};
use futures::{StreamExt, TryStreamExt};
use criterion::{Criterion, criterion_group, criterion_main, SamplingMode, Throughput};
use criterion::profiler::Profiler;
use pprof::ProfilerGuard;
use typedb_driver::{Transaction, TransactionType, TypeDBDriver, answer::ConceptRow, answer::ConceptDocument};

const DB_NAME: &'static str = "benchmark";
const SCHEMA_QUERY: &'static str = "
define
  entity person, owns name, owns age;
  attribute name, value string;
  attribute age, value long;";

fn prepare() -> Transaction {
    async_std::task::block_on(async {
        let driver = TypeDBDriver::new_core(TypeDBDriver::DEFAULT_ADDRESS).await.expect("Expected driver");
        if driver.databases().contains(DB_NAME).await.unwrap() {
            driver.databases().get(DB_NAME).await.expect("Expect database get").delete().await.expect("Expected database delete");
        }
        driver.databases().create(DB_NAME).await.expect("Expect database create");
        let tx = driver.transaction(DB_NAME, TransactionType::Schema).await.expect("Expected transaction");
        async_std::task::block_on(async {
            tx.query(SCHEMA_QUERY).await.expect("Expected query result");
        });
        tx
    })
}

fn prepare_write_query() -> String {
    let mut query = String::from("insert");
    for i in 0..1 {
        query.push_str(&format!(r#" $p{} isa person, has name "John", has age {};"#, i, i));
    }
    query
}

fn prepare_read_query() -> String {
    let mut query = String::from("match");
    for i in 0..1 {
        query.push_str(&format!(r#" $p{} isa person, has name "John", has age {};"#, i, i));
    }
    query.push_str("\nfetch {\n");
    for i in 0..50 {
        query.push_str(&format!(r#""{}": $p0.age,"#, i));
        query.push_str("\n");
    }
    query.push_str(" };");
    query
}

fn do_write_query(transaction: &Transaction, write_query: &str, read_query: &str) {
    async_std::task::block_on(async {
        transaction.query(write_query).await.expect("Expected write query result");
        let document: Vec<ConceptDocument> = transaction.query(read_query).await.expect("Expected read query result").into_documents().try_collect().await.expect("WAkflawf");
        // println!("document: {}", document.into_json());
    });
}

fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("test large write query");
    group.sample_size(10);
    group.measurement_time(std::time::Duration::from_secs(100));
    group.sampling_mode(SamplingMode::Linear);

    let transaction = prepare();
    let write_query = prepare_write_query();
    let read_query = prepare_read_query();

    group.throughput(Throughput::Elements(1)); // calls/sec
    group.bench_function("large write query", |b| {
        b.iter(|| {
            do_write_query(&transaction, &write_query, &read_query)
        });
    });
    group.finish();
}

pub struct FlamegraphProfiler<'a> {
    frequency: c_int,
    active_profiler: Option<ProfilerGuard<'a>>,
}

impl<'a> FlamegraphProfiler<'a> {
    #[allow(dead_code)]
    pub fn new(frequency: c_int) -> Self {
        Self { frequency, active_profiler: None }
    }
}

impl<'a> Profiler for FlamegraphProfiler<'a> {
    fn start_profiling(&mut self, _benchmark_id: &str, _benchmark_dir: &Path) {
        self.active_profiler = Some(ProfilerGuard::new(self.frequency).unwrap());
    }

    fn stop_profiling(&mut self, _benchmark_id: &str, benchmark_dir: &Path) {
        std::fs::create_dir_all(benchmark_dir).unwrap();
        let flamegraph_path = benchmark_dir.join("flamegraph.svg");
        let flamegraph_file = File::create(flamegraph_path).expect("File system error while creating flamegraph.svg");
        if let Some(profiler) = self.active_profiler.take() {
            profiler.report().build().unwrap().flamegraph(flamegraph_file).expect("Error writing flamegraph");
        }
    }
}

fn profiled() -> Criterion {
    Criterion::default().with_profiler(FlamegraphProfiler::new(10))
}

// criterion_group!(
//     name = benches;
//     config= profiled();
//     targets = criterion_benchmark
// );

// TODO: disable profiling when running on mac, since pprof seems to crash sometimes?
criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
