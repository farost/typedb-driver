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

import {User as UserProto} from "typedb-protocol/proto/user";
import {User} from "../api/connection/user/User";
import {RequestBuilder} from "../common/rpc/RequestBuilder";
import {DriverImpl} from "../connection/DriverImpl";

export class UserImpl implements User {
    private readonly _driver: DriverImpl;
    private readonly _username: string;

    constructor(driver: DriverImpl, username: string) {
        this._driver = driver;
        this._username = username;
    }

    static of(user: UserProto, driver: DriverImpl): UserImpl {
        return new UserImpl(driver, user.username);
    }

    async updatePassword(password: string): Promise<void> {
        return this._driver.users.runFailsafe((driver) =>
            driver.stub.userUpdate(RequestBuilder.User.updateReq(this.name, "", password))
        );
    }

    get name(): string {
        return this._username;
    }
}
