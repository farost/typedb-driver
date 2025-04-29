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

import {Driver} from "../api/connection/Driver";
import {Credentials} from "../api/connection/Credentials";
import {TransactionOptions} from "../api/connection/TransactionOptions";
import {SessionType} from "../api/connection/TypeDBSession";
import {Database} from "../api/connection/database/Database";
import {ErrorMessage} from "../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../common/errors/TypeDBDriverError";
import {RequestBuilder} from "../common/rpc/RequestBuilder";
import {TypeDBStub} from "../common/rpc/TypeDBStub";
import {RequestTransmitter} from "../stream/RequestTransmitter";
import {UserImpl} from "../user/UserImpl";
import {UserManagerImpl} from "../user/UserManagerImpl";
import {TypeDBDatabaseManagerImpl} from "./TypeDBDatabaseManagerImpl";
import {TypeDBSessionImpl} from "./TypeDBSessionImpl";
import {TypeDBStubImpl} from "./TypeDBStubImpl";
import DRIVER_NOT_OPEN = ErrorMessage.Driver.DRIVER_NOT_OPEN;
import CLOUD_UNABLE_TO_CONNECT = ErrorMessage.Driver.CLOUD_UNABLE_TO_CONNECT;
import TRANSACTION_ID_EXISTS = ErrorMessage.Driver.TRANSACTION_ID_EXISTS;
import UNABLE_TO_CONNECT = ErrorMessage.Driver.UNABLE_TO_CONNECT;
import MISSING_PORT = ErrorMessage.Driver.MISSING_PORT;
import ADDRESS_TRANSLATION_MISMATCH = ErrorMessage.Driver.ADDRESS_TRANSLATION_MISMATCH;
import {DriverOptions} from "../api/connection/DriverOptions";
import {TypeDBTransactionImpl} from "./TypeDBTransactionImpl";
import {TransactionType} from "../api/connection/Transaction";
import {ResponseReader} from "../common/rpc/ResponseReader";
import Databases = ResponseReader.Databases;

export class DriverImpl implements Driver {
    private _isOpen: boolean;

    private readonly _address: string;
    private readonly _credentials: Credentials;
    private readonly _driverOptions: DriverOptions;
    private _userManager: UserManagerImpl;

    private readonly _serverDrivers: Map<string, ServerDriver>;

    private readonly _databases: TypeDBDatabaseManagerImpl;
    _database_cache: { [db: string]: Database };

    private readonly _transactions: { [id: string]: TypeDBTransactionImpl };

    constructor(address: string, credentials: Credentials, driverOptions: DriverOptions) {
        this._address = address;
        this._credentials = credentials;
        this._driverOptions = driverOptions;

        this._isOpen = false;
        this._serverDrivers = new Map([]);
        this._databases = new TypeDBDatabaseManagerImpl(this);
        this._database_cache = {};
        this._transactions = {};
    }

    async open(): Promise<Driver> {
        const serverStub = new TypeDBStubImpl(this._address, this._credentials, this._driverOptions);
        const [latency, connectionId, databases] = await serverStub.open();
        for (const db of Databases.of(this, databases)) {
            this._database_cache[db.name] = db;
        }
        this.serverDrivers.set(this._address, new ServerDriver(this._address, latency, connectionId, serverStub));
        this._isOpen = true;
        return this;
    }

    isOpen(): boolean {
        return this._isOpen;
    }

    async transaction(databaseName: string, type: TransactionType, options?: TransactionOptions): Promise<TypeDBTransactionImpl> {
        if (!this.isOpen()) throw new TypeDBDriverError(DRIVER_NOT_OPEN);
        if (!options) options = new TransactionOptions();
        const transaction = new TypeDBTransactionImpl(databaseName, type, options, this);
        await transaction.open(); // TODO: transaction ids? How to close them? Ignore for now?
        if (this._transactions[transaction.id]) throw new TypeDBDriverError(TRANSACTION_ID_EXISTS.message(transaction.id));
        this._transactions[transaction.id] = transaction;
        return transaction;
    }

    get databases(): TypeDBDatabaseManagerImpl {
        if (!this.isOpen()) throw new TypeDBDriverError(DRIVER_NOT_OPEN);
        return this._databases;
    }

    get users(): UserManagerImpl {
        if (!this.isOpen()) throw new TypeDBDriverError(DRIVER_NOT_OPEN);
        return this._userManager;
    }

    get serverDrivers(): Map<string, ServerDriver> {
        return this._serverDrivers;
    }

    async close(): Promise<void> {
        if (this.isOpen()) {
            this._isOpen = false;
            for (const serverDriver of Object.values(this._serverDrivers)) {
                await serverDriver.close();
            }
        }
    }

    closeTransaction(transaction: TypeDBTransactionImpl): void {
        delete this._transactions[transaction.id];
    }
}

export class ServerDriver {
    private readonly _address: string;
    private readonly _stub: TypeDBStub;
    private readonly _requestTransmitter: RequestTransmitter;
    private readonly _latency: number;
    private readonly _connectionId: string;

    constructor(address: string, latency: number, connectionId: string, stub: TypeDBStub) {
        this._address = address;
        this._latency = latency;
        this._connectionId = connectionId;
        this._stub = stub;
        this._requestTransmitter = new RequestTransmitter();
    }

    get address(): string {
        return this._address;
    }

    get stub():TypeDBStub {
        return this._stub;
    }

    get transmitter(): RequestTransmitter {
        return this._requestTransmitter;
    }

    close(): void {
        this.stub.close();
    }
}
