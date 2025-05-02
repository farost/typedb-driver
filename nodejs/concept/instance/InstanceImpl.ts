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

import {Concept} from "../../api/concept/Concept";
import {Attribute} from "../../api/concept/instance/Attribute";
import {Relation} from "../../api/concept/instance/Relation";
import {Instance} from "../../api/concept/instance/Instance";
import {AttributeType} from "../../api/concept/type/AttributeType";
import {RoleType} from "../../api/concept/type/RoleType";
import {Transaction} from "../../api/connection/Transaction";
import {ErrorMessage} from "../../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../../common/errors/TypeDBDriverError";
import {RequestBuilder} from "../../common/rpc/RequestBuilder";
import {Stream} from "../../common/util/Stream";
import {
    AttributeImpl,
    AttributeTypeImpl,
    ConceptImpl,
    EntityImpl,
    RelationImpl,
    RoleTypeImpl,
} from "../../dependencies_internal";
import {
    AttributeType as AttributeTypeProto,
    Instance as InstanceProto,
    InstanceRes,
    InstanceResPart,
    TypeAnnotation
} from "typedb-protocol/proto/concept";
import assert from "assert";
import {TransactionReq} from "typedb-protocol/proto/transaction";
import Annotation = ThingType.Annotation;
import BAD_ENCODING = ErrorMessage.Concept.BAD_ENCODING;

export abstract class InstanceImpl extends ConceptImpl implements Instance {
    private readonly _iid: string;
    private readonly _inferred: boolean;

    protected constructor(iid: string, inferred: boolean) {
        super();
        if (!iid) throw new TypeDBDriverError(ErrorMessage.Concept.MISSING_IID);
        this._iid = iid;
        this._inferred = inferred;
    }

    equals(concept: Concept): boolean {
        if (!concept.isInstance()) return false;
        else return concept.asInstance().iid === this._iid;
    }

    getIID(): string {
        return this._iid;
    }

    isInstance(): boolean {
        return true;
    }

    asInstance(): Instance {
        return this;
    }
}

export namespace InstanceImpl {
    export function ofInstanceProto(proto: InstanceProto): Instance {
        if (proto.has_entity) return EntityImpl.ofEntityProto(proto.entity);
        else if (proto.has_relation) return RelationImpl.ofRelationProto(proto.relation);
        else if (proto.has_attribute) return AttributeImpl.ofAttributeProto(proto.attribute);
        else throw new TypeDBDriverError(BAD_ENCODING.message(proto));
    }
}
