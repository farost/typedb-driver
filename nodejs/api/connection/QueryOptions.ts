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

import {OptionsQuery as QueryOptionsProto} from "typedb-protocol/proto/options";
import {ErrorMessage} from "../../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../../common/errors/TypeDBDriverError";
import NEGATIVE_VALUE_NOT_ALLOWED = ErrorMessage.Driver.NEGATIVE_VALUE_NOT_ALLOWED;

/** Interface specification for {@link QueryOptions}. */
export interface QueryOptionsSpec {
    /**
     * If set, specifies if types should be included in instance structs returned in ConceptRow answers.
     * This option allows reducing the amount of unnecessary data transmitted.
     * */
    includeInstanceTypes?: boolean;
    /**
     * If set, specifies the number of extra query responses sent before the client side has to re-request more responses.
     * Increasing this may increase performance for queries with a huge number of answers, as it can
     * reduce the number of network round-trips at the cost of more resources on the server side.
     * */
    prefetchSize?: number;
}

namespace QueryOptionsSpec {
    export function proto(options: QueryOptions): QueryOptionsProto {
        const optionsProto = new QueryOptionsProto();
        if (options) {
            if (options.includeInstanceTypes != null) optionsProto.includeInstanceTypes = options.includeInstanceTypes;
            if (options.prefetchSize != null) optionsProto.prefetchSize = options.prefetchSize;
        }
        return optionsProto;
    }
}

/**
 * TypeDB query options. <code>QueryOptions</code> object can be used to override
 * the default server behaviour for executed queries.
 *
 * ### Examples
 *
 * ```ts
 * queryOptions = new QueryOptions({"prefetchSize": 30})
 * queryOptions.prefetchSize(30)
 * ```
 */
export class QueryOptions implements QueryOptionsSpec {
    private _includeInstanceTypes: boolean;
    private _prefetchSize: number;

    constructor(obj: { [K in keyof QueryOptionsSpec]: QueryOptionsSpec[K] } = {}) {
        Object.assign(this, obj);
    }

    proto(): QueryOptionsProto {
        return QueryOptionsSpec.proto(this);
    }

    get includeInstanceTypes(): boolean | undefined {
        return this._includeInstanceTypes;
    }

    set includeInstanceTypes(value: boolean) {
        this._includeInstanceTypes = value;
    }

    get prefetchSize(): number | undefined {
        return this._prefetchSize;
    }

    set prefetchSize(value: number) {
        if (value < 1) {
            throw new TypeDBDriverError(NEGATIVE_VALUE_NOT_ALLOWED.message(value));
        }
        this._prefetchSize = value;
    }
}
