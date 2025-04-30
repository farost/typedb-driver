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

import {Attribute} from "./instance/Attribute";
import {Entity} from "./instance/Entity";
import {Relation} from "./instance/Relation";
import {AttributeType} from "./type/AttributeType";
import {EntityType} from "./type/EntityType";
import {RelationType} from "./type/RelationType";
import {RoleType} from "./type/RoleType";
import {Type} from "./type/Type";
import {ValueType as ValueTypeProto} from "typedb-protocol/proto/concept";
import {Value} from "./value/Value";
import {Instance} from "./instance/Instance";
import {Duration} from "../../common/Duration";
import ValueType = Concept.ValueType;

export interface Concept {
    /**
     * Checks if the concept is a <code>Type</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isType()
     * ```
     */
    isType(): boolean;

    /**
     * Checks if the concept is an <code>EntityType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isEntityType()
     * ```
     */
    isEntityType(): boolean;

    /**
     * Checks if the concept is an <code>AttributeType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isAttributeType()
     * ```
     */
    isAttributeType(): boolean;

    /**
     * Checks if the concept is a <code>RelationType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isRelationType()
     * ```
     */
    isRelationType(): boolean;

    /**
     * Checks if the concept is a <code>RoleType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isRoleType()
     * ```
     */
    isRoleType(): boolean;

    /**
     * Checks if the concept is an <code>Instance</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isInstance()
     * ```
     */
    isInstance(): boolean;

    /**
     * Checks if the concept is an <code>Entity</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isEntity()
     * ```
     */
    isEntity(): boolean;

    /**
     * Checks if the concept is a <code>Relation</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isRelation()
     * ```
     */
    isRelation(): boolean;

    /**
     * Checks if the concept is an <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isAttribute()
     * ```
     */
    isAttribute(): boolean;

    /**
     * Checks if the concept is a <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isValue()
     * ```
     */
    isValue(): boolean;

    /**
     * Casts the concept to <code>Type</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asType()
     * ```
     */
    asType(): Type;

    /**
     * Casts the concept to <code>EntityType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asEntityType()
     * ```
     */
    asEntityType(): EntityType;

    /**
     * Casts the concept to <code>RelationType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asRelationType()
     * ```
     */
    asRelationType(): RelationType;

    /**
     * Casts the concept to <code>AttributeType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asAttributeType()
     * ```
     */
    asAttributeType(): AttributeType;

    /**
     * Casts the concept to <code>RoleType</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asRoleType()
     * ```
     */
    asRoleType(): RoleType;

    /**
     * Casts the concept to <code>Instance</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asInstance()
     * ```
     */
    asInstance(): Instance;

    /**
     * Casts the concept to <code>Entity</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asEntity()
     * ```
     */
    asEntity(): Entity;

    /**
     * Casts the concept to <code>Relation</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asRelation()
     * ```
     */
    asRelation(): Relation;

    /**
     * Casts the concept to <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asAttribute()
     * ```
     */
    asAttribute(): Attribute;

    /**
     * Casts the concept to <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.asValue()
     * ```
     */
    asValue(): Value;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>boolean</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>boolean</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isBoolean()
     * ```
     */
    isBoolean(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>integer</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>integer</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isInteger()
     * ```
     */
    isInteger(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>double</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>double</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isDouble()
     * ```
     */
    isDouble(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>decimal</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>decimal</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isDecimal()
     * ```
     */
    isDecimal(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>string</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>string</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isString()
     * ```
     */
    isString(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>date</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>date</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isDate()
     * ```
     */
    isDate(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>datetime</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>datetime</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isDatetime()
     * ```
     */
    isDatetime(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>datetime-tz</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>datetime-tz</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isDatetimeTZ()
     * ```
     */
    isDatetimeTZ(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>duration</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>duration</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isDuration()
     * ```
     */
    isDuration(): boolean;

    /**
     * Returns <code>true</code> if the value which this <code>Concept</code> holds is of type <code>struct</code>
     * or if this <code>Concept</code> is an <code>AttributeType</code> of type <code>struct</code>.
     * Otherwise, returns <code>false</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.isStruct()
     * ```
     */
    isStruct(): boolean;

    /**
     * Returns a <code>boolean</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetBoolean()
     * ```
     */
    tryGetBoolean(): boolean | null;

    /**
     * Returns a <code>integer</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetInteger()
     * ```
     */
    tryGetInteger(): number | null;

    /**
     * Returns a <code>double</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetDouble()
     * ```
     */
    tryGetDouble(): number | null;

    /**
     * Returns a <code>decimal</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetDecimal()
     * ```
     */
    tryGetDecimal(): string | null;

    /**
     * Returns a <code>string</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetString()
     * ```
     */
    tryGetString(): string | null;

    /**
     * Returns a <code>date</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetDate()
     * ```
     */
    tryGetDate(): Date | null;

    /**
     * Returns a <code>datetime</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetDatetime()
     * ```
     */
    tryGetDatetime(): Date | null;

    /**
     * Returns a <code>datetime-tz</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetDatetimeTZ()
     * ```
     */
    tryGetDatetimeTZ(): Date | null;

    /**
     * Returns a <code>duration</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetDuration()
     * ```
     */
    tryGetDuration(): Duration | null;

    /**
     * Returns a <code>struct</code> value of this <code>Concept</code>.
     * If it's not a <code>Value</code> or it has another type, returns <code>null</code>.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetStruct()
     * ```
     */
    tryGetStruct(): Map<string, Value | null> | null;

    /**
     * Retrieves the unique label of the concept.
     * If this is an <code>Instance</code>, return the label of the type of this instance ("unknown" if type fetching is disabled).
     * If this is a <code>Value</code>, return the label of the value type of the value.
     * If this is a <code>Type</code>, return the label of the type.
     *
     * ### Examples
     *
     * ```ts
     * concept.getLabel()
     * ```
     */
    getLabel(): string;

    /**
     * Retrieves the unique label of the concept.
     * If this is an <code>Instance</code>, return the label of the type of this instance (<code>null</code> if type fetching is disabled).
     * Returns <code>null</code> if type fetching is disabled.
     * If this is a <code>Value</code>, return the label of the value type of the value.
     * If this is a <code>Type</code>, return the label of the type.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetLabel()
     * ```
     */
    tryGetLabel(): string | null;

    /**
     * Retrieves the unique id of the <code>Concept</code>. Returns <code>null</code> if absent.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetIID()
     * ```
     */
    tryGetIID(): string | null;

    /**
     * Retrieves the <code>string</code> describing the value type of this <code>Concept</code>.
     * Returns <code>null</code> if not absent.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetValueType()
     * ```
     */
    tryGetValueType(): ValueType | null;

    /**
     * Retrieves the value which this <code>Concept</code> holds.
     * Returns <code>null</code> if this <code>Concept</code> does not hold any value.
     *
     * ### Examples
     *
     * ```ts
     * concept.tryGetValue()
     * ```
     */
    tryGetValue(): Value | null;

    /**
     * Checks if this concept is equal to the argument <code>concept</code>.
     * @param concept - The concept to compare to.
     */
    equals(concept: Concept): boolean;
}

export namespace Concept {
    export class ValueType {
        private static readonly NONE_STR: string = "none";
        private static readonly BOOLEAN_STR: string = "boolean";
        private static readonly INTEGER_STR: string = "integer";
        private static readonly DOUBLE_STR: string = "double";
        private static readonly DECIMAL_STR: string = "decimal";
        private static readonly STRING_STR: string = "string";
        private static readonly DATE_STR: string = "date";
        private static readonly DATETIME_STR: string = "datetime";
        private static readonly DATETIME_TZ_STR: string = "datetime-tz";
        private static readonly DURATION_STR: string = "duration";
        private static readonly STRUCT_STR: string = "struct";

        private readonly _type: typeof ValueType.BOOLEAN_STR | typeof ValueType.INTEGER_STR |
            typeof ValueType.DOUBLE_STR | typeof ValueType.DECIMAL_STR |
            typeof ValueType.STRING_STR | typeof ValueType.DATE_STR |
            typeof ValueType.DATETIME_STR | typeof ValueType.DATETIME_TZ_STR |
            typeof ValueType.DURATION_STR | typeof ValueType.STRUCT_STR;
        private readonly _structName?: string;

        public static readonly BOOLEAN = new ValueType(ValueType.BOOLEAN_STR);
        public static readonly INTEGER = new ValueType(ValueType.INTEGER_STR);
        public static readonly DOUBLE = new ValueType(ValueType.DOUBLE_STR);
        public static readonly DECIMAL = new ValueType(ValueType.DECIMAL_STR);
        public static readonly STRING = new ValueType(ValueType.STRING_STR);
        public static readonly DATE = new ValueType(ValueType.DATE_STR);
        public static readonly DATETIME = new ValueType(ValueType.DATETIME_STR);
        public static readonly DATETIME_TZ = new ValueType(ValueType.DATETIME_TZ_STR);
        public static readonly DURATION = new ValueType(ValueType.DURATION_STR);

        private constructor(
            type: typeof ValueType.BOOLEAN_STR | typeof ValueType.INTEGER_STR |
                typeof ValueType.DOUBLE_STR | typeof ValueType.DECIMAL_STR |
                typeof ValueType.STRING_STR | typeof ValueType.DATE_STR |
                typeof ValueType.DATETIME_STR | typeof ValueType.DATETIME_TZ_STR |
                typeof ValueType.DURATION_STR | typeof ValueType.STRUCT_STR,
            structName?: string
        ) {
            this._type = type;
            this._structName = structName;
        }

        static struct(name: string): ValueType {
            return new ValueType(ValueType.STRUCT_STR, name);
        }

        public static fromProto(proto: any): ValueType {
            if (proto.boolean !== undefined) {
                return ValueType.BOOLEAN;
            } else if (proto.integer !== undefined) {
                return ValueType.INTEGER;
            } else if (proto.double !== undefined) {
                return ValueType.DOUBLE;
            } else if (proto.decimal !== undefined) {
                return ValueType.DECIMAL;
            } else if (proto.string !== undefined) {
                return ValueType.STRING;
            } else if (proto.date !== undefined) {
                return ValueType.DATE;
            } else if (proto.datetime !== undefined) {
                return ValueType.DATETIME;
            } else if (proto.datetime_tz !== undefined) {
                return ValueType.DATETIME_TZ;
            } else if (proto.duration !== undefined) {
                return ValueType.DURATION;
            } else if (proto.struct !== undefined) {
                return ValueType.struct(proto.struct.name);
            } else {
                throw new Error("Unknown ValueType in protocol buffer message");
            }
        }

        /**
         * Get the name of the <code>ValueType</code> as a string.
         *
         * ### Examples
         *
         * ```ts
         * valueType.name
         * ```
         */
        public get name(): string {
            if (this._type == ValueType.STRUCT_STR && this._structName) {
                return this._structName;
            } else {
                return this._type;
            }
        }

        public isStruct(): boolean {
            return this._structName != null;
        }
    }
}
