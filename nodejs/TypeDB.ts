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

import {Driver as TypeDBDriver} from "./api/connection/Driver";
import {Credentials} from "./api/connection/Credentials";
import {DriverImpl} from "./connection/DriverImpl";

export namespace TypeDB {
    export const DEFAULT_ADDRESS = "127.0.0.1:1729";

    /**
     * Open a TypeDB Driver to a TypeDB server available at the provided address.
     * @param address - The address of the TypeDB server.
     * @param credentials - The credentials to connect with. See <code>{@link Credentials}</code>
     * @param driverOptions - The connection settings to connect with. See <code>{@link DriverOptions}</code>
     *
     * ### Examples
     *
     * ```ts
     * const driver = TypeDB.driver(DEFAULT_ADDRESS, new Credentials(username, password), new DriverOptions(false, null));
     * ```
     */
    export function driver(address: string, credentials: Credentials, driverOptions: DriverOptions): Promise<TypeDBDriver> {
        return new DriverImpl(address, credentials, driverOptions).open();
    }
}
