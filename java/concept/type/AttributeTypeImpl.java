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

package com.vaticle.typedb.driver.concept.type;

import com.vaticle.typedb.driver.api.TypeDBTransaction;
import com.vaticle.typedb.driver.api.concept.value.Value;
import com.vaticle.typedb.driver.api.concept.type.AttributeType;
import com.vaticle.typedb.driver.common.NativeIterator;
import com.vaticle.typedb.driver.common.Promise;
import com.vaticle.typedb.driver.common.exception.TypeDBDriverException;
import com.vaticle.typedb.driver.concept.value.ValueImpl;
import com.vaticle.typedb.driver.concept.thing.AttributeImpl;

import javax.annotation.Nullable;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Stream;

import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_instances;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_owners;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_regex;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_subtypes;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_subtypes_with_value_type;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_supertype;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_supertypes;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_get_value_type;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_put;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_set_regex;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_set_supertype;
import static com.vaticle.typedb.driver.jni.typedb_driver.attribute_type_unset_regex;
import static java.util.Collections.emptySet;

public class AttributeTypeImpl extends ThingTypeImpl implements AttributeType {
    public AttributeTypeImpl(com.vaticle.typedb.driver.jni.Concept concept) {
        super(concept);
    }

    @Override
    public Value.Type getValueType() {
        return Value.Type.of(attribute_type_get_value_type(nativeObject));
    }
}
