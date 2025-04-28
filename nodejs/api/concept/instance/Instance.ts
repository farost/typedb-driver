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
import {Stream} from "../../../common/util/Stream";
import {Transaction} from "../../connection/Transaction";
import {Concept} from "../Concept";
import {AttributeType} from "../type/AttributeType";
import {RoleType} from "../type/RoleType";
import {ThingType} from "../type/ThingType";
import {Attribute} from "./Attribute";
import {Relation} from "./Relation";
import {ErrorMessage} from "../../../common/errors/ErrorMessage";
import {TypeDBDriverError} from "../../../common/errors/TypeDBDriverError";
import Annotation = ThingType.Annotation;
import ILLEGAL_STATE = ErrorMessage.Internal.ILLEGAL_STATE;
import {Type} from "../type/Type";

export interface Instance extends Concept {
    /**
     * {@inheritDoc}
     */
    isInstance(): boolean;

    /**
     * {@inheritDoc}
     */
    asInstance(): Instance;

    /**
     * Retrieves the type which this <code>Instance</code> belongs to.
     *
     * ### Examples
     *
     * ```ts
     * instance.getType()
     * ```
     */
    getType(): Type;
}

export namespace Instance {
    export function proto(thing: Instance) {
        if (thing.isEntity()) return RequestBuilder.Thing.protoThingEntity(thing.iid);
        else if (thing.isRelation()) return RequestBuilder.Thing.protoThingRelation(thing.iid);
        else if (thing.isAttribute()) return RequestBuilder.Thing.protoThingAttribute(thing.iid);
        else throw new TypeDBDriverError(ILLEGAL_STATE.message());
    }
}
