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

import {AttributeType} from "../type/AttributeType";
import {Instance} from "./Instance";
import {RequestBuilder} from "../../../common/rpc/RequestBuilder";
import {Value} from "../value/Value";
import {Duration} from "../../../common/Duration";
import {Concept} from "../Concept";
import ValueType = Concept.ValueType;

/**
 * Attribute is an instance of the attribute type and has a value. This value is fixed and unique for every given instance of the attribute type.
 * Attributes can be uniquely addressed by their type and value.
 */
export interface Attribute extends Instance {
    /**
     * {@inheritDoc}
     */
    isAttribute(): boolean;

    /**
     * {@inheritDoc}
     */
    asAttribute(): Attribute;

    /**
     * {@inheritDoc}
     */
    getType(): AttributeType;

    /**
     * Retrieves the value which this <code>Attribute</code> holds.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getValue();
     * ```
     */
    getValue(): Value;

    /**
     * Retrieves the <code>string</code> describing the value type of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getValueType();
     * ```
     */
    getValueType(): ValueType;

    /**
     * Returns a <code>boolean</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getBoolean()
     * ```
     */
    getBoolean(): boolean;

    /**
     * Returns a <code>integer</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getInteger()
     * ```
     */
    getInteger(): number;

    /**
     * Returns a <code>double</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getDouble()
     * ```
     */
    getDouble(): number;

    /**
     * Returns a <code>decimal</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getDecimal()
     * ```
     */
    getDecimal(): string;

    /**
     * Returns a <code>string</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getString()
     * ```
     */
    getString(): string;

    /**
     * Returns a <code>date</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getDate()
     * ```
     */
    getDate(): Date;

    /**
     * Returns a <code>datetime</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getDatetime()
     * ```
     */
    getDatetime(): Date;

    /**
     * Returns a <code>datetime-tz</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getDatetimeTZ()
     * ```
     */
    getDatetimeTZ(): Date;

    /**
     * Returns a <code>duration</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getDuration()
     * ```
     */
    getDuration(): Duration;

    /**
     * Returns a <code>struct</code> value of this <code>Attribute</code>.
     *
     * ### Examples
     *
     * ```ts
     * attribute.getStruct()
     * ```
     */
    getStruct(): Map<string, Value | null>;
}
