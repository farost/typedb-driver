# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import unittest
from unittest import TestCase

from hamcrest import *
from typedb.driver import *
import timeit

DB_NAME = "benchmark"


def set_up():
    with TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS) as driver:
        if driver.databases.contains(DB_NAME):
            driver.databases.get(DB_NAME).delete()
        driver.databases.create(DB_NAME)


def connection_open():
    driver = TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS)


def transaction_open(driver: Driver):
    tx = driver.transaction(DB_NAME, TransactionType.SCHEMA)


def schema_query(tx: Transaction):
    define_query = """
            define
              entity person, owns name, owns age;
              attribute name, value string;
              attribute age, value long;
            """
    answer = tx.query(define_query).resolve()


def write_query(tx: Transaction, query):
    rows = list(tx.query(query).resolve().as_concept_rows())

def write_read_query(tx: Transaction, write_query, read_query):
    tx.query(write_query).resolve()
    for doc in tx.query(read_query).resolve().as_concept_documents():
        print(doc)


def collect_row(rows):
    l = list(rows)
    print(l)


NUM = 1000

def bench_connection_open():
    execution_time = timeit.timeit(connection_open, number=NUM)
    print(f"Connection open: {execution_time / NUM} s per run")

def bench_transaction_open():
    with TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS) as driver:
        execution_time = timeit.timeit(lambda: transaction_open(driver), number=NUM)
        print(f"Transaction open: {execution_time / NUM} s per run")

def bench_schema_query():
    with TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS) as driver:
        with driver.transaction(DB_NAME, TransactionType.SCHEMA) as tx:
            execution_time = timeit.timeit(lambda: schema_query(tx), number=NUM)
            print(f"Schema query: {execution_time / NUM} s per run")

def bench_write_query():
    with TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS) as driver:
        with driver.transaction(DB_NAME, TransactionType.WRITE) as tx:
            insert_query = 'insert $p isa person, has name "John", has age 15;'
            execution_time = timeit.timeit(lambda: write_query(tx, insert_query), number=NUM)
            print(f"Write query: {execution_time / NUM} s per run")

def bench_large_write_query():
    with TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS) as driver:
        with driver.transaction(DB_NAME, TransactionType.WRITE) as tx:
            query = prepare_large_write_query()
            read_query = prepare_large_read_query()
            print("Starting the large write query")
            execution_time = timeit.timeit(lambda: write_read_query(tx, query, read_query), number=int(NUM / 10))
            print(f"Large write query: {execution_time / NUM / 10} s per run")


def prepare_large_write_query():
    result = "insert "
    for i in range(0, 1):
        result += f'$p{i} isa person, has name "John", has age {i}; '
    return result

def prepare_large_read_query():
    result = "match "
    for i in range(0, 1):
        result += f'$p{i} isa person, has name "John", has age {i}; '

    result += "\nfetch {\n "
    for i in range(0, 50):
        result += f'"{i}": $p0.age,\n'
    result += " };"

    return result


if __name__ == "__main__":
    set_up()

    bench_connection_open()
    bench_transaction_open()
    bench_schema_query()

    with TypeDB.core_driver(TypeDB.DEFAULT_ADDRESS) as driver:
        with driver.transaction(DB_NAME, TransactionType.SCHEMA) as tx:
            schema_query(tx)
            tx.commit()

    bench_write_query()

    bench_large_write_query()

