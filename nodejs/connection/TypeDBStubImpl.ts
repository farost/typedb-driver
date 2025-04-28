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

import {CallCredentials, ChannelCredentials, credentials, Metadata, ServiceError} from "@grpc/grpc-js";
import * as fs from "fs";
import {Credentials} from "../api/connection/Credentials";
import {TypeDBDriverError} from "../common/errors/TypeDBDriverError";
import {TypeDBStub} from "../common/rpc/TypeDBStub";
import {RequestBuilder} from "../common/rpc/RequestBuilder";
import {ErrorMessage} from "../common/errors/ErrorMessage";
import {TypeDBClient as GRPCStub} from "typedb-protocol/proto/typedb-service";
import TOKEN_CREDENTIAL_INVALID = ErrorMessage.Driver.CLOUD_TOKEN_CREDENTIAL_INVALID;
import {DriverOptions} from "../api/connection/DriverOptions";

function isServiceError(e: any): e is ServiceError {
    return "code" in e;
}

export class TypeDBStubImpl extends TypeDBStub {
    private readonly _credentials: Credentials;
    private readonly _driverOptions: DriverOptions;
    private _token: string;
    private readonly _stub: GRPCStub;

    constructor(address: string, credential: Credentials, driverOptions: DriverOptions) {
        super();
        this._credentials = credential;
        this._driverOptions = driverOptions;
        this._token = null;
        const stubCredentials = this.createChannelCredentials();
        this._stub = new GRPCStub(address, stubCredentials);
    }

    public async open(): Promise<void> {
        try {
            await this.connectionOpen(RequestBuilder.Connection.openReq());
            if (this._credentials) {
                const req = RequestBuilder.User.tokenReq(this._credentials.username);
                this._token = await this.userToken(req);
            }
        } catch (e) {
            if (!isServiceError(e)) throw e;
        }
    }

    private createChannelCredentials(): ChannelCredentials {
        const callCreds = this.createCallCredentials();
        if (this._driverOptions.isTlsEnabled) {
            const rootCert = fs.readFileSync(this._driverOptions.tlsRootCAPath);
            return credentials.combineChannelCredentials(ChannelCredentials.createSsl(rootCert), callCreds);
        } else {
            return credentials.combineChannelCredentials(ChannelCredentials.createSsl(), callCreds);
        }
    }

    // TODO:

    private createCallCredentials(): CallCredentials {
        const metaCallback = (_params: any, callback: any) => {
            const metadata = new Metadata();
            if (this._token != null) {
                metadata.add('authorization', 'Bearer ' + this._token);
            }
            callback(null, metadata);
        }
        return CallCredentials.createFromMetadataGenerator(metaCallback);
    }

    private async renewToken() {
        this._token = null;
        const req = RequestBuilder.User.tokenReq(this._credentials.username);
        this._token = await this.userToken(req);
    }

    async mayRenewToken<RES>(fn: () => Promise<RES>): Promise<RES> {
        try {
            return await fn();
        } catch (e) {
            if (!this._credentials) throw e;  // core stub
            if (e instanceof TypeDBDriverError && TOKEN_CREDENTIAL_INVALID === e.messageTemplate) {
                console.log(`token '${this._token}' expired. renewing...`);
                await this.renewToken();
                console.log(`token renewed to '${this._token}'`);
                try {
                    return await fn();
                } catch (e2) {
                    if (isServiceError(e2)) {
                        throw new TypeDBDriverError(e2);
                    } else throw e2;
                }
            } else throw e;
        }
    }

    stub(): GRPCStub {
        return this._stub;
    }
}
