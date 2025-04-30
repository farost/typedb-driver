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

import {Concept} from "../../api/concept/Concept";
import {Type} from "../../api/concept/type/Type";
import {Transaction} from "../../api/connection/Transaction";
import {ErrorMessage} from "../../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../../common/errors/TypeDBDriverError";
import {Label} from "../../common/Label";
import {Stream} from "../../common/util/Stream";
import {ConceptImpl} from "../../dependencies_internal";
import MISSING_LABEL = ErrorMessage.Concept.MISSING_LABEL;

export abstract class TypeImpl extends ConceptImpl implements Type {
    private readonly _label: string;

    protected constructor(label: string, root: boolean, abstract: boolean) {
        super();
        if (!label) throw new TypeDBDriverError(MISSING_LABEL);
        this._label = label;
        this._root = root;
        this._abstract = abstract;
    }

    getLabel(): string {
        return this._label;
    }

    isType(): boolean {
        return true;
    }

    asType(): Type {
        return this;
    }

    equals(concept: Concept): boolean {
        if (!concept.isType()) return false;
        return concept.asType().label.equals(this.label);
    }

    // TODO: ???
    toString(): string {
        return `${this.className}[label:${this._label}]`;
    }
}
