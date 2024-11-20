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
use criterion::{Criterion, criterion_group, criterion_main, SamplingMode, Throughput};
use criterion::profiler::Profiler;
use pprof::ProfilerGuard;
use typedb_driver::{Connection, DatabaseManager, Session, SessionType, TransactionType};

const DB_NAME: &'static str = "benchmark";

fn prepare() -> Session {
    async_std::task::block_on(async {
        let connection = Connection::new_core("127.0.0.1:1729").expect("Expected driver");
        let db_manager = DatabaseManager::new(connection.clone());
        if db_manager.contains(DB_NAME).await.unwrap() {
            db_manager.get(DB_NAME).await.expect("Expected database get").delete().await.expect("Expected database delete");
        }
        db_manager.create(DB_NAME).await.expect("Expected database create");
        Session::new(db_manager.get(DB_NAME).await.expect("Expected database"), SessionType::Schema).await.expect("Expected session")
    })
}

fn open_transaction(session: &Session) {
    async_std::task::block_on(async {
        session.transaction(TransactionType::Read).await.expect("Expected transaction");
    })
}

fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("test transaction open");
    // group.sample_size(1000);
    // group.measurement_time(Duration::from_secs(200));
    group.sampling_mode(SamplingMode::Linear);

    let session = prepare();

    group.throughput(Throughput::Elements(1)); // calls/sec
    group.bench_function("transaction_open", |b| {
        b.iter(|| {
            open_transaction(&session)
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
