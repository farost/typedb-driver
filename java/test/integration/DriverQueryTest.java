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

package com.vaticle.typedb.driver.test.integration;

import com.vaticle.typedb.driver.TypeDB;
import com.vaticle.typedb.driver.api.TypeDBDriver;
import com.vaticle.typedb.driver.api.TypeDBTransaction;
import com.vaticle.typedb.driver.api.answer.ConceptRow;
import com.vaticle.typedb.driver.api.answer.QueryAnswer;
import com.vaticle.typedb.driver.api.concept.Concept;
import com.vaticle.typedb.driver.api.concept.thing.Attribute;
import com.vaticle.typedb.driver.api.concept.thing.Entity;
import com.vaticle.typedb.driver.api.concept.type.AttributeType;
import com.vaticle.typedb.driver.api.concept.type.EntityType;
import com.vaticle.typedb.driver.api.concept.value.Value;
import com.vaticle.typedb.driver.api.database.Database;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

@SuppressWarnings("Duplicates")
public class DriverQueryTest {
    private static final Logger LOG = LoggerFactory.getLogger(DriverQueryTest.class);
    private static TypeDBDriver typedbDriver;

    @BeforeClass
    public static void setUpClass() {
        typedbDriver = TypeDB.coreDriver("127.0.0.1:1729");
        if (typedbDriver.databases().contains("typedb")) typedbDriver.databases().get("typedb").delete();
        typedbDriver.databases().create("typedb");
    }

    @AfterClass
    public static void close() {
        typedbDriver.close();
    }

        @Test
    public void basicTest() {
        Database db = typedbDriver.databases().get("typedb");
        db.delete();
        typedbDriver.databases().create("typedb");
        Database database = typedbDriver.databases().get("typedb");
        assertEquals(database.name(), "typedb");

        localhostTypeDBTX(tx -> {
            QueryAnswer answer = tx.query("define entity person, owns age; attribute age, value long;").resolve();
            assertTrue(answer.isOk());

            tx.commit();
        }, TypeDBTransaction.Type.SCHEMA);

        localhostTypeDBTX(tx -> {
            QueryAnswer answer = tx.query("match entity $x;").resolve();
            assertTrue(answer.isConceptRowsStream());

            List<ConceptRow> rows = answer.asConceptRowsStream().rows().collect(Collectors.toList());
            assertEquals(rows.size(), 1);

            ConceptRow row = rows.get(0);
            List<String> header = row.header().collect(Collectors.toList());
            assertEquals(header.size(), 1);

            String columnName = header.get(0);
            Concept conceptByName = row.get(columnName);
            Concept conceptByIndex = row.getIndex(0);
            assertEquals(conceptByName, conceptByIndex);

            assertTrue(conceptByName.isEntityType());
            assertFalse(conceptByName.isEntity());
            assertFalse(conceptByName.isAttributeType());
            assertTrue(conceptByName.isType());
            assertFalse(conceptByName.isThing());
            assertEquals(conceptByName.asEntityType().getLabel().scopedName(), "person");
            assertEquals(conceptByName.asEntityType().getLabel().name(), "person");
            assertEquals(conceptByName.asEntityType().getLabel().scope(), Optional.empty());
            assertNotEquals(conceptByName.asEntityType().getLabel().scopedName(), "not person");
            assertNotEquals(conceptByName.asEntityType().getLabel().scopedName(), "age");
        }, TypeDBTransaction.Type.READ);

        localhostTypeDBTX(tx -> {
            QueryAnswer answer = tx.query("match attribute $a;").resolve();
            assertTrue(answer.isConceptRowsStream());

            List<ConceptRow> rows = answer.asConceptRowsStream().rows().collect(Collectors.toList());
            assertEquals(rows.size(), 1);

            ConceptRow row = rows.get(0);
            List<String> header = row.header().collect(Collectors.toList());
            assertEquals(header.size(), 1);

            String columnName = header.get(0);
            Concept conceptByName = row.get(columnName);
            Concept conceptByIndex = row.getIndex(0);
            assertEquals(conceptByName, conceptByIndex);

            assertTrue(conceptByName.isAttributeType());
            assertFalse(conceptByName.isAttribute());
            assertFalse(conceptByName.isEntityType());
            assertTrue(conceptByName.isType());
            assertFalse(conceptByName.isThing());
            assertFalse(conceptByName.asAttributeType().isBoolean());
            assertFalse(conceptByName.asAttributeType().isStruct());
            assertFalse(conceptByName.asAttributeType().isString());
            assertFalse(conceptByName.asAttributeType().isDecimal());
            assertFalse(conceptByName.asAttributeType().isDouble());
            assertTrue(conceptByName.asAttributeType().isLong());
            assertEquals(conceptByName.asAttributeType().getLabel().scopedName(), "age");
            assertEquals(conceptByName.asAttributeType().getLabel().name(), "age");
            assertEquals(conceptByName.asAttributeType().getLabel().scope(), Optional.empty());
            assertNotEquals(conceptByName.asAttributeType().getLabel().scopedName(), "person");
        }, TypeDBTransaction.Type.READ);

        localhostTypeDBTX(tx -> {
            QueryAnswer answer = tx.query("insert $z isa person, has age 10; $x isa person, has age 20;").resolve();
            assertTrue(answer.isConceptRowsStream());

            List<ConceptRow> rows = answer.asConceptRowsStream().rows().collect(Collectors.toList());
            assertEquals(rows.size(), 1);

            ConceptRow row = rows.get(0);
            List<String> header = row.header().collect(Collectors.toList());
            assertEquals(header.size(), 2);
            assertTrue(header.contains("x"));
            assertTrue(header.contains("z"));

            Concept x = row.getIndex(header.indexOf("x"));
            assertTrue(x.isEntity());
            assertFalse(x.isEntityType());
            assertFalse(x.isAttribute());
            assertFalse(x.isType());
            assertTrue(x.isThing());
            assertEquals(x.asEntity().getType().asEntityType().getLabel().scopedName(), "person");
            assertEquals(x.asEntity().getType().asEntityType().getLabel().name(), "person");
            assertEquals(x.asEntity().getType().asEntityType().getLabel().scope(), Optional.empty());
            assertNotEquals(x.asEntity().getType().asEntityType().getLabel().scopedName(), "not person");

            Concept z = row.get("z");
            assertTrue(z.isEntity());
            assertFalse(z.isEntityType());
            assertFalse(z.isAttribute());
            assertFalse(z.isType());
            assertTrue(z.isThing());
            Entity zEntity = z.asEntity();
            assertEquals(zEntity.getType().asEntityType().getLabel().scopedName(), "person");
            assertEquals(zEntity.getType().asEntityType().getLabel().name(), "person");
            assertEquals(zEntity.getType().asEntityType().getLabel().scope(), Optional.empty());
            assertNotEquals(zEntity.getType().asEntityType().getLabel().scopedName(), "not person");

            tx.commit();
        }, TypeDBTransaction.Type.WRITE);

        localhostTypeDBTX(tx -> {
            String var = "x";
            QueryAnswer answer = tx.query(String.format("match $%s isa person;", var)).resolve();
            assertTrue(answer.isConceptRowsStream());

            AtomicInteger count = new AtomicInteger(0);
            answer.asConceptRowsStream().rows().forEach(row -> {
                Concept x = row.get(var);
                assertTrue(x.isEntity());
                assertFalse(x.isEntityType());
                assertFalse(x.isAttribute());
                assertFalse(x.isType());
                assertTrue(x.isThing());
                EntityType xType = x.asEntity().getType().asEntityType();
                assertEquals(xType.getLabel().scopedName(), "person");
                assertEquals(xType.getLabel().name(), "person");
                assertEquals(xType.getLabel().scope(), Optional.empty());
                assertNotEquals(xType.getLabel().scopedName(), "not person");
                count.incrementAndGet();
            });
            assertEquals(count.get(), 2);
        }, TypeDBTransaction.Type.READ);
    }

    @Test
    public void attributesTest() {
        Database db = typedbDriver.databases().get("typedb");
        db.delete();
        typedbDriver.databases().create("typedb");

        Map<String, String> attribute_value_types = Map.of(
                "root", "none",
                "age", "long",
                "name", "string",
                "is-new", "boolean",
                "success", "double",
                "balance", "decimal",
                "birth-date", "date",
                "birth-time", "datetime",
                "current-time", "datetime-tz",
                "expiration", "duration"
        );

        Map<String, String> attribute_values = Map.of(
                "age", "25",
                "name", "\"John\"",
                "is-new", "true",
//                "success", "66.6",
                "balance", "8292835.38278572",
                "birth-date", "2024-09-20",
                "birth-time", "1999-02-26T12:15:05"
//                "current-time", "2024-09-20T16:40:05 Europe/Belfast",
//                "expiration", "P1Y6M7D15H"
        );

        localhostTypeDBTX(tx -> {
            for (Map.Entry<String, String> entry : attribute_value_types.entrySet()) {
                String query;
                if (Objects.equals(entry.getValue(), "none")) {
                    query = String.format("define attribute %s @abstract;", entry.getKey());
                } else {
                    query = String.format("define attribute %s, value %s; entity person owns %s;", entry.getKey(), entry.getValue(), entry.getKey());
                }
                assertTrue(tx.query(query).resolve().isOk());
            }
            tx.commit();
        }, TypeDBTransaction.Type.SCHEMA);

        localhostTypeDBTX(tx -> {
            QueryAnswer answer = tx.query("match attribute $a;").resolve();
            assertTrue(answer.isConceptRowsStream());

            AtomicInteger count = new AtomicInteger(0);
            answer.asConceptRowsStream().rows().forEach(row -> {
                Concept a = row.get("a");
                assertTrue(a.isAttributeType());
                AttributeType type = a.asAttributeType();
                assertEquals(type.getValueType(), attribute_value_types.get(type.getLabel().scopedName()));
                count.incrementAndGet();
            });
            assertEquals(count.get(), attribute_value_types.size());
        }, TypeDBTransaction.Type.READ);

        localhostTypeDBTX(tx -> {
            for (Map.Entry<String, String> entry : attribute_values.entrySet()) {
                QueryAnswer answer = tx.query(String.format("insert $a isa person, has %s %s;", entry.getKey(), entry.getValue())).resolve();
                assertTrue(answer.isConceptRowsStream());
                List<ConceptRow> rows = answer.asConceptRowsStream().rows().collect(Collectors.toList());
                assertEquals(rows.size(), 1);

                ConceptRow row = rows.get(0);
                List<String> header = row.header().collect(Collectors.toList());
                assertEquals(header.size(), 1);
                assertTrue(row.getIndex(header.indexOf("a")).isEntity());
            }
            tx.commit();
        }, TypeDBTransaction.Type.WRITE);

//        localhostTypeDBTX(tx -> {
//            QueryAnswer answer = tx.query("match attribute $t; $a isa! $t; $v = $a;").resolve(); // TODO: Is not implemented now...
//            assertTrue(answer.isConceptRowsStream());
//
//            AtomicInteger count = new AtomicInteger(0);
//            List<ConceptRow> rows = answer.asConceptRowsStream().rows().collect(Collectors.toList());
//            assertEquals(rows.size(), attribute_values.size());
//            for (ConceptRow row : rows) {
//                Attribute attribute = row.get("a").asAttribute();
//                String attributeName = attribute.getType().getLabel().scopedName();
//                Value value = row.get("v").asValue();
//                assertEquals(value.getType(), attribute_value_types.get(attributeName));
//                // TODO: check value!
//            }
//        }, TypeDBTransaction.Type.READ);
    }

//    @Test
//    public void applicationTest() {
//        LOG.info("driverJavaE2E() - starting driver-java E2E...");
//
//        localhostTypeDBTX(tx -> {
//            TypeQLDefine defineQuery = TypeQL.define(type("child-bearing").sub("relation").relates("offspring").relates("child-bearer"),
//                    type("mating").sub("relation").relates("male-partner").relates("female-partner").plays("child-bearing", "child-bearer"),
//                    type("parentship").sub("relation").relates("parent").relates("child"),
//                    type("name").sub("attribute").value(TypeQLArg.ValueType.STRING),
//                    type("lion").sub("entity").owns("name").plays("mating", "male-partner").plays("mating", "female-partner")
//                            .plays("child-bearing", "offspring").plays("parentship", "parent").plays("parentship", "child"));
//            TypeQLDefine ruleQuery = TypeQL.define(rule("infer-parentship-from-mating-and-child-bearing").when(
//                            and(rel("male-partner", cVar("male")).rel("female-partner", cVar("female")).isa("mating"),
//                                    cVar("childbearing").rel("child-bearer", cVar()).rel("offspring", cVar("offspring")).isa("child-bearing")))
//                    .then(rel("parent", cVar("male")).rel("parent", cVar("female")).rel("child", cVar("offspring")).isa("parentship")));
//            LOG.info("driverJavaE2E() - define a schema...");
//            LOG.info("driverJavaE2E() - '" + defineQuery + "'");
//            tx.query().define(defineQuery).resolve();
//            tx.query().define(ruleQuery).resolve();
//            tx.commit();
//            LOG.info("driverJavaE2E() - done.");
//        }, TypeDBTransaction.Type.SCHEMA);
//
//        localhostTypeDBTX(tx -> {
//            String[] names = lionNames();
//            TypeQLInsert insertLionQuery = TypeQL.insert(cVar().isa("lion").has("name", names[0]), cVar().isa("lion").has("name", names[1]), cVar().isa("lion").has("name", names[2]));
//            LOG.info("driverJavaE2E() - insert some data...");
//            LOG.info("driverJavaE2E() - '" + insertLionQuery + "'");
//            tx.query().insert(insertLionQuery);
//            tx.commit();
//            LOG.info("driverJavaE2E() - done.");
//        }, WRITE);
//
//        LOG.info("driverJavaE2E() - driver-java E2E test done.");
//    }
//
//    @Test
//    public void parallelQueriesInTransactionTest() {
//        localhostTypeDBTX(tx -> {
//            TypeQLDefine defineQuery = TypeQL.define(
//                    type("symbol").sub("attribute").value(TypeQLArg.ValueType.STRING),
//                    type("name").sub("attribute").value(TypeQLArg.ValueType.STRING),
//                    type("status").sub("attribute").value(TypeQLArg.ValueType.STRING),
//                    type("latest").sub("attribute").value(TypeQLArg.ValueType.BOOLEAN),
//
//                    type("commit").sub("entity")
//                            .owns("symbol")
//                            .plays("pipeline-automation", "trigger"),
//                    type("pipeline").sub("entity")
//                            .owns("name")
//                            .owns("latest")
//                            .plays("pipeline-workflow", "pipeline")
//                            .plays("pipeline-automation", "pipeline"),
//                    type("workflow").sub("entity")
//                            .owns("name")
//                            .owns("status")
//                            .owns("latest")
//                            .plays("pipeline-workflow", "workflow"),
//
//                    type("pipeline-workflow").sub("relation")
//                            .relates("pipeline").relates("workflow"),
//                    type("pipeline-automation").sub("relation")
//                            .relates("pipeline").relates("trigger")
//            );
//
//            LOG.info("driverJavaE2E() - define a schema...");
//            LOG.info("driverJavaE2E() - '" + defineQuery + "'");
//            tx.query().define(defineQuery).resolve();
//            tx.commit();
//            LOG.info("driverJavaE2E() - done.");
//        }, TypeDBTransaction.Type.SCHEMA);
//
//
//        localhostTypeDBTX(tx -> {
//            String[] commits = commitSHAs();
//            TypeQLInsert insertCommitQuery = TypeQL.insert(cVar().isa("commit").has("symbol", commits[0]),
//                    cVar().isa("commit").has("symbol", commits[1]), cVar().isa("commit").has("symbol", commits[3]),
//                    cVar().isa("commit").has("symbol", commits[4]), cVar().isa("commit").has("symbol", commits[5]),
//                    cVar().isa("commit").has("symbol", commits[6]), cVar().isa("commit").has("symbol", commits[7]),
//                    cVar().isa("commit").has("symbol", commits[8]), cVar().isa("commit").has("symbol", commits[9]));
//
//            LOG.info("driverJavaE2E() - insert commit data...");
//            LOG.info("driverJavaE2E() - '" + insertCommitQuery + "'");
//            tx.query().insert(insertCommitQuery);
//            tx.commit();
//            LOG.info("driverJavaE2E() - done.");
//        }, WRITE);
//
//        localhostTypeDBTX(tx -> {
//            TypeQLInsert insertWorkflowQuery = TypeQL.insert(cVar().isa("workflow")
//                            .has("name", "workflow-A")
//                            .has("status", "running")
//                            .has("latest", true), cVar().isa("workflow")
//                            .has("name", "workflow-B")
//                            .has("status", "finished")
//                            .has("latest", false)
//            );
//
//            LOG.info("driverJavaE2E() - insert workflow data...");
//            LOG.info("driverJavaE2E() - '" + insertWorkflowQuery + "'");
//            tx.query().insert(insertWorkflowQuery);
//            tx.commit();
//            LOG.info("driverJavaE2E() - done.");
//        }, WRITE);
//
//        localhostTypeDBTX(tx -> {
//            TypeQLInsert insertPipelineQuery = TypeQL.insert(cVar().isa("pipeline")
//                            .has("name", "pipeline-A")
//                            .has("latest", true), cVar().isa("pipeline")
//                            .has("name", "pipeline-B")
//                            .has("latest", false)
//            );
//
//            LOG.info("driverJavaE2E() - insert pipeline data...");
//            LOG.info("driverJavaE2E() - '" + insertPipelineQuery + "'");
//            tx.query().insert(insertPipelineQuery);
//            tx.commit();
//            LOG.info("driverJavaE2E() - done.");
//        }, WRITE);
//
//        localhostTypeDBTX(tx -> {
//            String[] commitShas = commitSHAs();
//            LOG.info("driverJavaE2E() - inserting pipeline-automation relations...");
//
//            for (int i = 0; i < commitShas.length / 2; i++) {
//                TypeQLInsert insertPipelineAutomationQuery = TypeQL.match(cVar("commit").isa("commit").has("symbol", commitShas[i]), cVar("pipeline").isa("pipeline").has("name", "pipeline-A"))
//                        .insert(rel("pipeline", cVar("pipeline")).rel("trigger", cVar("commit")).isa("pipeline-automation")
//                        );
//                LOG.info("driverJavaE2E() - '" + insertPipelineAutomationQuery + "'");
//                List<ConceptRow> x = tx.query().insert(insertPipelineAutomationQuery).collect(toList());
//            }
//
//
//            for (int i = commitShas.length / 2; i < commitShas.length; i++) {
//                TypeQLInsert insertPipelineAutomationQuery = TypeQL.match(cVar("commit").isa("commit").has("symbol", commitShas[i]), cVar("pipeline").isa("pipeline").has("name", "pipeline-B"))
//                        .insert(rel("pipeline", cVar("pipeline")).rel("trigger", cVar("commit")).isa("pipeline-automation")
//                        );
//                LOG.info("driverJavaE2E() - '" + insertPipelineAutomationQuery + "'");
//                List<ConceptRow> x = tx.query().insert(insertPipelineAutomationQuery).collect(toList());
//            }
//
//            tx.commit();
//
//            LOG.info("driverJavaE2E() - done.");
//        }, WRITE);
//
//        localhostTypeDBTX(tx -> {
//            LOG.info("driverJavaE2E() - inserting pipeline-automation relations...");
//
//            TypeQLInsert insertPipelineWorkflowQuery = TypeQL.match(cVar("pipelineA").isa("pipeline").has("name", "pipeline-A"),
//                            cVar("workflowA").isa("workflow").has("name", "workflow-A"), cVar("pipelineB").isa("pipeline").has("name", "pipeline-B"),
//                            cVar("workflowB").isa("workflow").has("name", "workflow-B"))
//                    .insert(rel("pipeline", cVar("pipelineA")).rel("workflow", cVar("workflowA")).isa("pipeline-workflow"),
//                            rel("pipeline", cVar("pipelineB")).rel("workflow", cVar("workflowB")).isa("pipeline-workflow"));
//            LOG.info("driverJavaE2E() - '" + insertPipelineWorkflowQuery + "'");
//            List<ConceptRow> x = tx.query().insert(insertPipelineWorkflowQuery).collect(toList());
//
//            tx.commit();
//
//            LOG.info("driverJavaE2E() - done.");
//        }, WRITE);
//
//        String[] queries = {
//                "match\n" +
//                        "$commit isa commit, has symbol \"VladGan/console@4bdc38acb87f9fd2fbdb7cbcf2bcc93837382cab\";\n" +
//                        "$_ (trigger: $commit, pipeline: $pipeline) isa pipeline-automation;\n" +
//                        "$pipeline has name $pipeline-name, has latest true;\n" +
//                        "$_ (pipeline: $pipeline, workflow: $workflow) isa pipeline-workflow;\n" +
//                        "$workflow has name $workflow-name, has status $workflow-status, has latest true;\n" +
//                        "get $pipeline-name, $workflow-name, $workflow-status;",
//                "match\n" +
//                        "$commit isa commit, has symbol \"VladGan/console@b5ecd4707ce425d7d2d4d0b0d53420cb46e8ce52\";\n" +
//                        "$_ (trigger: $commit, pipeline: $pipeline) isa pipeline-automation;\n" +
//                        "$pipeline has name $pipeline-name, has latest true;\n" +
//                        "$_ (pipeline: $pipeline, workflow: $workflow) isa pipeline-workflow;\n" +
//                        "$workflow has name $workflow-name, has status $workflow-status, has latest true;\n" +
//                        "get $pipeline-name, $workflow-name, $workflow-status;",
//                "match\n" +
//                        "$commit isa commit, has symbol \"VladGan/console@b16788637949c6b4c2a3a4bacc8da101bf838b38\";\n" +
//                        "$_ (trigger: $commit, pipeline: $pipeline) isa pipeline-automation;\n" +
//                        "$pipeline has name $pipeline-name, has latest true;\n" +
//                        "$_ (pipeline: $pipeline, workflow: $workflow) isa pipeline-workflow;\n" +
//                        "$workflow has name $workflow-name, has status $workflow-status, has latest true;\n" +
//                        "get $pipeline-name, $workflow-name, $workflow-status;",
//                "match\n" +
//                        "$commit isa commit, has symbol \"VladGan/console@8e996fdf8d802d270385ac3bc7cbf5fa77ac0583\";\n" +
//                        "$_ (trigger: $commit, pipeline: $pipeline) isa pipeline-automation;\n" +
//                        "$pipeline has name $pipeline-name, has latest true;\n" +
//                        "$_ (pipeline: $pipeline, workflow: $workflow) isa pipeline-workflow;\n" +
//                        "$workflow has name $workflow-name, has status $workflow-status, has latest true;\n" +
//                        "get $pipeline-name, $workflow-name, $workflow-status;",
//                "match\n" +
//                        "$commit isa commit, has symbol \"VladGan/console@1ff6651afa7abf43b5bdd3b1903e489d279e3dc6\";\n" +
//                        "$_ (trigger: $commit, pipeline: $pipeline) isa pipeline-automation;\n" +
//                        "$pipeline has name $pipeline-name, has latest true;\n" +
//                        "$_ (pipeline: $pipeline, workflow: $workflow) isa pipeline-workflow;\n" +
//                        "$workflow has name $workflow-name, has status $workflow-status, has latest true;\n" +
//                        "get $pipeline-name, $workflow-name, $workflow-status;",
//                "match\n" +
//                        "$commit isa commit, has symbol \"VladGan/console@6d3ceda79eb3e3dc86d266095b613a53fb083d30\";\n" +
//                        "$_ (trigger: $commit, pipeline: $pipeline) isa pipeline-automation;\n" +
//                        "$pipeline has name $pipeline-name, has latest true;\n" +
//                        "$_ (pipeline: $pipeline, workflow: $workflow) isa pipeline-workflow;\n" +
//                        "$workflow has name $workflow-name, has status $workflow-status, has latest true;\n" +
//                        "get $pipeline-name, $workflow-name, $workflow-status;",
//                "match\n" +
//                        "$commit isa commit, has symbol \"VladGan/console@23da5b400e32805c29f41671ff3f92ef48eafcf8\";\n" +
//                        "$_ (trigger: $commit, pipeline: $pipeline) isa pipeline-automation;\n" +
//                        "$pipeline has name $pipeline-name, has latest true;\n" +
//                        "$_ (pipeline: $pipeline, workflow: $workflow) isa pipeline-workflow;\n" +
//                        "$workflow has name $workflow-name, has status $workflow-status, has latest true;\n" +
//                        "get $pipeline-name, $workflow-name, $workflow-status;"
//        };
//
//        localhostTypeDBTX(tx -> {
//            LOG.info("driverJavaE2E() - inserting pipeline-automation relations...");
//
//            Stream.of(queries).parallel().forEach(x -> {
//                TypeQLGet q = TypeQL.parseQuery(x).asGet();
//                List<ConceptRow> res = tx.query().get(q).collect(toList());
//            });
//
//            LOG.info("driverJavaE2E() - done.");
//        }, READ);
//    }

    @Test
    public void testStreaming() {
        localhostTypeDBTX(tx -> {
            for (int i = 0; i < 51; i++) {
                tx.query(String.format("define entity person, owns name%d; attribute name%d, value string;", i, i)).resolve();
            }
            tx.commit();
        }, TypeDBTransaction.Type.SCHEMA);
        localhostTypeDBTX(tx -> {
            for (int i = 0; i < 50; i++) {
                Optional<ConceptRow> conceptRows = tx.query("match entity $et; $e isa $et; limit 1;").resolve().asConceptRowsStream().rows().findFirst();
            }
        }, TypeDBTransaction.Type.READ/*, new TypeDBOptions().prefetch(true).prefetchSize(50)*/);
    }

    @Test
    public void testMissingPortInURL() {
        try {
            String address = "127.0.0.1:1729";
            String addressWithoutPort = address.substring(0, address.lastIndexOf(':'));
            TypeDB.coreDriver(addressWithoutPort);
            fail();
        } catch (RuntimeException e) {
            assert e.toString().toLowerCase().contains("missing port");
        }
    }

    private String[] lionNames() {
        return new String[]{"male-partner", "female-partner", "young-lion"};
    }

    private void localhostTypeDBTX(Consumer<TypeDBTransaction> fn, TypeDBTransaction.Type type/*, TypeDBOptions options*/) {
        String database = "typedb";
        try (TypeDBTransaction transaction = typedbDriver.transaction(database, type/*, options*/)) {
            fn.accept(transaction);
        }
    }

    private String[] commitSHAs() {
        return new String[]{
                // queried commits
                "VladGan/console@4bdc38acb87f9fd2fbdb7cbcf2bcc93837382cab",
                "VladGan/console@b5ecd4707ce425d7d2d4d0b0d53420cb46e8ce52",
                "VladGan/console@b16788637949c6b4c2a3a4bacc8da101bf838b38",
                "VladGan/console@8e996fdf8d802d270385ac3bc7cbf5fa77ac0583",
                "VladGan/console@1ff6651afa7abf43b5bdd3b1903e489d279e3dc6",
                "VladGan/console@6d3ceda79eb3e3dc86d266095b613a53fb083d30",
                "VladGan/console@23da5b400e32805c29f41671ff3f92ef48eafcf8",
                // not queried commits
                "VladGan/console@0000000000000000000000000000000000000000",
                "VladGan/console@1111111111111111111111111111111111111111",
                "VladGan/console@2222222222222222222222222222222222222222",
        };
    }
}
