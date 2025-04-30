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


import {RequestBuilder} from "../../../common/rpc/RequestBuilder";
import {Concept} from "../Concept";
import {Duration} from "../../../common/Duration";
import ValueType = Concept.ValueType;


export type NativeValue = boolean | string | number | Date | Duration | Map<string, Value | null>;

export interface Value extends Concept {
    /**
     * {@inheritDoc}
     */
    isValue(): boolean;

    /**
     * {@inheritDoc}
     */
    asValue(): Value;

    /**
     * {@inheritDoc}
     */
    getType(): ValueType;

    /**
     * Returns an untyped <code>Object</code> value of this value concept.
     * This is useful for value equality or printing without having to switch on the actual contained value.
     *
     * ### Examples
     *
     * ```ts
     * value.get();
     * ```
     */
    get(): NativeValue;

    /**
     * Returns a <code>boolean</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getBoolean()
     * ```
     */
    getBoolean(): boolean;

    /**
     * Returns a <code>integer</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getInteger()
     * ```
     */
    getInteger(): number;

    /**
     * Returns a <code>double</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getDouble()
     * ```
     */
    getDouble(): number;

    /**
     * Returns a <code>decimal</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getDecimal()
     * ```
     */
    getDecimal(): number;

    /**
     * Returns a <code>string</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getString()
     * ```
     */
    getString(): string;

    /**
     * Returns a <code>date</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getDate()
     * ```
     */
    getDate(): Date;

    /**
     * Returns a <code>datetime</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getDatetime()
     * ```
     */
    getDatetime(): Date;

    /**
     * Returns a <code>datetime-tz</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getDatetimeTZ()
     * ```
     */
    getDatetimeTZ(): Date;

    /**
     * Returns a <code>duration</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getDuration()
     * ```
     */
    getDuration(): Duration;

    /**
     * Returns a <code>struct</code> value of this <code>Value</code>.
     *
     * ### Examples
     *
     * ```ts
     * value.getStruct()
     * ```
     */
    getStruct(): Map<string, Value | null>;
}
