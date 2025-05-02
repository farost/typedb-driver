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
    Value as ValueProto,
    ValueType,
} from "typedb-protocol/proto/concept";
import {OptionsTransaction, OptionsQuery} from "typedb-protocol/proto/options";
import {
    QueryReq,
} from "typedb-protocol/proto/query";
import {Version} from "typedb-protocol/proto/version";
import * as uuid from "uuid";
import {Bytes} from "../util/Bytes";
import {
    AuthenticationTokenCreateReq
} from "typedb-protocol/proto/authentication";
import {
    UserManagerAllReq,
    UserManagerContainsReq,
    UserManagerCreateReq,
    UserManagerGetReq,
    UserUpdateReq,
    UserDeleteReq,
    User as UserProto
} from "typedb-protocol/proto/user";
import {
    DatabaseDeleteReq,
    DatabaseManagerAllReq,
    DatabaseManagerContainsReq,
    DatabaseManagerCreateReq,
    DatabaseManagerGetReq,
    DatabaseSchemaReq,
    DatabaseTypeSchemaReq
} from "typedb-protocol/proto/database";
import {
    TransactionClient,
    TransactionCommitReq,
    TransactionOpenReq,
    TransactionReq,
    TransactionRollbackReq,
    TransactionCloseReq,
    TransactionStreamReq,
    TransactionType
} from "typedb-protocol/proto/transaction";
import {ServerManagerAllReq} from "typedb-protocol/proto/server";
import {ConnectionOpenReq} from "typedb-protocol/proto/connection";
import {ErrorMessage} from "../errors/ErrorMessage";
import {TypeDBDriverError} from "../errors/TypeDBDriverError";
import BAD_VALUE_TYPE = ErrorMessage.Concept.BAD_VALUE_TYPE;
import {Credentials} from "../../api/connection/Credentials";


/* eslint no-inner-declarations: "off" */
export namespace RequestBuilder {
    export namespace Authentication {
        export function tokenCreateReq(username: string, password: string) {
            return new AuthenticationTokenCreateReq({username: username, password: password });
        }
    }

    export namespace DatabaseManager {
        export function getReq(name: string) {
            return new DatabaseManagerGetReq({name: name});
        }

        export function createReq(name: string) {
            return new DatabaseManagerCreateReq({name: name});
        }

        export function containsReq(name: string) {
            return new DatabaseManagerContainsReq({name: name});
        }

        export function allReq() {
            return new DatabaseManagerAllReq();
        }
    }

    export namespace Database {
        export function schemaReq(name: string) {
            return new DatabaseSchemaReq({name: name});
        }

        export function typeSchemaReq(name: string) {
            return new DatabaseTypeSchemaReq({name: name});
        }

        export function deleteReq(name: string) {
            return new DatabaseDeleteReq({name: name});
        }
    }

    export namespace ServerManager {
        export function allReq() {
            return new ServerManagerAllReq();
        }
    }

    export namespace UserManager {
        export function containsReq(username: string): UserManagerContainsReq {
            return new UserManagerContainsReq({name: username});
        }

        export function createReq(username: string, password: string): UserManagerCreateReq {
            return new UserManagerCreateReq({name: username, password: password});
        }

        export function allReq(): UserManagerAllReq {
            return new UserManagerAllReq();
        }

        export function getReq(name: string): UserManagerGetReq {
            return new UserManagerGetReq({name: name});
        }
    }

    export namespace User {
        export function updateReq(username: string, new_username: string, new_password: string): UserUpdateReq {
            return new UserUpdateReq({name: username, user: new UserProto({name: new_username, password: new_password})});
        }

        export function deleteReq(username: string): UserDeleteReq {
            return new UserDeleteReq({name: username});
        }
    }

    export namespace Connection {
        export function openReq(driver_lang: string, driver_version: string, credentials: Credentials) {
            const authentication = Authentication.tokenCreateReq(credentials.username, credentials.password);
            return new ConnectionOpenReq({version: Version.VERSION, driver_lang, driver_version, authentication})
        }
    }

    export namespace Transaction {
        export function clientReq(reqs: TransactionReq[]) {
            return new TransactionClient({reqs: reqs});
        }

        export function openReq(database: string, type: TransactionType, options: OptionsTransaction, latencyMillis: number) {
            return new TransactionReq({
                open_req:
                    new TransactionOpenReq({
                        database: database,
                        type: type,
                        options: options,
                        network_latency_millis: latencyMillis
                    })
            });
        }

        export function commitReq() {
            return new TransactionReq({commit_req: new TransactionCommitReq()});
        }

        export function rollbackReq() {
            return new TransactionReq({rollback_req: new TransactionRollbackReq()});
        }

        export function closeReq() {
            return new TransactionReq({close_req: new TransactionCloseReq()});
        }

        export function streamReq(requestId: string) {
            return new TransactionReq({
                req_id: uuid.parse(requestId) as Uint8Array,
                stream_req: new TransactionStreamReq()
            });
        }

        export function queryReq(query: string, options: OptionsQuery) {
            return new QueryReq({ query: query, options: options });
        }
    }

    export namespace Value {
        export function protoValue(valueType: ValueType, value: boolean | string | number | Date): ValueProto {
            switch (valueType) {
                case ValueType.BOOLEAN: return new ValueProto({boolean: value as boolean});
                case ValueType.INTEGER: return new ValueProto({integer: value as number});
                case ValueType.DOUBLE: return new ValueProto({double: value as number});
                case ValueType.DECIMAL: return new ValueProto({decimal: value as number});
                case ValueType.STRING: return new ValueProto({string: value as string});
                case ValueType.DATE: return new ValueProto({date_time: (value as Date).getDate()});
                case ValueType.DATETIME: return new ValueProto({date_time: (value as Date).getTime()});
                case ValueType.DATETIME_TZ: return new ValueProto({date_time: (value as Date)}); // TODO: Tz
                case ValueType.DURATION: return new ValueProto({date_time: (value as string)}); // TODO: Duration
                default: throw new TypeDBDriverError(BAD_VALUE_TYPE.message());
            }
        }
    }
}
