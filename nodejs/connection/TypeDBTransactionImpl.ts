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

import {TransactionReq, TransactionRes, TransactionResPart} from "typedb-protocol/proto/transaction";
import {ConceptManager} from "../api/concept/ConceptManager";
import {TransactionOptions} from "../api/connection/TransactionOptions";
import {TransactionType, Transaction} from "../api/connection/Transaction";
import {LogicManager} from "../api/logic/LogicManager";
import {QueryManager} from "../api/query/QueryManager";
import {ErrorMessage} from "../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../common/errors/TypeDBDriverError";
import {RequestBuilder} from "../common/rpc/RequestBuilder";
import {Stream} from "../common/util/Stream";
import {ConceptManagerImpl} from "../concept/ConceptManagerImpl";
import {LogicManagerImpl} from "../logic/LogicManagerImpl";
import {QueryManagerImpl} from "../query/QueryManagerImpl";
import {BidirectionalStream} from "../stream/BidirectionalStream";
import {TypeDBSessionImpl} from "./TypeDBSessionImpl";
import TRANSACTION_CLOSED = ErrorMessage.Driver.TRANSACTION_CLOSED;
import TRANSACTION_CLOSED_WITH_ERRORS = ErrorMessage.Driver.TRANSACTION_CLOSED_WITH_ERRORS;
import ILLEGAL_STATE = ErrorMessage.Internal.ILLEGAL_STATE;
import {DriverImpl, ServerDriver} from "./DriverImpl";
import {TypeDBDatabaseImpl} from "./TypeDBDatabaseImpl";
import {Database} from "../api/connection/database/Database";
import {TypeDBStub} from "../common/rpc/TypeDBStub";
import {RequestTransmitter} from "../stream/RequestTransmitter";

export class TypeDBTransactionImpl implements TypeDBTransaction.Extended {
    private readonly _database: string;
    private readonly _type: TransactionType;
    private readonly _options: TransactionOptions;
    private _bidirectionalStream: BidirectionalStream;
    private _conceptManager: ConceptManager;
    private _logicManager: LogicManager;
    private _queryManager: QueryManager;

    constructor(database: string, type: TransactionType, options: TransactionOptions) {
        this._database = database;
        this._type = type;
        this._options = options;
    }

    public async open(): Promise<void> {
        const rpcDriver = this._session.stub;
        this._bidirectionalStream = new BidirectionalStream(rpcDriver, this._session.requestTransmitter);
        await this._bidirectionalStream.open();
        this._conceptManager = new ConceptManagerImpl(this);
        this._logicManager = new LogicManagerImpl(this);
        this._queryManager = new QueryManagerImpl(this);
        const openReq = RequestBuilder.Transaction.openReq(this._database, this._type.proto(), this._options.proto(), this._session.networkLatency);
        await this.rpcExecute(openReq, false);
    }

    public async close(): Promise<void> {
        await this._bidirectionalStream.close();
        this._session.closed(this);
    }

    public onClose(callback: (error?: Error | string) => Promise<void>) {
        this._bidirectionalStream.onClose(callback)
    }

    public async commit(): Promise<void> {
        const commitReq = RequestBuilder.Transaction.commitReq();
        try {
            await this.rpcExecute(commitReq, false);
        } finally {
            await this.close();
        }
    }


    private readonly _driver: DriverImpl;
    private readonly _databaseName: string;
    private readonly _type: SessionType;
    private readonly _options: TransactionOptions;
    private _id: string;
    private _database: TypeDBDatabaseImpl;
    private _isOpen: boolean;
    private _serverDriver?: ServerDriver;
    private _pulse: NodeJS.Timeout;
    private _networkLatencyMillis: number;
    private readonly _transactions: Set<TypeDBTransaction.Extended>;
    private readonly _onClose: (() => Promise<void>)[]
    private readonly _onReopen: (() => Promise<void>)[]

    constructor(databaseName: string, type: SessionType, options: TransactionOptions, driver: DriverImpl) {
        this._databaseName = databaseName;
        this._type = type;
        this._options = options;
        this._driver = driver;
        this._isOpen = false;
        this._transactions = new Set();
        this._onClose = []
        this._onReopen = []
    }

    async open(): Promise<void> {
        this._database = await this._driver.databases.get(this._databaseName) as TypeDBDatabaseImpl;
        await this._database.runFailsafe(serverDriver => this.openAt(serverDriver));
    }

    private async reopenAt(serverDriver: ServerDriver): Promise<void> {
        await this.openAt(serverDriver);
        for (const callback of this._onReopen) {
            await callback();
        }
    }

    private async openAt(serverDriver: ServerDriver): Promise<void> {
        const openReq = RequestBuilder.Session.openReq(this._databaseName, this._type.proto(), this._options.proto())

        const start = (new Date()).getMilliseconds();
        const res = await serverDriver.stub.sessionOpen(openReq);
        const end = (new Date()).getMilliseconds();
        this._networkLatencyMillis = Math.max((end - start) - res.server_duration_millis, 1);

        this._id = "0x" + Buffer.from(res.session_id).toString("hex");
        this._serverDriver = serverDriver;
        this._isOpen = true;
        this._pulse = setTimeout(() => this.pulse(), 5000);
    }

    public onClose(callback: () => Promise<void>) {
        this._onClose.push(callback)
    }

    public onReopen(callback: () => Promise<void>) {
        this._onReopen.push(callback)
    }

    async close(): Promise<void> {
        if (this._isOpen) {
            await this.closeResources();
            const req = RequestBuilder.Transaction.closeReq();
            await this._serverDriver.stub.sessionClose(req);
        }
    }

    private async closeResources(): Promise<void> {
        this._isOpen = false;
        for (const tx of this._transactions) {
            await tx.close();
        }
        for (const callback of this._onClose) {
            await callback();
        }
        this._driver.closeTransaction(this);
        clearTimeout(this._pulse);
    }

    closed(transaction: TypeDBTransaction.Extended): void {
        this._transactions.delete(transaction);
    }

    get database(): Database {
        return this._database;
    }

    get id() {
        return this._id;
    }

    get stub(): TypeDBStub {
        return this._serverDriver.stub;
    }

    get requestTransmitter(): RequestTransmitter {
        return this._serverDriver.transmitter;
    }

    get networkLatency() {
        return this._networkLatencyMillis;
    }

    public async rollback(): Promise<void> {
        const rollbackReq = RequestBuilder.Transaction.rollbackReq();
        await this.rpcExecute(rollbackReq, false);
    }

    public get concepts(): ConceptManager {
        return this._conceptManager;
    }

    public get logic(): LogicManager {
        return this._logicManager;
    }

    public get query(): QueryManager {
        return this._queryManager;
    }

    public get options(): TransactionOptions {
        return this._options;
    }

    public get type(): TransactionType {
        return this._type;
    }

    public isOpen(): boolean {
        return this._bidirectionalStream.isOpen();
    }

    public async rpcExecute(request: TransactionReq, batch?: boolean): Promise<TransactionRes> {
        if (!this.isOpen()) this.throwTransactionClosed()
        const useBatch = batch !== false;
        return this._bidirectionalStream.single(request, useBatch);
    }

    public rpcStream(request: TransactionReq): Stream<TransactionResPart> {
        if (!this.isOpen()) this.throwTransactionClosed();
        return this._bidirectionalStream.stream(request);
    }

    private throwTransactionClosed(): void {
        if (this.isOpen()) throw new TypeDBDriverError(ILLEGAL_STATE);
        const error = this._bidirectionalStream.getError();
        if (!error) throw new TypeDBDriverError(TRANSACTION_CLOSED);
        else throw new TypeDBDriverError(TRANSACTION_CLOSED_WITH_ERRORS.message(error));
    }
}
