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

import {QueryType as QueryTypeProto} from "typedb-protocol/proto/query";

export interface QueryType {
    proto(): QueryTypeProto;

    /** Checks whether this is the READ QueryType */
    isRead(): boolean;

    /** Checks whether this is the WRITE QueryType */
    isWrite(): boolean;

    /** Checks whether this is the SCHEMA QueryType */
    isSchema(): boolean;
}

export namespace QueryType {
    class QueryTypeImpl implements QueryType {
        private readonly _type: QueryTypeProto;

        constructor(type: QueryTypeProto) {
            this._type = type;
        }

        proto(): QueryTypeProto {
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

    /** Constant used to specify a READ query type must be created */
    export const READ = new QueryTypeImpl(QueryTypeProto.READ);
    /** Constant used to specify a WRITE query type must be created */
    export const WRITE = new QueryTypeImpl(QueryTypeProto.WRITE);
    /** Constant used to specify a SCHEMA query type must be created */
    export const SCHEMA = new QueryTypeImpl(QueryTypeProto.SCHEMA);
}
