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
import com.vaticle.typedb.driver.api.concept.type.RoleType;
import com.vaticle.typedb.driver.common.Label;
import com.vaticle.typedb.driver.common.NativeIterator;
import com.vaticle.typedb.driver.common.Promise;
import com.vaticle.typedb.driver.common.exception.TypeDBDriverException;
import com.vaticle.typedb.driver.concept.thing.RelationImpl;
import com.vaticle.typedb.driver.concept.thing.ThingImpl;

import javax.annotation.CheckReturnValue;
import javax.annotation.Nullable;
import java.util.stream.Stream;

import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_delete;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_name;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_player_instances;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_player_types;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_relation_instances;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_relation_type;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_relation_types;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_scope;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_subtypes;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_supertype;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_get_supertypes;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_is_abstract;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_is_root;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_is_deleted;
import static com.vaticle.typedb.driver.jni.typedb_driver.role_type_set_label;

public class RoleTypeImpl extends TypeImpl implements RoleType {
    public RoleTypeImpl(com.vaticle.typedb.driver.jni.Concept concept) {
        super(concept);
    }

    @Override
    public Label getLabel() {
        return Label.of(role_type_get_scope(nativeObject), role_type_get_name(nativeObject));
    }
}
