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


import {ConnectionOpenReq, ConnectionOpenRes} from "typedb-protocol/proto/connection";
import {
    DatabaseDeleteReq,
    DatabaseManagerAllReq,
    DatabaseManagerAllRes,
    DatabaseManagerContainsReq,
    DatabaseManagerCreateReq,
    DatabaseManagerGetReq,
    DatabaseManagerGetRes,
    DatabaseSchemaReq,
    DatabaseTypeSchemaReq
} from "typedb-protocol/proto/database";
import {TypeDBClient as GRPCStub} from "typedb-protocol/proto/typedb-service";
import {TypeDBDriverError} from "../errors/TypeDBDriverError";
import {RequestBuilder} from "./RequestBuilder";
import {ClientDuplexStream} from "@grpc/grpc-js";
import {TransactionCloseReq, TransactionOpenReq, TransactionOpenRes, TransactionClient, TransactionServer} from "typedb-protocol/proto/transaction";
import {
    UserManagerAllReq,
    UserManagerAllRes,
    UserManagerContainsReq,
    UserManagerCreateReq,
    UserManagerGetReq,
    UserManagerGetRes,
    UserDeleteReq,
    UserUpdateReq
} from "typedb-protocol/proto/user";
import {
    AuthenticationTokenCreateReq
} from "typedb-protocol/proto/authentication";
import {ErrorMessage} from "../errors/ErrorMessage";

/*
TODO implement ResilientCall
 */
export abstract class TypeDBStub {
    abstract open(): Promise<[number, string, DatabaseManagerAllRes]>;

    connectionOpen(req: ConnectionOpenReq): Promise<ConnectionOpenRes> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                this.stub().connection_open(req, (err, res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve(res);
                })
            })
        );
    }

    // TODO: Remove?
    // serversAll(req: ServerManagerAllReq): Promise<ServerManagerAllRes> {
    //     return this.mayRenewToken(() =>
    //         new Promise<ServerManagerAllRes>((resolve, reject) => {
    //             this.stub().servers_all(req, (err, res) => {
    //                 if (err) reject(new TypeDBDriverError(err));
    //                 else resolve(res);
    //             });
    //         })
    //     );
    // }

    databasesCreate(req: DatabaseManagerCreateReq): Promise<void> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                this.stub().databases_create(req, (err) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve();
                })
            })
        );
    }

    databasesContains(req: DatabaseManagerContainsReq): Promise<boolean> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                this.stub().databases_contains(req, (err, res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve(res.contains);
                });
            })
        );
    }

    databasesGet(req: DatabaseManagerGetReq): Promise<DatabaseManagerGetRes> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                this.stub().databases_get(req, (err, res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve(res);
                })
            })
        );
    }

    databasesAll(req: DatabaseManagerAllReq): Promise<DatabaseManagerAllRes> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                this.stub().databases_all(req, (err, res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve(res);
                })
            })
        );
    }

    databaseDelete(req: DatabaseDeleteReq): Promise<void> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                this.stub().database_delete(req, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            })
        );
    }

    databaseSchema(req: DatabaseSchemaReq): Promise<string> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                return this.stub().database_schema(req, (err, res) => {
                    if (err) reject(err);
                    else resolve(res.schema);
                });
            })
        );
    }

    databaseTypeSchema(req: DatabaseTypeSchemaReq): Promise<string> {
        return this.mayRenewToken(() =>
            new Promise((resolve, reject) => {
                return this.stub().database_type_schema(req, (err, res) => {
                    if (err) reject(err);
                    else resolve(res.schema);
                });
            })
        );
    }

    transactionOpen(openReq: TransactionOpenReq): Promise<TransactionOpenRes> {
        return new Promise<TransactionOpenRes>((resolve, reject) => {
            this.stub().session_open(openReq, (err, res) => {
                if (err) reject(new TypeDBDriverError(err));
                else resolve(res);
            });
        });
    }

    transactionClose(req: TransactionCloseReq): Promise<void> {
        return new Promise<void>((resolve, _reject) => {
            this.stub().session_close(req, (err, _res) => {
                if (err) {
                    console.warn("An error has occurred when issuing transaction close request: %o", err)
                }
                resolve();
            });
        });
    }

    transaction(): Promise<ClientDuplexStream<TransactionClient, TransactionServer>> {
        return new Promise<ClientDuplexStream<TransactionClient, TransactionServer>>(
            (resolve, reject) => {
                try {
                    resolve(this.stub().transaction());
                } catch (e) {
                    reject(e);
                }
            });
    }

    usersAll(req: UserManagerAllReq): Promise<UserManagerAllRes> {
        return this.mayRenewToken(() =>
            new Promise<UserManagerAllRes>((resolve, reject) => {
                this.stub().users_all(req, (err, res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve(res);
                });
            })
        );
    }

    usersContains(req: UserManagerContainsReq): Promise<boolean> {
        return this.mayRenewToken(() =>
            new Promise<boolean>((resolve, reject) => {
                this.stub().users_contains(req, (err, res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve(res.contains);
                })
            })
        );
    }

    usersGet(req: UserManagerGetReq): Promise<UserManagerGetRes> {
        return this.mayRenewToken(() =>
            new Promise<UserManagerGetRes>((resolve, reject) => {
                this.stub().users_get(req, (err, res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve(res);
                });
            })
        );
    }

    usersCreate(req: UserManagerCreateReq): Promise<void> {
        return this.mayRenewToken(() =>
            new Promise<void>((resolve, reject) => {
                this.stub().users_create(req, (err, _res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve();
                })
            })
        );
    }

    userDelete(req: UserDeleteReq): Promise<void> {
        return this.mayRenewToken(() =>
            new Promise<void>((resolve, reject) => {
                this.stub().user_delete(req, (err, _res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve();
                });
            })
        );
    }

    userUpdate(req: UserUpdateReq): Promise<void> {
        return this.mayRenewToken(() =>
            new Promise<void>((resolve, reject) => {
                this.stub().user_password_update(req, (err, _res) => {
                    if (err) reject(new TypeDBDriverError(err));
                    else resolve();
                })
            })
        );
    }

    authenticationTokenCreate(req: AuthenticationTokenCreateReq): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            return this.stub().authentication_token_create(req, (err, res) => {
                if (err) reject(err);
                else resolve(res.token);
            });
        });
    }

    abstract stub(): GRPCStub;

    close(): void {
        this.stub().close();
    }

    abstract mayRenewToken<RES>(fn: () => Promise<RES>): Promise<RES>;
}
