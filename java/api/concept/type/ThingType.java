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

package com.vaticle.typedb.driver.api.concept.type;

import com.vaticle.typedb.driver.api.TypeDBTransaction;
import com.vaticle.typedb.driver.common.Promise;

import javax.annotation.CheckReturnValue;

public interface ThingType extends Type {
    /**
     * {@inheritDoc}
     */
    @Override
    @CheckReturnValue
    default boolean isThingType() {
        return true;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @CheckReturnValue
    default ThingType asThingType() {
        return this;
    }

    /**
     * Produces a pattern for creating this <code>ThingType</code> in a <code>define</code> query.
     *
     * <h3>Examples</h3>
     * <pre>
     * thingType.getSyntax(transaction).resolve();
     * </pre>
     *
     * @param transaction The current transaction
     */
    @CheckReturnValue
    Promise<String> getSyntax(TypeDBTransaction transaction);

    /**
     * Annotation
     */
//    class Annotation extends NativeObject<com.vaticle.typedb.driver.jni.Annotation> {
//        private final int hash;
//
//        private Annotation(com.vaticle.typedb.driver.jni.Annotation annotation) {
//            super(annotation);
//            this.hash = Objects.hash(isKey(), isUnique());
//        }
//
//        /**
//         * Checks if this <code>Annotation</code> is a <code>@key</code> annotation.
//         *
//         * <h3>Examples</h3>
//         * <pre>
//         * annotation.isKey();
//         * </pre>
//         */
//        public boolean isKey() {
//            return annotation_is_key(nativeObject);
//        }
//
//        /**
//         * Checks if this <code>Annotation</code> is a <code>@unique</code> annotation.
//         *
//         * <h3>Examples</h3>
//         * <pre>
//         * annotation.isUnique();
//         * </pre>
//         */
//        public boolean isUnique() {
//            return annotation_is_unique(nativeObject);
//        }
//
//        /**
//         * Retrieves a string representation of this <code>Annotation</code>.
//         *
//         * <h3>Examples</h3>
//         * <pre>
//         * annotation.toString();
//         * </pre>
//         */
//        @Override
//        public String toString() {
//            return annotation_to_string(nativeObject);
//        }
//
//        /**
//         * Checks if this <code>Annotation</code> is equal to another object.
//         *
//         * <h3>Examples</h3>
//         * <pre>
//         * annotation.equals(obj);
//         * </pre>
//         *
//         * @param obj Object to compare with
//         */
//        @Override
//        public boolean equals(Object obj) {
//            if (obj == this) return true;
//            if (obj == null || getClass() != obj.getClass()) return false;
//            Annotation that = (Annotation) obj;
//            return annotation_equals(this.nativeObject, that.nativeObject);
//        }
//
//        @Override
//        public int hashCode() {
//            return hash;
//        }
//    }
}
