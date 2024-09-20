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

package com.vaticle.typedb.driver.concept.value;

import com.vaticle.typedb.driver.api.concept.value.Value;
import com.vaticle.typedb.driver.common.exception.TypeDBDriverException;
import com.vaticle.typedb.driver.concept.ConceptImpl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static com.vaticle.typedb.driver.common.exception.ErrorMessage.Internal.ILLEGAL_CAST;
import static com.vaticle.typedb.driver.common.exception.ErrorMessage.Internal.UNEXPECTED_NATIVE_VALUE;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_boolean;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_date_as_millis;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_datetime_as_millis;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_datetime_tz_as_millis;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_decimal;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_double;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_duration_as_millis;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_long;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_string;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_get_struct;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_boolean;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_date;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_datetime;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_datetime_tz;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_decimal;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_double;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_duration;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_long;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_string;
import static com.vaticle.typedb.driver.jni.typedb_driver.value_is_struct;

public class ValueImpl extends ConceptImpl implements Value {
    private int hash = 0;

    public ValueImpl(com.vaticle.typedb.driver.jni.Concept concept) {
        super(concept);
    }

//    @Override
//    public Type getType() {
//        if (isBoolean()) return Type.BOOLEAN;
//        else if (isLong()) return Type.LONG;
//        else if (isDouble()) return Type.DOUBLE;
//        else if (isDecimal()) return Type.DECIMAL;
//        else if (isString()) return Type.STRING;
//        else if (isDate()) return Type.DATE;
//        else if (isDatetime()) return Type.DATETIME;
//        else if (isDatetimeTZ()) return Type.DATETIME_TZ;
//        else if (isDuration()) return Type.DURATION;
//        else if (isStruct()) return Type.STRUCT;
//        else throw new TypeDBDriverException(ILLEGAL_STATE);
//    }

    @Override
    public boolean isBoolean() {
        return value_is_boolean(nativeObject);
    }

    @Override
    public boolean isLong() {
        return value_is_long(nativeObject);
    }

    @Override
    public boolean isDouble() {
        return value_is_double(nativeObject);
    }

    @Override
    public boolean isDecimal() {
        return value_is_decimal(nativeObject);
    }

    @Override
    public boolean isString() {
        return value_is_string(nativeObject);
    }

    @Override
    public boolean isDate() {
        return value_is_date(nativeObject);
    }

    @Override
    public boolean isDatetime() {
        return value_is_datetime(nativeObject);
    }

    @Override
    public boolean isDatetimeTZ() {
        return value_is_datetime_tz(nativeObject);
    }

    @Override
    public boolean isDuration() {
        return value_is_duration(nativeObject);
    }

    @Override
    public boolean isStruct() {
        return value_is_struct(nativeObject);
    }

    @Override
    public Object asUntyped() {
        if (isBoolean()) return asBoolean();
        else if (isLong()) return asLong();
        else if (isDouble()) return asDouble();
        else if (isDecimal()) asDecimal();
        else if (isString()) return asString();
        else if (isDate()) return asDate();
        else if (isDatetime()) return asDatetime();
        else if (isDatetimeTZ()) return asDatetimeTZ();
        else if (isDuration()) return asDuration();
        else if (isStruct()) return asStruct();
        throw new TypeDBDriverException(UNEXPECTED_NATIVE_VALUE);
    }

    @Override
    public boolean asBoolean() {
        if (!isBoolean()) throw new TypeDBDriverException(ILLEGAL_CAST, "boolean");
        return value_get_boolean(nativeObject);
    }

    @Override
    public long asLong() {
        if (!isLong()) throw new TypeDBDriverException(ILLEGAL_CAST, "long");
        return value_get_long(nativeObject);
    }

    @Override
    public double asDouble() {
        if (!isDouble()) throw new TypeDBDriverException(ILLEGAL_CAST, "double");
        return value_get_double(nativeObject);
    }

    @Override
    public double asDecimal() {
        if (!isDecimal()) throw new TypeDBDriverException(ILLEGAL_CAST, "decimal");
        return value_get_decimal(nativeObject);
    }

    @Override
    public String asString() {
        if (!isString()) throw new TypeDBDriverException(ILLEGAL_CAST, "String");
        return value_get_string(nativeObject);
    }

    @Override
    public LocalDateTime asDate() {
        if (!isDate()) throw new TypeDBDriverException(ILLEGAL_CAST, "LocalDateTime");
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(value_get_date_as_millis(nativeObject)), ZoneOffset.UTC);
    }

    @Override
    public LocalDateTime asDatetime() {
        if (!isDatetime()) throw new TypeDBDriverException(ILLEGAL_CAST, "LocalDateTime");
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(value_get_datetime_as_millis(nativeObject)), ZoneOffset.UTC);
    }

    @Override
    public LocalDateTime asDatetimeTZ() {
        if (!isDatetimeTZ()) throw new TypeDBDriverException(ILLEGAL_CAST, "LocalDateTime");
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(value_get_datetime_tz_as_millis(nativeObject)), ZoneOffset.UTC);
    }

    @Override
    public LocalDateTime asDuration() {
        if (!isDuration()) throw new TypeDBDriverException(ILLEGAL_CAST, "LocalDateTime");
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(value_get_duration_as_millis(nativeObject)), ZoneOffset.UTC);
    }

    @Override
    public LocalDateTime asStruct() {
        if (!isStruct()) throw new TypeDBDriverException(ILLEGAL_CAST, "Struct");
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(value_get_struct(nativeObject)), ZoneOffset.UTC);
    }

    @Override
    public String toString() {
        if (isBoolean()) return Boolean.toString(asBoolean());
        else if (isLong()) return Long.toString(asLong());
        else if (isDouble()) return Double.toString(asDouble());
        else if (isDecimal()) return Double.toString(asDecimal());
        else if (isString()) return asString();
        else if (isDate()) return asDate().toString();
        else if (isDatetime()) return asDatetime().toString();
        else if (isDatetimeTZ()) return asDatetimeTZ().toString();
        else if (isDuration()) return asDuration().toString();
        else if (isStruct()) return asStruct().toString();
        throw new TypeDBDriverException(UNEXPECTED_NATIVE_VALUE);
    }

    @Override
    public int hashCode() {
        if (hash == 0) hash = computeHash();
        return hash;
    }

    private int computeHash() {
        return asUntyped().hashCode();
    }
}
