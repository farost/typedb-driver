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
use std::time::Duration;
use criterion::{Criterion, criterion_group, criterion_main, SamplingMode, Throughput};
use criterion::profiler::Profiler;
use pprof::ProfilerGuard;
use typedb_driver::TypeDBDriver;

fn create_driver() {
    async_std::task::block_on(async {
        let driver = TypeDBDriver::new_core(TypeDBDriver::DEFAULT_ADDRESS).await.expect("Expected driver");
        driver.force_close().expect("Close success");
        async_std::task::sleep(Duration::from_millis(1)).await;
    })
}

fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("test connection open");
    // group.sample_size(1000);
    // group.measurement_time(Duration::from_secs(200));
    group.sampling_mode(SamplingMode::Linear);

    group.throughput(Throughput::Elements(1)); // calls/sec
    group.bench_function("connection_open", |b| {
        b.iter(|| {
            create_driver()
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
