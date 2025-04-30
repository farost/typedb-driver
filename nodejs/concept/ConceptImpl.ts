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

import {Attribute} from "../api/concept/instance/Attribute";
import {AttributeType} from "../api/concept/type/AttributeType";
import {Concept} from "../api/concept/Concept";
import {Entity} from "../api/concept/instance/Entity";
import {EntityType} from "../api/concept/type/EntityType";
import {ErrorMessage} from "../common/errors/ErrorMessage";
import {Relation} from "../api/concept/instance/Relation";
import {RelationType} from "../api/concept/type/RelationType";
import {RoleType} from "../api/concept/type/RoleType";
import {Instance} from "../api/concept/instance/Instance";
import {Type} from "../api/concept/type/Type";
import {TypeDBDriverError} from "../common/errors/TypeDBDriverError";
import {Value} from "../api/concept/value/Value";
import INVALID_CONCEPT_CASTING = ErrorMessage.Concept.INVALID_CONCEPT_CASTING;
import {Duration} from "../common/Duration";
import ValueType = Concept.ValueType;

export abstract class ConceptImpl implements Concept {
    private static readonly DECIMAL_SCALE: number = 19;
    private static readonly UNKNOWN_LABEL = "unknown";

    protected abstract get className(): string;

    tryGetLabel(): string | null {
        if (this.isEntityType()) return this.asEntityType().getLabel();
        if (this.isRelationType()) return this.asRelationType().getLabel();
        if (this.isAttributeType()) return this.asAttributeType().getLabel();
        if (this.isRoleType()) return this.asRoleType().getLabel();
        if (this.isEntity()) return this.asEntity().getLabel();
        if (this.isRelation()) return this.asRelation().getLabel();
        if (this.isAttribute()) return this.asAttribute().getLabel();
        if (this.isValue()) return this.asValue().getLabel();
        return null;
    }

    tryGetIID(): string | null {
        if (this.isEntity()) return this.asEntity().getIID();
        if (this.isRelation()) return this.asRelation().getIID();
        return null;
    }

    tryGetValueType(): ValueType | null {
        if (this.isAttributeType()) return this.asAttributeType().getValueType();
        if (this.isAttribute()) return this.asAttribute().getValueType();
        if (this.isValue()) return this.asValue().getType();
        return null;
    }

    tryGetValue(): Value | null {
        if (this.isAttribute()) return this.asAttribute().getValue();
        if (this.isValue()) return this.asValue();
        return null;
    }

    isBoolean(): boolean {
        if (this.isAttribute()) return this.asAttribute().isBoolean();
        if (this.isValue()) return this.asValue().isBoolean();
        return false;
    }

    isInteger(): boolean {
        if (this.isAttribute()) return this.asAttribute().isInteger();
        if (this.isValue()) return this.asValue().isInteger();
        return false;
    }

    isDouble(): boolean {
        if (this.isAttribute()) return this.asAttribute().isDouble();
        if (this.isValue()) return this.asValue().isDouble();
        return false;
    }

    isDecimal(): boolean {
        if (this.isAttribute()) return this.asAttribute().isDecimal();
        if (this.isValue()) return this.asValue().isDecimal();
        return false;
    }

    isString(): boolean {
        if (this.isAttribute()) return this.asAttribute().isString();
        if (this.isValue()) return this.asValue().isString();
        return false;
    }

    isDate(): boolean {
        if (this.isAttribute()) return this.asAttribute().isDate();
        if (this.isValue()) return this.asValue().isDate();
        return false;
    }

    isDatetime(): boolean {
        if (this.isAttribute()) return this.asAttribute().isDatetime();
        if (this.isValue()) return this.asValue().isDatetime();
        return false;
    }

    isDatetimeTZ(): boolean {
        if (this.isAttribute()) return this.asAttribute().isDatetimeTZ();
        if (this.isValue()) return this.asValue().isDatetimeTZ();
        return false;
    }

    isDuration(): boolean {
        if (this.isAttribute()) return this.asAttribute().isDuration();
        if (this.isValue()) return this.asValue().isDuration();
        return false;
    }

    isStruct(): boolean {
        if (this.isAttribute()) return this.asAttribute().isStruct();
        if (this.isValue()) return this.asValue().isStruct();
        return false;
    }

    tryGetBoolean(): boolean | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getBoolean();
        if (this.isValue()) return this.asValue().getBoolean();
        return null;
    }

    tryGetInteger(): number | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getInteger();
        if (this.isValue()) return this.asValue().getInteger();
        return null;
    }

    tryGetDouble(): number | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getDouble();
        if (this.isValue()) return this.asValue().getDouble();
        return null;
    }

    tryGetDecimal(): string | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getDecimal();
        if (this.isValue()) return this.asValue().getDecimal();
        return null;
    }

    tryGetString(): string | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getString();
        if (this.isValue()) return this.asValue().getString();
        return null;
    }

    tryGetDate(): Date | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getDate();
        if (this.isValue()) return this.asValue().getDate();
        return null;
    }

    tryGetDatetime(): Date | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getDatetime();
        if (this.isValue()) return this.asValue().getDatetime();
        return null;
    }

    tryGetDatetimeTZ(): Date | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getDatetimeTZ();
        if (this.isValue()) return this.asValue().getDatetimeTZ();
        return null;
    }

    tryGetDuration(): Duration | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getDuration();
        if (this.isValue()) return this.asValue().getDuration();
        return null;
    }

    tryGetStruct(): Map<string, Value | null> | null {
        if (!this.isBoolean()) return null;
        if (this.isAttribute()) return this.asAttribute().getStruct();
        if (this.isValue()) return this.asValue().getStruct();
        return null;
    }

    isType(): boolean {
        return false;
    }

    isEntityType(): boolean {
        return false;
    }

    isAttributeType(): boolean {
        return false;
    }

    isRelationType(): boolean {
        return false;
    }

    isRoleType(): boolean {
        return false;
    }

    isInstance(): boolean {
        return false;
    }

    isEntity(): boolean {
        return false;
    }

    isRelation(): boolean {
        return false;
    }

    isAttribute(): boolean {
        return false;
    }

    isValue(): boolean {
        return false;
    }

    asType(): Type {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "Type"));
    }

    asEntityType(): EntityType {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "EntityType"));
    }

    asRelationType(): RelationType {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "RelationType"));
    }

    asAttributeType(): AttributeType {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "AttributeType"));
    }

    asRoleType(): RoleType {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "RoleType"));
    }

    asInstance(): Instance {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "Instance"));
    }

    asEntity(): Entity {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "Entity"));
    }

    asRelation(): Relation {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "Relation"));
    }

    asAttribute(): Attribute {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "Attribute"));
    }

    asValue(): Value {
        throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "Value"));
    }

    getLabel(): string {
        return this.tryGetLabel() ?? ConceptImpl.UNKNOWN_LABEL;
    }

    abstract equals(concept: Concept): boolean;
}
