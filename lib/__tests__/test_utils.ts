// Copyright 2020 Luke Shay. All rights reserved. MIT license.

export function testName(module: string, func: string, test: string): string {
  const moduleLen = 12;
  const funcLen = 20;
  const testLen = 40;

  let moduleFormatted = module;
  let funcFormatted = func;
  let testFormatted = test;

  for (let i = module.length; i < moduleLen; i++) {
    moduleFormatted += " ";
  }

  for (let i = func.length; i < funcLen; i++) {
    funcFormatted += " ";
  }

  for (let i = test.length; i < testLen; i++) {
    testFormatted += " ";
  }

  return `${moduleFormatted} | ${funcFormatted} | ${testFormatted}`;
}
