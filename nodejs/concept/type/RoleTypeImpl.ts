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

import {RoleType as RoleTypeProto, RoleTypeRes, RoleTypeResPart} from "typedb-protocol/proto/concept";
import {Relation} from "../../api/concept/instance/Relation";
import {Instance} from "../../api/concept/instance/Instance";
import {RelationType} from "../../api/concept/type/RelationType";
import {RoleType} from "../../api/concept/type/RoleType";
import {ThingType} from "../../api/concept/type/ThingType";
import {Transaction} from "../../api/connection/Transaction";
import {Label} from "../../common/Label";
import {RequestBuilder} from "../../common/rpc/RequestBuilder";
import {Stream} from "../../common/util/Stream";
import {RelationImpl, RelationTypeImpl, InstanceImpl, ThingTypeImpl, TypeImpl} from "../../dependencies_internal";
import {Concept} from "../../api/concept/Concept";
import {TransactionReq} from "typedb-protocol/proto/transaction";
import Transitivity = Concept.Transitivity;

export class RoleTypeImpl extends TypeImpl implements RoleType {
    constructor(scope: string, label: string, root: boolean, abstract: boolean) {
        super(Label.scoped(scope, label), root, abstract);
    }

    protected get className(): string {
        return "RoleType";
    }

    isRoleType(): boolean {
        return true;
    }

    asRoleType(): RoleType {
        return this;
    }
}

export namespace RoleTypeImpl {
    export function ofRoleTypeProto(proto: RoleTypeProto) {
        if (!proto) return null;
        return new RoleTypeImpl(proto.scope, proto.label);
    }
}
