import { assert } from "../../deps_test.ts";
import {
  isString,
  isAsyncFunc,
  isObject,
  isSyncFunc,
  isFunc,
} from "../utils.ts";
import { testName } from "./test_utils.ts";

Deno.test(
  {
    name: testName("utils", "isString", "should return true"),
    fn: () => {
      const str = "asdf";
      assert(isString(str));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isString", "should return false"),
    fn: () => {
      const str = 1;
      assert(!isString(str));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isAsyncFunc", "should return true"),
    fn: () => {
      const func = async () => {};
      assert(isAsyncFunc(func));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isAsyncFunc", "should return false"),
    fn: () => {
      const func = () => {};
      assert(!isAsyncFunc(func));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isSyncFunc", "should return true"),
    fn: () => {
      const func = () => {};
      assert(isSyncFunc(func));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isSyncFunc", "should return false"),
    fn: () => {
      const func = async () => {};
      assert(!isSyncFunc(func));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isFunc", "should return true"),
    fn: () => {
      const syncFunc = () => {};
      assert(isFunc(syncFunc));

      const asyncFunc = async () => {};
      assert(isFunc(asyncFunc));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isFunc", "should return false"),
    fn: () => {
      const syncFunc = "[object Function]";
      assert(!isFunc(syncFunc));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isObject", "should return true"),
    fn: () => {
      const syncFunc = {};
      assert(isObject(syncFunc));
    },
  },
);

Deno.test(
  {
    name: testName("utils", "isObject", "should return false"),
    fn: () => {
      const syncFunc = "[object Object]";
      assert(!isObject(syncFunc));
    },
  },
);
