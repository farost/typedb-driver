/*
 * Copyright (C) 2021 Vaticle
 *
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

use std::fmt::{Debug, Formatter};
use std::sync::{Arc, Mutex};
use std::thread::sleep;
use std::time::Duration;
use typedb_protocol::transaction::{Transaction_Req, Transaction_Res, Transaction_ResPart, Transaction_Type};

use crate::common::Result;
use crate::rpc;
use crate::rpc::builder::transaction::{open_req, commit_req, rollback_req};
use crate::rpc::client::RpcClient;
use crate::query::QueryManager;

#[derive(Copy, Clone, Debug)]
pub enum Type {
    Read = 0,
    Write = 1
}

impl From<Type> for Transaction_Type {
    fn from(transaction_type: Type) -> Self {
        match transaction_type {
            Type::Read => Transaction_Type::READ,
            Type::Write => Transaction_Type::WRITE
        }
    }
}

#[derive(Clone)]
pub struct Transaction {
    pub transaction_type: Type,
    rpc: Arc<Mutex<rpc::transaction::TransactionRpc>>,
    pub query: QueryManager,
}

impl Transaction {
    // TODO: check if these borrows hamper ability to open transactions in parallel
    pub(crate) async fn new(session_id: &Vec<u8>, transaction_type: Type, network_latency_millis: u32, rpc_client: &RpcClient) -> Result<Self> {
        let open_req = open_req(session_id.clone(), Transaction_Type::from(transaction_type), network_latency_millis);
        let rpc: Arc<Mutex<rpc::transaction::TransactionRpc>> = Arc::new(Mutex::new(rpc::transaction::TransactionRpc::new(rpc_client).await?));
        Arc::clone(&rpc).lock().unwrap().single(open_req).await.unwrap();
        Ok(Transaction {
            transaction_type,
            rpc: Arc::clone(&rpc),
            query: QueryManager::new(Arc::clone(&rpc))
        })
    }

    pub async fn commit(&mut self) -> Result {
        self.single_rpc(commit_req()).await.map(|_| ())
    }

    pub async fn rollback(&mut self) -> Result {
        self.single_rpc(rollback_req()).await.map(|_| ())
    }

    pub(crate) async fn single_rpc(&mut self, req: Transaction_Req) -> Result<Transaction_Res> {
        self.rpc.lock().unwrap().single(req).await
    }

    // pub async fn commit(&mut self) -> Result<Transaction_Res> {
    //     self.single_rpc(commit_req()).await
    // }
    //
    // pub async fn rollback(&mut self) -> Result<Transaction_Res> {
    //     self.single_rpc(rollback_req()).await
    // }
    //
    // pub(crate) async fn single_rpc(&mut self, req: Transaction_Req) -> Result<Transaction_Res> {
    //     self.rpc.lock().await.single_rpc(req).await
    // }

    // pub(crate) async fn streaming_rpc(&mut self, req: Transaction_Req) -> Result<Vec<Transaction_ResPart>> {
    //     self.rpc.lock().await.streaming_rpc(req).await
    // }
}

impl Debug for Transaction {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "Transaction(type = {:?})", self.transaction_type)
    }
}