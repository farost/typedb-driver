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

import {
    TransactionReq,
    TransactionRes,
    TransactionResPart,
    TransactionType as TransactionTypeProto
} from "typedb-protocol/proto/transaction";
import {Stream} from "../../common/util/Stream";
import {TransactionOptions} from "./TransactionOptions";

export interface Transaction {
    /**
     * Checks whether this transaction is open.
     *
     * ### Examples
     *
     * ```ts
     * transaction.isOpen()
     * ```
     */
    isOpen(): boolean;

    /**
     * The transaction's type (READ, WRITE, or SCHEMA)
     *
     * ### Examples
     *
     * ```ts
     * transaction.getType()
     * ```
     */
    getType(): TransactionType;

    /**
     * The options for the transaction
     */
    options(): TransactionOptions;

    /**
     * Execute a TypeQL query in this transaction.
     * @param query - The query to execute.
     *
     * ### Examples
     *
     * ```ts
     * transaction.query("define entity person;")
     * ```
     */
    query(query: string): Promise<QueryAnswer>;

    /**
     * Execute a TypeQL query in this transaction.
     * @param query - The query to execute.
     * @param options - The <code>QueryOptions</code> to execute the query with.
     *
     * ### Examples
     *
     * ```ts
     * transaction.query("define entity person;", queryOptions)
     * ```
     */
    query(query: string, options: QueryOptions): Promise<QueryAnswer>;

    /**
     * Registers a callback function which will be executed when this transaction is closed.
     * @param callback - The callback function.
     *
     * ### Examples
     *
     * ```ts
     * transaction.onClose(function)
     * ```
     */
    onClose(callback: (error?: Error | string) => Promise<void>): void;

    /**
     * Commits the changes made via this transaction to the TypeDB database. Whether or not the transaction is commited successfully, it gets closed after the commit call.
     *
     * ### Examples
     *
     * ```ts
     * transaction.commit()
     * ```
     */
    commit(): void;

    /**
     * Rolls back the uncommitted changes made via this transaction.
     *
     * ### Examples
     *
     * ```ts
     * transaction.rollback()
     * ```
     */
    rollback(): void;

    /**
     * Closes the transaction.
     *
     * ### Examples
     *
     * ```ts
     * transaction.close()
     * ```
     */
    close(): void;
}

/**
 * Used to specify the type of transaction.
 *
 * ### Examples
 *
 * ```ts
 * driver.transaction(dbName, TransactionType.READ)
 * ```
 */
export interface TransactionType {
    proto(): TransactionTypeProto;

    /** Checks whether this is the READ TransactionType */
    isRead(): boolean;

    /** Checks whether this is the WRITE TransactionType */
    isWrite(): boolean;

    /** Checks whether this is the SCHEMA TransactionType */
    isSchema(): boolean;
}

export namespace TransactionType {
    class TransactionTypeImpl implements TransactionType {
        private readonly _type: TransactionTypeProto;

        constructor(type: TransactionTypeProto) {
            this._type = type;
        }

        proto(): TransactionTypeProto {
            return this._type;
        }

        isRead(): boolean {
            return this == READ;
        }

        isWrite(): boolean {
            return this == WRITE;
        }

        isSchema(): boolean {
            return this == SCHEMA;
        }
    }

    /** Constant used to specify a READ transaction must be created */
    export const READ = new TransactionTypeImpl(TransactionTypeProto.READ);
    /** Constant used to specify a WRITE transaction must be created */
    export const WRITE = new TransactionTypeImpl(TransactionTypeProto.WRITE);
    /** Constant used to specify a SCHEMA transaction must be created */
    export const SCHEMA = new TransactionTypeImpl(TransactionTypeProto.SCHEMA);
}

/** @ignore */
export namespace TypeDBTransaction {
    export interface Extended extends Transaction {
        rpcExecute(request: TransactionReq, batch?: boolean): Promise<TransactionRes>;

        rpcStream(request: TransactionReq): Stream<TransactionResPart>;
    }
}
