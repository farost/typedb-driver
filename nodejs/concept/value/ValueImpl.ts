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

import {NativeValue, Value} from "../../api/concept/value/Value";
import {ConceptImpl} from "../ConceptImpl";
import {Concept} from "../../api/concept/Concept";
import {TypeDBDriverError} from "../../common/errors/TypeDBDriverError";
import {ErrorMessage} from "../../common/errors/ErrorMessage";
import {Value as ValueProto} from "typedb-protocol/proto/concept";
import ValueType = Concept.ValueType;
import INVALID_CONCEPT_CASTING = ErrorMessage.Concept.INVALID_CONCEPT_CASTING;

import BAD_VALUE_TYPE = ErrorMessage.Concept.BAD_VALUE_TYPE;
import {Duration} from "../../common/Duration";

export class ValueImpl extends ConceptImpl implements Value {
    private readonly _valueType: ValueType;
    private readonly _value: NativeValue;

    constructor(type: ValueType, value: NativeValue) {
        super();
        this._valueType = type;
        this._value = value;
    }

    protected get className(): string {
        return "Value";
    }

    getType(): ValueType {
        return this._valueType;
    }

    get(): NativeValue {
        return this._value;
    }

    isValue(): boolean {
        return true
    }

    asValue(): Value {
        return this;
    }

    equals(concept: Concept): boolean {
        if (!concept.isValue()) return false;
        else {
            return this.getType() == concept.asValue().getType() && this.get() == concept.asValue().get();
        }
    }

    isBoolean(): boolean {
        return this.getType() == ValueType.BOOLEAN;
    }

    isInteger(): boolean {
        return this.getType() == ValueType.INTEGER;
    }

    isDouble(): boolean {
        return this.getType() == ValueType.DOUBLE;
    }

    isDecimal(): boolean {
        return this.getType() == ValueType.DECIMAL;
    }

    isString(): boolean {
        return this.getType() == ValueType.STRING;
    }

    isDate(): boolean {
        return this.getType() == ValueType.DATE;
    }

    isDatetime(): boolean {
        return this.getType() == ValueType.DATETIME;
    }

    isDatetimeTZ(): boolean {
        return this.getType() == ValueType.DATETIME_TZ;
    }

    isDuration(): boolean {
        return this.getType() == ValueType.DURATION;
    }

    isStruct(): boolean {
        return this.getType().isStruct();
    }

    getBoolean(): boolean {
        if (!this.isBoolean()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "boolean"));
        return this.get() as boolean;
    }

    getInteger(): number {
        if (!this.isInteger()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "integer"));
        return this.get() as number;
    }

    getDouble(): number {
        if (!this.isDouble()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "double"));
        return this.get() as number;
    }

    getDecimal(): number { // TODO: String?..
        if (!this.isDecimal()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "decimal"));
        return this.get() as number;
    }

    getString(): string {
        if (!this.isString()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "string"));
        return this.get() as string;
    }

    getDate(): Date {
        if (!this.isDate()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "date"));
        return this.get() as Date;
    }

    getDatetime(): Date {
        if (!this.isDatetime()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "datetime"));
        return this.get() as Date;
    }

    getDatetimeTZ(): Date {
        if (!this.isDatetimeTZ()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "datetime-tz"));
        return this.get() as Date;
    }

    getDuration(): Duration {
        if (!this.isDuration()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "duration"));
        return this.get() as Duration;
    }

    getStruct(): Map<string, Value | null> {
        if (!this.isStruct()) throw new TypeDBDriverError(INVALID_CONCEPT_CASTING.message(this.className, "struct"));
        return this.get() as Map<string, Value | null>;
    }
}

export namespace ValueImpl {
    export function ofValueProto(valueProto: ValueProto): Value {
        if (!valueProto) return null;
        if (valueProto.has_boolean) return new ValueImpl(ValueType.BOOLEAN, valueProto.boolean);
        else if (valueProto.has_integer) return new ValueImpl(ValueType.INTEGER, valueProto.integer);
        else if (valueProto.has_double) return new ValueImpl(ValueType.DOUBLE, valueProto.double);
        else if (valueProto.has_decimal) return new ValueImpl(ValueType.DECIMAL, valueProto.decimal);
        else if (valueProto.has_string) return new ValueImpl(ValueType.STRING, valueProto.string);
        else if (valueProto.has_date) return new ValueImpl(ValueType.DATE, new Date(valueProto.date));
        else if (valueProto.has_date_time) return new ValueImpl(ValueType.DATETIME, new Date(valueProto.date_time));
        else if (valueProto.has_date_time_tz) return new ValueImpl(ValueType.DATETIME_TZ, new Date(valueProto.date_time_tz));
        else if (valueProto.has_duration) return new ValueImpl(ValueType.DURATION, new Date(valueProto.duration));
        else throw new TypeDBDriverError(BAD_VALUE_TYPE.message(valueProto));
    }
}
