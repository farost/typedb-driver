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

import {OptionsTransaction as TransactionOptionsProto} from "typedb-protocol/proto/options";
import {ErrorMessage} from "../../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../../common/errors/TypeDBDriverError";
import NEGATIVE_VALUE_NOT_ALLOWED = ErrorMessage.Driver.NEGATIVE_VALUE_NOT_ALLOWED;

/** Interface specification for {@link TransactionOptions}. */
export interface TransactionOptionsSpec {
    /** If set, specifies a timeout for killing transactions automatically, preventing memory leaks in unclosed transactions. */
    transactionTimeoutMillis?: number;
    /** If set, specifies how long the driver should wait if opening a transaction is blocked by an exclusive schema write lock. */
    schemaLockAcquireTimeoutMillis?: number;
}

namespace TransactionOptionsSpec {
    export function proto(options: TransactionOptions): TransactionOptionsProto {
        const optionsProto = new TransactionOptionsProto();
        if (options) {
            if (options.transactionTimeoutMillis != null) optionsProto.transaction_timeout_millis = options.transactionTimeoutMillis;
            if (options.schemaLockAcquireTimeoutMillis != null) optionsProto.schema_lock_acquire_timeout_millis = options.schemaLockAcquireTimeoutMillis;
        }
        return optionsProto;
    }
}

/**
 * TypeDB transaction options. <code>TransactionOptions</code> object can be used to override
 * the default server behaviour for opened transactions.
 *
 * ### Examples
 *
 * ```ts
 * transactionOptions = new TransactionOptions({"transactionTimeoutMillis": 30000})
 * transactionOptions.transactionTimeoutMillis(30000)
 * ```
 */
export class TransactionOptions implements TransactionOptionsSpec {
    private _transactionTimeoutMillis: number;
    private _schemaLockAcquireTimeoutMillis: number;

    constructor(obj: { [K in keyof TransactionOptionsSpec]: TransactionOptionsSpec[K] } = {}) {
        Object.assign(this, obj);
    }

    proto(): TransactionOptionsProto {
        return TransactionOptionsSpec.proto(this);
    }

    get transactionTimeoutMillis(): number | undefined {
        return this._transactionTimeoutMillis;
    }

    set transactionTimeoutMillis(millis: number) {
        if (millis < 1) {
            throw new TypeDBDriverError(NEGATIVE_VALUE_NOT_ALLOWED.message(millis));
        }
        this._transactionTimeoutMillis = millis;
    }

    get schemaLockAcquireTimeoutMillis(): number | undefined {
        return this._schemaLockAcquireTimeoutMillis;
    }

    set schemaLockAcquireTimeoutMillis(value: number) {
        if (value < 1) {
            throw new TypeDBDriverError(NEGATIVE_VALUE_NOT_ALLOWED.message(value));
        }
        this._schemaLockAcquireTimeoutMillis = value;
    }
}
