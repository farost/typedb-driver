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

import {DatabaseManager} from "./database/DatabaseManager";
import {UserManager} from "./user/UserManager";

export interface Driver {
    /**
     * Identifies the language of this driver implementation.
     */
    readonly LANGUAGE: string;

    /**
     * Checks whether this connection is presently open.
     *
     * ### Examples
     *
     * ```ts
     * driver.isOpen()
     * ```
     */
    isOpen(): boolean;

    /**
     * The <code>DatabaseManager</code> for this connection, providing access to database management methods.
     *
     * ### Examples
     *
     * ```ts
     * driver.databases()
     * ```
     */
    databases(): DatabaseManager;

    /**
     * Opens a communication tunnel (transaction) to the given database on the running TypeDB server.
     * @param database - The name of the database with which the transaction connects
     * @param type - The type of transaction to be created (READ, WRITE, or SCHEMA)
     *
     * ### Examples
     *
     * ```ts
     * driver.transaction(database, transactionType)
     * ```
     */
    transaction(database: string, type: Transaction.Type): Transaction;

    /**
     * Opens a communication tunnel (transaction) to the given database on the running TypeDB server.
     * @param database - The name of the database with which the transaction connects
     * @param type - The type of transaction to be created (READ, WRITE, or SCHEMA)
     * @param options - <code>TransactionOptions</code> to configure the opened transaction
     *
     * ### Examples
     *
     * ```ts
     * driver.transaction(database, transactionType, options)
     * ```
     */
    transaction(database: string, type: Transaction.Type, options: TransactionOptions): Transaction;

    /**
     * Closes the driver. Before instantiating a new driver, the driver that's currently open should first be closed.
     *
     * ### Examples
     *
     * ```ts
     * driver.close()
     * ```
     */
    close(): void;

    /**
     * The <code>UserManager</code> instance for this connection, providing access to user management methods.
     *
     * ### Examples
     *
     * ```ts
     * driver.users()
     * ```
     */
    users(): UserManager;
}