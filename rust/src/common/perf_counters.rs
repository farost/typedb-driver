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
    fmt::Write as _,
    sync::{
        OnceLock,
        atomic::{AtomicU64, Ordering},
    },
    thread,
    time::Duration,
};

pub const PERF_COUNTERS_ENABLED: bool = true;

pub struct Counter {
    count: AtomicU64,
    enabled: bool,
}

impl Counter {
    pub const fn new(enabled: bool) -> Self {
        Self { count: AtomicU64::new(0), enabled }
    }

    #[inline]
    pub fn increment(&self) {
        if self.enabled {
            self.count.fetch_add(1, Ordering::Relaxed);
        }
    }

    pub fn value(&self) -> u64 {
        self.count.load(Ordering::Relaxed)
    }
}

pub struct Timer {
    count: AtomicU64,
    nanos: AtomicU64,
    enabled: bool,
}

impl Timer {
    pub const fn new(enabled: bool) -> Self {
        Self { count: AtomicU64::new(0), nanos: AtomicU64::new(0), enabled }
    }

    #[inline]
    pub fn record(&self, nanos: u64) {
        if self.enabled {
            self.count.fetch_add(1, Ordering::Relaxed);
            self.nanos.fetch_add(nanos, Ordering::Relaxed);
        }
    }

    pub fn count(&self) -> u64 {
        self.count.load(Ordering::Relaxed)
    }

    pub fn nanos(&self) -> u64 {
        self.nanos.load(Ordering::Relaxed)
    }
}

// === Counters / timers for hotspots ===

pub static EXECUTE_STRONGLY_CONSISTENT: Timer = Timer::new(PERF_COUNTERS_ENABLED);
pub static EXECUTE_STRONGLY_CONSISTENT_RETRY_LOOP_ITERS: Counter = Counter::new(PERF_COUNTERS_ENABLED);
pub static GET_OR_SEEK_PRIMARY_REPLICA_CALLS: Counter = Counter::new(PERF_COUNTERS_ENABLED);
pub static GET_OR_SEEK_PRIMARY_REPLICA_HASHSET_ALLOCS: Counter = Counter::new(PERF_COUNTERS_ENABLED);
pub static SEEK_PRIMARY_REPLICA_CALLS: Counter = Counter::new(PERF_COUNTERS_ENABLED);
pub static RPC_STUB_SINGLE: Timer = Timer::new(PERF_COUNTERS_ENABLED);
pub static RPC_STUB_SINGLE_TIMEOUT_OVERHEAD: Counter = Counter::new(PERF_COUNTERS_ENABLED);
pub static OPEN_TRANSACTION: Timer = Timer::new(PERF_COUNTERS_ENABLED);
pub static LATENCY_TRACKER_UPDATE: Counter = Counter::new(PERF_COUNTERS_ENABLED);
pub static READ_REPLICA_CONNECTIONS_CALLS: Counter = Counter::new(PERF_COUNTERS_ENABLED);
pub static DATABASE_MANAGER_GET_CALLS: Counter = Counter::new(PERF_COUNTERS_ENABLED);

struct CounterEntry {
    name: &'static str,
    counter: &'static Counter,
}

struct TimerEntry {
    name: &'static str,
    timer: &'static Timer,
}

const COUNTERS: &[CounterEntry] = &[
    CounterEntry { name: "EXECUTE_STRONGLY_CONSISTENT_RETRY_LOOP_ITERS", counter: &EXECUTE_STRONGLY_CONSISTENT_RETRY_LOOP_ITERS },
    CounterEntry { name: "GET_OR_SEEK_PRIMARY_REPLICA_CALLS", counter: &GET_OR_SEEK_PRIMARY_REPLICA_CALLS },
    CounterEntry { name: "GET_OR_SEEK_PRIMARY_REPLICA_HASHSET_ALLOCS", counter: &GET_OR_SEEK_PRIMARY_REPLICA_HASHSET_ALLOCS },
    CounterEntry { name: "SEEK_PRIMARY_REPLICA_CALLS", counter: &SEEK_PRIMARY_REPLICA_CALLS },
    CounterEntry { name: "RPC_STUB_SINGLE_TIMEOUT_OVERHEAD", counter: &RPC_STUB_SINGLE_TIMEOUT_OVERHEAD },
    CounterEntry { name: "LATENCY_TRACKER_UPDATE", counter: &LATENCY_TRACKER_UPDATE },
    CounterEntry { name: "READ_REPLICA_CONNECTIONS_CALLS", counter: &READ_REPLICA_CONNECTIONS_CALLS },
    CounterEntry { name: "DATABASE_MANAGER_GET_CALLS", counter: &DATABASE_MANAGER_GET_CALLS },
];

const TIMERS: &[TimerEntry] = &[
    TimerEntry { name: "EXECUTE_STRONGLY_CONSISTENT", timer: &EXECUTE_STRONGLY_CONSISTENT },
    TimerEntry { name: "RPC_STUB_SINGLE", timer: &RPC_STUB_SINGLE },
    TimerEntry { name: "OPEN_TRANSACTION", timer: &OPEN_TRANSACTION },
];

fn format_duration_nanos(nanos: u64) -> String {
    if nanos < 1_000 {
        format!("{}ns", nanos)
    } else if nanos < 1_000_000 {
        format!("{:.3}us", nanos as f64 / 1_000.0)
    } else if nanos < 1_000_000_000 {
        format!("{:.3}ms", nanos as f64 / 1_000_000.0)
    } else {
        format!("{:.3}s", nanos as f64 / 1_000_000_000.0)
    }
}

pub fn dump() -> String {
    let mut out = String::new();
    for entry in COUNTERS {
        let _ = writeln!(out, "[perf] {} n={}", entry.name, entry.counter.value());
    }
    for entry in TIMERS {
        let count = entry.timer.count();
        let nanos = entry.timer.nanos();
        let total = format_duration_nanos(nanos);
        let avg = if count > 0 { format_duration_nanos(nanos / count) } else { "0ns".to_string() };
        let _ = writeln!(out, "[perf] {} n={} total={} avg={}", entry.name, count, total, avg);
    }
    out
}

static PERIODIC_DUMP_THREAD: OnceLock<()> = OnceLock::new();

pub fn spawn_periodic_dump(interval: Duration) {
    if !PERF_COUNTERS_ENABLED {
        return;
    }
    let _ = PERIODIC_DUMP_THREAD.get_or_init(|| {
        thread::Builder::new()
            .name("typedb-driver-perf-dump".to_string())
            .spawn(move || {
                loop {
                    thread::sleep(interval);
                    let snapshot = dump();
                    eprint!("{}", snapshot);
                }
            })
            .ok();
    });
}
