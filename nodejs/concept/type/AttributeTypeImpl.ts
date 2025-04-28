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


import {AttributeType as AttributeTypeProto, TypeAnnotation, TypeTransitivity,} from "typedb-protocol/proto/concept";
import {Attribute} from "../../api/concept/instance/Attribute";
import {AttributeType} from "../../api/concept/type/AttributeType";
import {ThingType} from "../../api/concept/type/ThingType";
import {Transaction} from "../../api/connection/Transaction";
import {RequestBuilder} from "../../common/rpc/RequestBuilder";
import {Stream} from "../../common/util/Stream";
import {AttributeImpl, ThingTypeImpl, ValueImpl} from "../../dependencies_internal";
import {Concept} from "../../api/concept/Concept";
import {Value} from "../../api/concept/value/Value";
import assert from "assert";
import Annotation = ThingType.Annotation;
import Transitivity = Concept.Transitivity;
import ValueType = Concept.ValueType;

export class AttributeTypeImpl extends ThingTypeImpl implements AttributeType {
    private readonly _valueType: Concept.ValueType;

    constructor(name: string, root: boolean, abstract: boolean, valueType: Concept.ValueType) {
        super(name, root, abstract);
        this._valueType = valueType;
    }

    protected get className(): string {
        return "AttributeType";
    }

    get valueType(): Concept.ValueType {
        return this._valueType;
    }

    isAttributeType(): boolean {
        return true;
    }

    asAttributeType(): AttributeType {
        return this;
    }

    async isDeleted(transaction: Transaction): Promise<boolean> {
        return !(await transaction.concepts.getAttributeType(this.label.name));
    }

    async put(transaction: Transaction, value: Value): Promise<Attribute> {
        const res = await this.execute(transaction, RequestBuilder.Type.AttributeType.putReq(this.label, Value.proto(value)));
        return AttributeImpl.ofAttributeProto(res.attribute_type_put_res.attribute);
    }

    putBoolean(transaction: Transaction, value: boolean): Promise<Attribute> {
        return this.put(transaction, new ValueImpl(ValueType.BOOLEAN, value));
    }

    putLong(transaction: Transaction, value: number): Promise<Attribute> {
        return this.put(transaction, new ValueImpl(ValueType.LONG, value));
    }

    putDouble(transaction: Transaction, value: number): Promise<Attribute> {
        return this.put(transaction, new ValueImpl(ValueType.DOUBLE, value));
    }

    putString(transaction: Transaction, value: string): Promise<Attribute> {
        return this.put(transaction, new ValueImpl(ValueType.STRING, value));
    }

    putDateTime(transaction: Transaction, value: Date): Promise<Attribute> {
        return this.put(transaction, new ValueImpl(ValueType.DATETIME, value));
    }

    async get(transaction: Transaction, value: Value): Promise<Attribute> {
        const res = await this.execute(transaction, RequestBuilder.Type.AttributeType.getReq(this.label, Value.proto(value)));
        return AttributeImpl.ofAttributeProto(res.attribute_type_get_res.attribute);
    }

    getBoolean(transaction: Transaction, value: boolean): Promise<Attribute> {
        return this.get(transaction, new ValueImpl(ValueType.BOOLEAN, value));
    }

    getLong(transaction: Transaction, value: number): Promise<Attribute> {
        return this.get(transaction, new ValueImpl(ValueType.LONG, value));
    }

    getDouble(transaction: Transaction, value: number): Promise<Attribute> {
        return this.get(transaction, new ValueImpl(ValueType.DOUBLE, value));
    }

    getString(transaction: Transaction, value: string): Promise<Attribute> {
        return this.get(transaction, new ValueImpl(ValueType.STRING, value));
    }

    getDateTime(transaction: Transaction, value: Date): Promise<Attribute> {
        return this.get(transaction, new ValueImpl(ValueType.DATETIME, value));
    }

    async getSupertype(transaction: Transaction): Promise<AttributeType> {
        const res = await this.execute(transaction, RequestBuilder.Type.AttributeType.getSupertypeReq(this.label));
        return AttributeTypeImpl.ofAttributeTypeProto(res.attribute_type_get_supertype_res.attribute_type);
    }

    async setSupertype(transaction: Transaction, superAttributeType: AttributeType): Promise<void> {
        await this.execute(transaction, RequestBuilder.Type.AttributeType.setSupertypeReq(this.label, AttributeType.proto(superAttributeType)));
    }

    getSupertypes(transaction: Transaction): Stream<AttributeType> {
        return this.stream(transaction, RequestBuilder.Type.AttributeType.getSupertypesReq(this.label)).flatMap(
            resPart => Stream.array(resPart.attribute_type_get_supertypes_res_part.attribute_types)
        ).map(AttributeTypeImpl.ofAttributeTypeProto);
    }

    getSubtypes(transaction: Transaction): Stream<AttributeType>;
    getSubtypes(transaction: Transaction, valueType: ValueType): Stream<AttributeType>;
    getSubtypes(transaction: Transaction, transitivity: Transitivity): Stream<AttributeType>;
    getSubtypes(transaction: Transaction, valueType: ValueType, transitivity: Transitivity): Stream<AttributeType>;
    getSubtypes(
        transaction: Transaction,
        valueTypeOrTransitivity?: ValueType | Transitivity,
        maybeTransitivity?: Transitivity,
    ): Stream<AttributeType> {
        let transitivity = Transitivity.TRANSITIVE;
        let valueType: ValueType;

        if (typeof valueTypeOrTransitivity === "undefined") {
            assert(typeof maybeTransitivity === "undefined");
        } else {
            if (valueTypeOrTransitivity instanceof Transitivity) {
                assert(typeof maybeTransitivity === "undefined");
                transitivity = valueTypeOrTransitivity;
            } else {
                valueType = valueTypeOrTransitivity;
                if (maybeTransitivity) transitivity = maybeTransitivity;
            }
        }

        return this.stream(transaction, RequestBuilder.Type.AttributeType.getSubtypesReq(
            this.label, transitivity.proto(), valueType ? valueType.proto() : undefined
        )).flatMap(
            resPart => Stream.array(resPart.attribute_type_get_subtypes_res_part.attribute_types)
        ).map(AttributeTypeImpl.ofAttributeTypeProto);
    }

    getInstances(transaction: Transaction): Stream<Attribute>;
    getInstances(transaction: Transaction, transitivity: Transitivity): Stream<Attribute>;
    getInstances(transaction: Transaction, transitivity?: Transitivity): Stream<Attribute> {
        if (!transitivity) transitivity = Transitivity.TRANSITIVE;
        return this.stream(transaction, RequestBuilder.Type.AttributeType.getInstancesReq(this.label, transitivity.proto())).flatMap(
            resPart => Stream.array(resPart.attribute_type_get_instances_res_part.attributes)
        ).map(AttributeImpl.ofAttributeProto);
    }

    getOwners(transaction: Transaction): Stream<ThingType>;
    getOwners(transaction: Transaction, annotations: Annotation[]): Stream<ThingType>;
    getOwners(transaction: Transaction, transitivity: Transitivity): Stream<ThingType>;
    getOwners(transaction: Transaction, annotations: Annotation[], transitivity: Transitivity): Stream<ThingType>;
    getOwners(
        transaction: Transaction,
        annotationsOrTransitivity?: Annotation[] | Transitivity,
        maybeTransitivity?: Transitivity,
    ): Stream<ThingType> {
        let annotations: TypeAnnotation[] = [];
        let transitivity: TypeTransitivity;

        if (Array.isArray(annotationsOrTransitivity)) {
            annotations = (annotationsOrTransitivity as Annotation[]).map(Annotation.proto);

            annotationsOrTransitivity = maybeTransitivity;
            maybeTransitivity = undefined;
        }

        if (annotationsOrTransitivity instanceof Transitivity) {
            assert(typeof maybeTransitivity === "undefined");
            transitivity = annotationsOrTransitivity.proto();
        }

        const request = RequestBuilder.Type.AttributeType.getOwnersReq(this.label, transitivity, annotations);
        return this.stream(transaction, request).flatMap(
            resPart => Stream.array(resPart.attribute_type_get_owners_res_part.thing_types)
        ).map(ThingTypeImpl.ofThingTypeProto);
    }

    async getRegex(transaction: Transaction): Promise<string> {
        const res = await this.execute(transaction, RequestBuilder.Type.AttributeType.getRegexReq(this.label));
        return res.attribute_type_get_regex_res.regex;
    }

    async setRegex(transaction: Transaction, regex: string): Promise<void> {
        await this.execute(transaction, RequestBuilder.Type.AttributeType.setRegexReq(this.label, regex));
    }

    async unsetRegex(transaction: Transaction): Promise<void> {
        await this.setRegex(transaction, "");
    }
}

export namespace AttributeTypeImpl {
    export function ofAttributeTypeProto(proto: AttributeTypeProto): AttributeType {
        if (!proto) return null;
        return new AttributeTypeImpl(proto.label, Concept.ValueType.of(proto.value_type));
    }
}
