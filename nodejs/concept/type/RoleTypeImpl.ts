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
import {RelationImpl, RelationTypeImpl, ThingImpl, ThingTypeImpl, TypeImpl} from "../../dependencies_internal";
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

    async delete(transaction: Transaction): Promise<void> {
        const request = RequestBuilder.Type.RoleType.deleteReq(this.label);
        await this.execute(transaction, request);
    }

    async isDeleted(transaction: Transaction): Promise<boolean> {
        const relationType = await this.getRelationType(transaction);
        return !(relationType) || (!(await relationType.getRelatesForRoleLabel(transaction, this.label.name)));
    }

    async setLabel(transaction: Transaction, newLabel: string): Promise<void> {
        const request = RequestBuilder.Type.RoleType.setLabelReq(this.label, newLabel);
        await this.execute(transaction, request);
    }

    async getSupertype(transaction: Transaction): Promise<RoleType | null> {
        const request = RequestBuilder.Type.RoleType.getSupertypeReq(this.label);
        const res = await this.execute(transaction, request);
        return RoleTypeImpl.ofRoleTypeProto(res.role_type_get_supertype_res.role_type);
    }

    getSupertypes(transaction: Transaction): Stream<RoleType> {
        const request = RequestBuilder.Type.RoleType.getSupertypesReq(this.label);
        return this.stream(transaction, request)
            .flatMap((resPart) => Stream.array(resPart.role_type_get_supertypes_res_part.role_types))
            .map(RoleTypeImpl.ofRoleTypeProto);
    }

    getSubtypes(transaction: Transaction): Stream<RoleType>;
    getSubtypes(transaction: Transaction, transitivity?: Transitivity): Stream<RoleType> {
        if (!transitivity) transitivity = Transitivity.TRANSITIVE;
        const request = RequestBuilder.Type.RoleType.getSubtypesReq(this.label, transitivity.proto());
        return this.stream(transaction, request)
            .flatMap((resPart) => Stream.array(resPart.role_type_get_subtypes_res_part.role_types))
            .map(RoleTypeImpl.ofRoleTypeProto);
    }

    getRelationType(transaction: Transaction): Promise<RelationType> {
        return transaction.concepts.getRelationType(this.label.scope);
    }

    getRelationTypes(transaction: Transaction): Stream<RelationType> {
        const request = RequestBuilder.Type.RoleType.getRelationTypesReq(this.label);
        return this.stream(transaction, request)
            .flatMap((resPart) => Stream.array(resPart.role_type_get_relation_types_res_part.relation_types))
            .map(RelationTypeImpl.ofRelationTypeProto);
    }

    getPlayerTypes(transaction: Transaction): Stream<ThingType>;
    getPlayerTypes(transaction: Transaction, transitivity?: Transitivity): Stream<ThingType> {
        if (!transitivity) transitivity = Transitivity.TRANSITIVE;
        const request = RequestBuilder.Type.RoleType.getPlayerTypesReq(this.label, transitivity.proto());
        return this.stream(transaction, request)
            .flatMap((resPart) => Stream.array(resPart.role_type_get_player_types_res_part.thing_types))
            .map(ThingTypeImpl.ofThingTypeProto);
    }

    getRelationInstances(transaction: Transaction): Stream<Relation>;
    getRelationInstances(transaction: Transaction, transitivity?: Transitivity): Stream<Relation> {
        if (!transitivity) transitivity = Transitivity.TRANSITIVE;
        const request = RequestBuilder.Type.RoleType.getRelationInstancesReq(this.label, transitivity.proto());
        return this.stream(transaction, request)
            .flatMap((resPart) => Stream.array(resPart.role_type_get_relation_instances_res_part.relations))
            .map(RelationImpl.ofRelationProto);
    }

    getPlayerInstances(transaction: Transaction): Stream<Instance>;
    getPlayerInstances(transaction: Transaction, transitivity?: Transitivity): Stream<Instance> {
        if (!transitivity) transitivity = Transitivity.TRANSITIVE;
        const request = RequestBuilder.Type.RoleType.getPlayerInstancesReq(this.label, transitivity.proto());
        return this.stream(transaction, request)
            .flatMap((resPart) => Stream.array(resPart.role_type_get_player_instances_res_part.things))
            .map(ThingImpl.ofThingProto);
    }

    protected async execute(transaction: Transaction, request: TransactionReq): Promise<RoleTypeRes> {
        const ext = transaction as TypeDBTransaction.Extended;
        return (await ext.rpcExecute(request, false)).type_res.role_type_res;
    }

    protected stream(transaction: Transaction, request: TransactionReq): Stream<RoleTypeResPart> {
        const ext = transaction as TypeDBTransaction.Extended;
        return ext.rpcStream(request).map((res) => res.type_res_part.role_type_res_part);
    }
}

export namespace RoleTypeImpl {
    export function ofRoleTypeProto(proto: RoleTypeProto) {
        if (!proto) return null;
        return new RoleTypeImpl(proto.scope, proto.label);
    }
}
