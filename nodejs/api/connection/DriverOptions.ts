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

import * as fs from "fs";
import {ErrorMessage} from "../../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../../common/errors/TypeDBDriverError";
import CLOUD_INVALID_ROOT_CA_PATH = ErrorMessage.Driver.CLOUD_INVALID_ROOT_CA_PATH;

/**
 * User connection settings (TLS encryption, etc.) for connecting to TypeDB Server.
 *
 * ### Examples
 *
 * ```ts
 * driverOptions = new DriverOptions(true, "path/to/ca-certificate.pem")
 * ```
 */
export class DriverOptions {
    private readonly _isTlsEnabled: boolean;
    private readonly _tlsRootCAPath: string;
    /**
     * @param isTlsEnabled - Specify whether the connection to TypeDB Server must be done over TLS.
     * @param tlsRootCAPath - Path to the CA certificate to use for authenticating server certificates.
    */
    constructor(isTlsEnabled: boolean, tlsRootCAPath: string) {
        this._isTlsEnabled = isTlsEnabled;

        if (tlsRootCAPath != null && !fs.existsSync(tlsRootCAPath)) {
            throw new TypeDBDriverError(CLOUD_INVALID_ROOT_CA_PATH.message(tlsRootCAPath));
        }
        this._tlsRootCAPath = tlsRootCAPath;
    }

    get isTlsEnabled(): boolean {
        return this._isTlsEnabled;
    }

    get tlsRootCAPath(): string {
        return this._tlsRootCAPath;
    }
}
