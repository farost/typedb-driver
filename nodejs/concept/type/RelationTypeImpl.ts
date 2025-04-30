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

import {RelationType as RelationTypeProto} from "typedb-protocol/proto/concept";
import {Relation} from "../../api/concept/instance/Relation";
import {RelationType} from "../../api/concept/type/RelationType";
import {RoleType} from "../../api/concept/type/RoleType";
import {Transaction} from "../../api/connection/Transaction";
import {RequestBuilder} from "../../common/rpc/RequestBuilder";
import {Stream} from "../../common/util/Stream";
import {RelationImpl, RoleTypeImpl, ThingTypeImpl} from "../../dependencies_internal";
import {Concept} from "../../api/concept/Concept";
import Transitivity = Concept.Transitivity;

export class RelationTypeImpl extends ThingTypeImpl implements RelationType {
    constructor(label: string, root: boolean, abstract: boolean) {
        super(label, root, abstract);
    }

    protected get className(): string {
        return "RelationType";
    }

    isRelationType(): boolean {
        return true;
    }

    asRelationType(): RelationType {
        return this;
    }
}

export namespace RelationTypeImpl {
    export function ofRelationTypeProto(proto: RelationTypeProto): RelationType {
        if (!proto) return null;
        return new RelationTypeImpl(proto.label);
    }
}
