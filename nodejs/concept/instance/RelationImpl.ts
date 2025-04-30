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

import {Relation as RelationProto} from "typedb-protocol/proto/concept";
import {Relation} from "../../api/concept/instance/Relation";
import {Instance} from "../../api/concept/instance/Instance";
import {RelationType} from "../../api/concept/type/RelationType";
import {RoleType} from "../../api/concept/type/RoleType";
import {Transaction} from "../../api/connection/Transaction";
import {RequestBuilder} from "../../common/rpc/RequestBuilder";
import {Bytes} from "../../common/util/Bytes";
import {Stream} from "../../common/util/Stream";
import {RelationTypeImpl, RoleTypeImpl, InstanceImpl} from "../../dependencies_internal";

export class RelationImpl extends InstanceImpl implements Relation {
    private readonly _type: RelationType;

    constructor(iid: string, inferred: boolean, type: RelationType) {
        super(iid, inferred);
        this._type = type;
    }

    protected get className(): string {
        return "Relation";
    }

    get type(): RelationType {
        return this._type;
    }

    isRelation(): boolean {
        return true;
    }

    asRelation(): Relation {
        return this;
    }
}

export namespace RelationImpl {
    export function ofRelationProto(proto: RelationProto) {
        if (!proto) return null;
        const iid = Bytes.bytesToHexString(proto.iid);
        return new RelationImpl(iid, RelationTypeImpl.ofRelationTypeProto(proto.relation_type));
    }
}
