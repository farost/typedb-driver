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
import com.vaticle.typedb.driver.api.concept.type.AttributeType;
import com.vaticle.typedb.driver.api.concept.type.RoleType;
import com.vaticle.typedb.driver.api.concept.type.ThingType;
import com.vaticle.typedb.driver.api.concept.value.Value;
import com.vaticle.typedb.driver.common.Label;
import com.vaticle.typedb.driver.common.NativeIterator;
import com.vaticle.typedb.driver.common.Promise;
import com.vaticle.typedb.driver.common.exception.TypeDBDriverException;
import com.vaticle.typedb.driver.concept.thing.ThingImpl;
import com.vaticle.typeql.lang.common.TypeQLToken;

import javax.annotation.CheckReturnValue;
import java.util.Set;
import java.util.stream.Stream;

import static com.vaticle.typedb.driver.common.exception.ErrorMessage.Internal.UNEXPECTED_NATIVE_VALUE;
import static com.vaticle.typedb.driver.jni.typedb_driver.concept_is_attribute_type;
import static com.vaticle.typedb.driver.jni.typedb_driver.concept_is_entity_type;
import static com.vaticle.typedb.driver.jni.typedb_driver.concept_is_relation_type;
import static com.vaticle.typedb.driver.jni.typedb_driver.concept_is_root_thing_type;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_delete;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_get_label;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_get_owns;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_get_owns_overridden;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_get_plays;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_get_plays_overridden;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_get_syntax;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_is_abstract;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_is_root;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_is_deleted;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_set_abstract;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_set_label;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_set_owns;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_set_plays;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_unset_abstract;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_unset_owns;
import static com.vaticle.typedb.driver.jni.typedb_driver.thing_type_unset_plays;
import static java.util.Collections.emptySet;

public abstract class ThingTypeImpl extends TypeImpl implements ThingType {
    ThingTypeImpl(com.vaticle.typedb.driver.jni.Concept concept) {
        super(concept);
    }

    public static ThingTypeImpl of(com.vaticle.typedb.driver.jni.Concept concept) {
        if (concept_is_entity_type(concept)) return new EntityTypeImpl(concept);
        else if (concept_is_relation_type(concept)) return new RelationTypeImpl(concept);
        else if (concept_is_attribute_type(concept)) return new AttributeTypeImpl(concept);
        throw new TypeDBDriverException(UNEXPECTED_NATIVE_VALUE);
    }

    @Override
    public Label getLabel() {
        return Label.of(thing_type_get_label(nativeObject));
    }

    @Override
    public final Promise<String> getSyntax(TypeDBTransaction transaction) {
        return new Promise<>(thing_type_get_syntax(nativeTransaction(transaction), nativeObject));
    }
}
