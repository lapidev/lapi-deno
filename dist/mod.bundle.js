// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("https://deno.land/std@0.71.0/_util/assert", [], function (exports_1, context_1) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_1 && context_1.id;
    function assert(expr, msg = "") {
        if (!expr) {
            throw new DenoStdInternalError(msg);
        }
    }
    exports_1("assert", assert);
    return {
        setters: [],
        execute: function () {
            DenoStdInternalError = class DenoStdInternalError extends Error {
                constructor(message) {
                    super(message);
                    this.name = "DenoStdInternalError";
                }
            };
            exports_1("DenoStdInternalError", DenoStdInternalError);
        }
    };
});
System.register("https://deno.land/std@0.71.0/datetime/tokenizer", [], function (exports_2, context_2) {
    "use strict";
    var Tokenizer;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            Tokenizer = class Tokenizer {
                constructor(rules = []) {
                    this.rules = rules;
                }
                addRule(test, fn) {
                    this.rules.push({ test, fn });
                    return this;
                }
                tokenize(string, receiver = (token) => token) {
                    function* generator(rules) {
                        let index = 0;
                        for (const rule of rules) {
                            const result = rule.test(string);
                            if (result) {
                                const { value, length } = result;
                                index += length;
                                string = string.slice(length);
                                const token = { ...rule.fn(value), index };
                                yield receiver(token);
                                yield* generator(rules);
                            }
                        }
                    }
                    const tokenGenerator = generator(this.rules);
                    const tokens = [];
                    for (const token of tokenGenerator) {
                        tokens.push(token);
                    }
                    if (string.length) {
                        throw new Error(`parser error: string not fully parsed! ${string.slice(0, 25)}`);
                    }
                    return tokens;
                }
            };
            exports_2("Tokenizer", Tokenizer);
        }
    };
});
System.register("https://deno.land/std@0.71.0/datetime/formatter", ["https://deno.land/std@0.71.0/datetime/tokenizer"], function (exports_3, context_3) {
    "use strict";
    var tokenizer_ts_1, defaultRules, DateTimeFormatter;
    var __moduleName = context_3 && context_3.id;
    function digits(value, count = 2) {
        return String(value).padStart(count, "0");
    }
    function createLiteralTestFunction(value) {
        return (string) => {
            return string.startsWith(value)
                ? { value, length: value.length }
                : undefined;
        };
    }
    function createMatchTestFunction(match) {
        return (string) => {
            const result = match.exec(string);
            if (result)
                return { value: result, length: result[0].length };
        };
    }
    return {
        setters: [
            function (tokenizer_ts_1_1) {
                tokenizer_ts_1 = tokenizer_ts_1_1;
            }
        ],
        execute: function () {
            defaultRules = [
                {
                    test: createLiteralTestFunction("yyyy"),
                    fn: () => ({ type: "year", value: "numeric" }),
                },
                {
                    test: createLiteralTestFunction("yy"),
                    fn: () => ({ type: "year", value: "2-digit" }),
                },
                {
                    test: createLiteralTestFunction("MM"),
                    fn: () => ({ type: "month", value: "2-digit" }),
                },
                {
                    test: createLiteralTestFunction("M"),
                    fn: () => ({ type: "month", value: "numeric" }),
                },
                {
                    test: createLiteralTestFunction("dd"),
                    fn: () => ({ type: "day", value: "2-digit" }),
                },
                {
                    test: createLiteralTestFunction("d"),
                    fn: () => ({ type: "day", value: "numeric" }),
                },
                {
                    test: createLiteralTestFunction("HH"),
                    fn: () => ({ type: "hour", value: "2-digit" }),
                },
                {
                    test: createLiteralTestFunction("H"),
                    fn: () => ({ type: "hour", value: "numeric" }),
                },
                {
                    test: createLiteralTestFunction("hh"),
                    fn: () => ({
                        type: "hour",
                        value: "2-digit",
                        hour12: true,
                    }),
                },
                {
                    test: createLiteralTestFunction("h"),
                    fn: () => ({
                        type: "hour",
                        value: "numeric",
                        hour12: true,
                    }),
                },
                {
                    test: createLiteralTestFunction("mm"),
                    fn: () => ({ type: "minute", value: "2-digit" }),
                },
                {
                    test: createLiteralTestFunction("m"),
                    fn: () => ({ type: "minute", value: "numeric" }),
                },
                {
                    test: createLiteralTestFunction("ss"),
                    fn: () => ({ type: "second", value: "2-digit" }),
                },
                {
                    test: createLiteralTestFunction("s"),
                    fn: () => ({ type: "second", value: "numeric" }),
                },
                {
                    test: createLiteralTestFunction("SSS"),
                    fn: () => ({ type: "fractionalSecond", value: 3 }),
                },
                {
                    test: createLiteralTestFunction("SS"),
                    fn: () => ({ type: "fractionalSecond", value: 2 }),
                },
                {
                    test: createLiteralTestFunction("S"),
                    fn: () => ({ type: "fractionalSecond", value: 1 }),
                },
                {
                    test: createLiteralTestFunction("a"),
                    fn: (value) => ({
                        type: "dayPeriod",
                        value: value,
                    }),
                },
                {
                    test: createMatchTestFunction(/^(')(?<value>\\.|[^\']*)\1/),
                    fn: (match) => ({
                        type: "literal",
                        value: match.groups.value,
                    }),
                },
                {
                    test: createMatchTestFunction(/^.+?\s*/),
                    fn: (match) => ({
                        type: "literal",
                        value: match[0],
                    }),
                },
            ];
            DateTimeFormatter = class DateTimeFormatter {
                constructor(formatString, rules = defaultRules) {
                    const tokenizer = new tokenizer_ts_1.Tokenizer(rules);
                    this.#format = tokenizer.tokenize(formatString, ({ type, value, hour12 }) => {
                        const result = {
                            type,
                            value,
                        };
                        if (hour12)
                            result.hour12 = hour12;
                        return result;
                    });
                }
                #format;
                format(date, options = {}) {
                    let string = "";
                    const utc = options.timeZone === "UTC";
                    for (const token of this.#format) {
                        const type = token.type;
                        switch (type) {
                            case "year": {
                                const value = utc ? date.getUTCFullYear() : date.getFullYear();
                                switch (token.value) {
                                    case "numeric": {
                                        string += value;
                                        break;
                                    }
                                    case "2-digit": {
                                        string += digits(value, 2).slice(-2);
                                        break;
                                    }
                                    default:
                                        throw Error(`FormatterError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "month": {
                                const value = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
                                switch (token.value) {
                                    case "numeric": {
                                        string += value;
                                        break;
                                    }
                                    case "2-digit": {
                                        string += digits(value, 2);
                                        break;
                                    }
                                    default:
                                        throw Error(`FormatterError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "day": {
                                const value = utc ? date.getUTCDate() : date.getDate();
                                switch (token.value) {
                                    case "numeric": {
                                        string += value;
                                        break;
                                    }
                                    case "2-digit": {
                                        string += digits(value, 2);
                                        break;
                                    }
                                    default:
                                        throw Error(`FormatterError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "hour": {
                                let value = utc ? date.getUTCHours() : date.getHours();
                                value -= token.hour12 && date.getHours() > 12 ? 12 : 0;
                                switch (token.value) {
                                    case "numeric": {
                                        string += value;
                                        break;
                                    }
                                    case "2-digit": {
                                        string += digits(value, 2);
                                        break;
                                    }
                                    default:
                                        throw Error(`FormatterError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "minute": {
                                const value = utc ? date.getUTCMinutes() : date.getMinutes();
                                switch (token.value) {
                                    case "numeric": {
                                        string += value;
                                        break;
                                    }
                                    case "2-digit": {
                                        string += digits(value, 2);
                                        break;
                                    }
                                    default:
                                        throw Error(`FormatterError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "second": {
                                const value = utc ? date.getUTCSeconds() : date.getSeconds();
                                switch (token.value) {
                                    case "numeric": {
                                        string += value;
                                        break;
                                    }
                                    case "2-digit": {
                                        string += digits(value, 2);
                                        break;
                                    }
                                    default:
                                        throw Error(`FormatterError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "fractionalSecond": {
                                const value = utc
                                    ? date.getUTCMilliseconds()
                                    : date.getMilliseconds();
                                string += digits(value, Number(token.value));
                                break;
                            }
                            case "timeZoneName": {
                            }
                            case "dayPeriod": {
                                string += token.value ? (date.getHours() >= 12 ? "PM" : "AM") : "";
                                break;
                            }
                            case "literal": {
                                string += token.value;
                                break;
                            }
                            default:
                                throw Error(`FormatterError: { ${token.type} ${token.value} }`);
                        }
                    }
                    return string;
                }
                parseToParts(string) {
                    const parts = [];
                    for (const token of this.#format) {
                        const type = token.type;
                        let value = "";
                        switch (token.type) {
                            case "year": {
                                switch (token.value) {
                                    case "numeric": {
                                        value = /^\d{1,4}/.exec(string)?.[0];
                                        break;
                                    }
                                    case "2-digit": {
                                        value = /^\d{1,2}/.exec(string)?.[0];
                                        break;
                                    }
                                }
                                break;
                            }
                            case "month": {
                                switch (token.value) {
                                    case "numeric": {
                                        value = /^\d{1,2}/.exec(string)?.[0];
                                        break;
                                    }
                                    case "2-digit": {
                                        value = /^\d{2}/.exec(string)?.[0];
                                        break;
                                    }
                                    case "narrow": {
                                        value = /^[a-zA-Z]+/.exec(string)?.[0];
                                        break;
                                    }
                                    case "short": {
                                        value = /^[a-zA-Z]+/.exec(string)?.[0];
                                        break;
                                    }
                                    case "long": {
                                        value = /^[a-zA-Z]+/.exec(string)?.[0];
                                        break;
                                    }
                                    default:
                                        throw Error(`ParserError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "day": {
                                switch (token.value) {
                                    case "numeric": {
                                        value = /^\d{1,2}/.exec(string)?.[0];
                                        break;
                                    }
                                    case "2-digit": {
                                        value = /^\d{2}/.exec(string)?.[0];
                                        break;
                                    }
                                    default:
                                        throw Error(`ParserError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "hour": {
                                switch (token.value) {
                                    case "numeric": {
                                        value = /^\d{1,2}/.exec(string)?.[0];
                                        if (token.hour12 && parseInt(value) > 12) {
                                            console.error(`Trying to parse hour greater than 12. Use 'H' instead of 'h'.`);
                                        }
                                        break;
                                    }
                                    case "2-digit": {
                                        value = /^\d{2}/.exec(string)?.[0];
                                        if (token.hour12 && parseInt(value) > 12) {
                                            console.error(`Trying to parse hour greater than 12. Use 'HH' instead of 'hh'.`);
                                        }
                                        break;
                                    }
                                    default:
                                        throw Error(`ParserError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "minute": {
                                switch (token.value) {
                                    case "numeric": {
                                        value = /^\d{1,2}/.exec(string)?.[0];
                                        break;
                                    }
                                    case "2-digit": {
                                        value = /^\d{2}/.exec(string)?.[0];
                                        break;
                                    }
                                    default:
                                        throw Error(`ParserError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "second": {
                                switch (token.value) {
                                    case "numeric": {
                                        value = /^\d{1,2}/.exec(string)?.[0];
                                        break;
                                    }
                                    case "2-digit": {
                                        value = /^\d{2}/.exec(string)?.[0];
                                        break;
                                    }
                                    default:
                                        throw Error(`ParserError: value "${token.value}" is not supported`);
                                }
                                break;
                            }
                            case "fractionalSecond": {
                                value = new RegExp(`^\\d{${token.value}}`).exec(string)?.[0];
                                break;
                            }
                            case "timeZoneName": {
                                value = token.value;
                                break;
                            }
                            case "dayPeriod": {
                                value = /^(A|P)M/.exec(string)?.[0];
                                break;
                            }
                            case "literal": {
                                if (!string.startsWith(token.value)) {
                                    throw Error(`Literal "${token.value}" not found "${string.slice(0, 25)}"`);
                                }
                                value = token.value;
                                break;
                            }
                            default:
                                throw Error(`${token.type} ${token.value}`);
                        }
                        if (!value) {
                            throw Error(`value not valid for token { ${type} ${value} } ${string.slice(0, 25)}`);
                        }
                        parts.push({ type, value });
                        string = string.slice(value.length);
                    }
                    if (string.length) {
                        throw Error(`datetime string was not fully parsed! ${string.slice(0, 25)}`);
                    }
                    return parts;
                }
                partsToDate(parts) {
                    const date = new Date();
                    const utc = parts.find((part) => part.type === "timeZoneName" && part.value === "UTC");
                    utc ? date.setUTCHours(0, 0, 0, 0) : date.setHours(0, 0, 0, 0);
                    for (const part of parts) {
                        switch (part.type) {
                            case "year": {
                                const value = Number(part.value.padStart(4, "20"));
                                utc ? date.setUTCFullYear(value) : date.setFullYear(value);
                                break;
                            }
                            case "month": {
                                const value = Number(part.value) - 1;
                                utc ? date.setUTCMonth(value) : date.setMonth(value);
                                break;
                            }
                            case "day": {
                                const value = Number(part.value);
                                utc ? date.setUTCDate(value) : date.setDate(value);
                                break;
                            }
                            case "hour": {
                                let value = Number(part.value);
                                const dayPeriod = parts.find((part) => part.type === "dayPeriod");
                                if (dayPeriod?.value === "PM")
                                    value += 12;
                                utc ? date.setUTCHours(value) : date.setHours(value);
                                break;
                            }
                            case "minute": {
                                const value = Number(part.value);
                                utc ? date.setUTCMinutes(value) : date.setMinutes(value);
                                break;
                            }
                            case "second": {
                                const value = Number(part.value);
                                utc ? date.setUTCSeconds(value) : date.setSeconds(value);
                                break;
                            }
                            case "fractionalSecond": {
                                const value = Number(part.value);
                                utc ? date.setUTCMilliseconds(value) : date.setMilliseconds(value);
                                break;
                            }
                        }
                    }
                    return date;
                }
                parse(string) {
                    const parts = this.parseToParts(string);
                    return this.partsToDate(parts);
                }
            };
            exports_3("DateTimeFormatter", DateTimeFormatter);
        }
    };
});
System.register("https://deno.land/std@0.71.0/datetime/mod", ["https://deno.land/std@0.71.0/datetime/formatter"], function (exports_4, context_4) {
    "use strict";
    var formatter_ts_1, SECOND, MINUTE, HOUR, DAY, WEEK, DAYS_PER_WEEK, Day;
    var __moduleName = context_4 && context_4.id;
    function parse(dateString, formatString) {
        const formatter = new formatter_ts_1.DateTimeFormatter(formatString);
        const parts = formatter.parseToParts(dateString);
        return formatter.partsToDate(parts);
    }
    exports_4("parse", parse);
    function format(date, formatString) {
        const formatter = new formatter_ts_1.DateTimeFormatter(formatString);
        return formatter.format(date);
    }
    exports_4("format", format);
    function dayOfYear(date) {
        const yearStart = new Date(date);
        yearStart.setUTCFullYear(date.getUTCFullYear(), 0, 0);
        const diff = date.getTime() -
            yearStart.getTime() +
            (yearStart.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
        return Math.floor(diff / DAY);
    }
    exports_4("dayOfYear", dayOfYear);
    function weekOfYear(date) {
        const workingDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const day = workingDate.getUTCDay();
        const nearestThursday = workingDate.getUTCDate() +
            Day.Thu -
            (day === Day.Sun ? DAYS_PER_WEEK : day);
        workingDate.setUTCDate(nearestThursday);
        const yearStart = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 1));
        return Math.ceil((workingDate.getTime() - yearStart.getTime() + DAY) / WEEK);
    }
    exports_4("weekOfYear", weekOfYear);
    function toIMF(date) {
        function dtPad(v, lPad = 2) {
            return v.padStart(lPad, "0");
        }
        const d = dtPad(date.getUTCDate().toString());
        const h = dtPad(date.getUTCHours().toString());
        const min = dtPad(date.getUTCMinutes().toString());
        const s = dtPad(date.getUTCSeconds().toString());
        const y = date.getUTCFullYear();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        return `${days[date.getUTCDay()]}, ${d} ${months[date.getUTCMonth()]} ${y} ${h}:${min}:${s} GMT`;
    }
    exports_4("toIMF", toIMF);
    function isLeap(year) {
        const yearNumber = year instanceof Date ? year.getFullYear() : year;
        return ((yearNumber % 4 === 0 && yearNumber % 100 !== 0) || yearNumber % 400 === 0);
    }
    exports_4("isLeap", isLeap);
    function difference(from, to, options) {
        const uniqueUnits = options?.units ? [...new Set(options?.units)] : [
            "milliseconds",
            "seconds",
            "minutes",
            "hours",
            "days",
            "weeks",
            "months",
            "quarters",
            "years",
        ];
        const bigger = Math.max(from.getTime(), to.getTime());
        const smaller = Math.min(from.getTime(), to.getTime());
        const differenceInMs = bigger - smaller;
        const differences = {};
        for (const uniqueUnit of uniqueUnits) {
            switch (uniqueUnit) {
                case "milliseconds":
                    differences.milliseconds = differenceInMs;
                    break;
                case "seconds":
                    differences.seconds = Math.floor(differenceInMs / SECOND);
                    break;
                case "minutes":
                    differences.minutes = Math.floor(differenceInMs / MINUTE);
                    break;
                case "hours":
                    differences.hours = Math.floor(differenceInMs / HOUR);
                    break;
                case "days":
                    differences.days = Math.floor(differenceInMs / DAY);
                    break;
                case "weeks":
                    differences.weeks = Math.floor(differenceInMs / WEEK);
                    break;
                case "months":
                    differences.months = calculateMonthsDifference(bigger, smaller);
                    break;
                case "quarters":
                    differences.quarters = Math.floor((typeof differences.months !== "undefined" &&
                        differences.months / 4) ||
                        calculateMonthsDifference(bigger, smaller) / 4);
                    break;
                case "years":
                    differences.years = Math.floor((typeof differences.months !== "undefined" &&
                        differences.months / 12) ||
                        calculateMonthsDifference(bigger, smaller) / 12);
                    break;
            }
        }
        return differences;
    }
    exports_4("difference", difference);
    function calculateMonthsDifference(bigger, smaller) {
        const biggerDate = new Date(bigger);
        const smallerDate = new Date(smaller);
        const yearsDiff = biggerDate.getFullYear() - smallerDate.getFullYear();
        const monthsDiff = biggerDate.getMonth() - smallerDate.getMonth();
        const calendarDiffrences = Math.abs(yearsDiff * 12 + monthsDiff);
        const compareResult = biggerDate > smallerDate ? 1 : -1;
        biggerDate.setMonth(biggerDate.getMonth() - compareResult * calendarDiffrences);
        const isLastMonthNotFull = biggerDate > smallerDate
            ? 1
            : -1 === -compareResult
                ? 1
                : 0;
        const months = compareResult * (calendarDiffrences - isLastMonthNotFull);
        return months === 0 ? 0 : months;
    }
    return {
        setters: [
            function (formatter_ts_1_1) {
                formatter_ts_1 = formatter_ts_1_1;
            }
        ],
        execute: function () {
            exports_4("SECOND", SECOND = 1e3);
            exports_4("MINUTE", MINUTE = SECOND * 60);
            exports_4("HOUR", HOUR = MINUTE * 60);
            exports_4("DAY", DAY = HOUR * 24);
            exports_4("WEEK", WEEK = DAY * 7);
            DAYS_PER_WEEK = 7;
            (function (Day) {
                Day[Day["Sun"] = 0] = "Sun";
                Day[Day["Mon"] = 1] = "Mon";
                Day[Day["Tue"] = 2] = "Tue";
                Day[Day["Wed"] = 3] = "Wed";
                Day[Day["Thu"] = 4] = "Thu";
                Day[Day["Fri"] = 5] = "Fri";
                Day[Day["Sat"] = 6] = "Sat";
            })(Day || (Day = {}));
        }
    };
});
System.register("https://deno.land/std@0.71.0/http/cookie", ["https://deno.land/std@0.71.0/_util/assert", "https://deno.land/std@0.71.0/datetime/mod"], function (exports_5, context_5) {
    "use strict";
    var assert_ts_1, mod_ts_1;
    var __moduleName = context_5 && context_5.id;
    function toString(cookie) {
        if (!cookie.name) {
            return "";
        }
        const out = [];
        out.push(`${cookie.name}=${cookie.value}`);
        if (cookie.name.startsWith("__Secure")) {
            cookie.secure = true;
        }
        if (cookie.name.startsWith("__Host")) {
            cookie.path = "/";
            cookie.secure = true;
            delete cookie.domain;
        }
        if (cookie.secure) {
            out.push("Secure");
        }
        if (cookie.httpOnly) {
            out.push("HttpOnly");
        }
        if (typeof cookie.maxAge === "number" && Number.isInteger(cookie.maxAge)) {
            assert_ts_1.assert(cookie.maxAge > 0, "Max-Age must be an integer superior to 0");
            out.push(`Max-Age=${cookie.maxAge}`);
        }
        if (cookie.domain) {
            out.push(`Domain=${cookie.domain}`);
        }
        if (cookie.sameSite) {
            out.push(`SameSite=${cookie.sameSite}`);
        }
        if (cookie.path) {
            out.push(`Path=${cookie.path}`);
        }
        if (cookie.expires) {
            const dateString = mod_ts_1.toIMF(cookie.expires);
            out.push(`Expires=${dateString}`);
        }
        if (cookie.unparsed) {
            out.push(cookie.unparsed.join("; "));
        }
        return out.join("; ");
    }
    function getCookies(req) {
        const cookie = req.headers.get("Cookie");
        if (cookie != null) {
            const out = {};
            const c = cookie.split(";");
            for (const kv of c) {
                const [cookieKey, ...cookieVal] = kv.split("=");
                assert_ts_1.assert(cookieKey != null);
                const key = cookieKey.trim();
                out[key] = cookieVal.join("=");
            }
            return out;
        }
        return {};
    }
    exports_5("getCookies", getCookies);
    function setCookie(res, cookie) {
        if (!res.headers) {
            res.headers = new Headers();
        }
        const v = toString(cookie);
        if (v) {
            res.headers.append("Set-Cookie", v);
        }
    }
    exports_5("setCookie", setCookie);
    function deleteCookie(res, name) {
        setCookie(res, {
            name: name,
            value: "",
            expires: new Date(0),
        });
    }
    exports_5("deleteCookie", deleteCookie);
    return {
        setters: [
            function (assert_ts_1_1) {
                assert_ts_1 = assert_ts_1_1;
            },
            function (mod_ts_1_1) {
                mod_ts_1 = mod_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.71.0/http/http_status", [], function (exports_6, context_6) {
    "use strict";
    var Status, STATUS_TEXT;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
            (function (Status) {
                Status[Status["Continue"] = 100] = "Continue";
                Status[Status["SwitchingProtocols"] = 101] = "SwitchingProtocols";
                Status[Status["Processing"] = 102] = "Processing";
                Status[Status["EarlyHints"] = 103] = "EarlyHints";
                Status[Status["OK"] = 200] = "OK";
                Status[Status["Created"] = 201] = "Created";
                Status[Status["Accepted"] = 202] = "Accepted";
                Status[Status["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
                Status[Status["NoContent"] = 204] = "NoContent";
                Status[Status["ResetContent"] = 205] = "ResetContent";
                Status[Status["PartialContent"] = 206] = "PartialContent";
                Status[Status["MultiStatus"] = 207] = "MultiStatus";
                Status[Status["AlreadyReported"] = 208] = "AlreadyReported";
                Status[Status["IMUsed"] = 226] = "IMUsed";
                Status[Status["MultipleChoices"] = 300] = "MultipleChoices";
                Status[Status["MovedPermanently"] = 301] = "MovedPermanently";
                Status[Status["Found"] = 302] = "Found";
                Status[Status["SeeOther"] = 303] = "SeeOther";
                Status[Status["NotModified"] = 304] = "NotModified";
                Status[Status["UseProxy"] = 305] = "UseProxy";
                Status[Status["TemporaryRedirect"] = 307] = "TemporaryRedirect";
                Status[Status["PermanentRedirect"] = 308] = "PermanentRedirect";
                Status[Status["BadRequest"] = 400] = "BadRequest";
                Status[Status["Unauthorized"] = 401] = "Unauthorized";
                Status[Status["PaymentRequired"] = 402] = "PaymentRequired";
                Status[Status["Forbidden"] = 403] = "Forbidden";
                Status[Status["NotFound"] = 404] = "NotFound";
                Status[Status["MethodNotAllowed"] = 405] = "MethodNotAllowed";
                Status[Status["NotAcceptable"] = 406] = "NotAcceptable";
                Status[Status["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
                Status[Status["RequestTimeout"] = 408] = "RequestTimeout";
                Status[Status["Conflict"] = 409] = "Conflict";
                Status[Status["Gone"] = 410] = "Gone";
                Status[Status["LengthRequired"] = 411] = "LengthRequired";
                Status[Status["PreconditionFailed"] = 412] = "PreconditionFailed";
                Status[Status["RequestEntityTooLarge"] = 413] = "RequestEntityTooLarge";
                Status[Status["RequestURITooLong"] = 414] = "RequestURITooLong";
                Status[Status["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
                Status[Status["RequestedRangeNotSatisfiable"] = 416] = "RequestedRangeNotSatisfiable";
                Status[Status["ExpectationFailed"] = 417] = "ExpectationFailed";
                Status[Status["Teapot"] = 418] = "Teapot";
                Status[Status["MisdirectedRequest"] = 421] = "MisdirectedRequest";
                Status[Status["UnprocessableEntity"] = 422] = "UnprocessableEntity";
                Status[Status["Locked"] = 423] = "Locked";
                Status[Status["FailedDependency"] = 424] = "FailedDependency";
                Status[Status["TooEarly"] = 425] = "TooEarly";
                Status[Status["UpgradeRequired"] = 426] = "UpgradeRequired";
                Status[Status["PreconditionRequired"] = 428] = "PreconditionRequired";
                Status[Status["TooManyRequests"] = 429] = "TooManyRequests";
                Status[Status["RequestHeaderFieldsTooLarge"] = 431] = "RequestHeaderFieldsTooLarge";
                Status[Status["UnavailableForLegalReasons"] = 451] = "UnavailableForLegalReasons";
                Status[Status["InternalServerError"] = 500] = "InternalServerError";
                Status[Status["NotImplemented"] = 501] = "NotImplemented";
                Status[Status["BadGateway"] = 502] = "BadGateway";
                Status[Status["ServiceUnavailable"] = 503] = "ServiceUnavailable";
                Status[Status["GatewayTimeout"] = 504] = "GatewayTimeout";
                Status[Status["HTTPVersionNotSupported"] = 505] = "HTTPVersionNotSupported";
                Status[Status["VariantAlsoNegotiates"] = 506] = "VariantAlsoNegotiates";
                Status[Status["InsufficientStorage"] = 507] = "InsufficientStorage";
                Status[Status["LoopDetected"] = 508] = "LoopDetected";
                Status[Status["NotExtended"] = 510] = "NotExtended";
                Status[Status["NetworkAuthenticationRequired"] = 511] = "NetworkAuthenticationRequired";
            })(Status || (Status = {}));
            exports_6("Status", Status);
            exports_6("STATUS_TEXT", STATUS_TEXT = new Map([
                [Status.Continue, "Continue"],
                [Status.SwitchingProtocols, "Switching Protocols"],
                [Status.Processing, "Processing"],
                [Status.EarlyHints, "Early Hints"],
                [Status.OK, "OK"],
                [Status.Created, "Created"],
                [Status.Accepted, "Accepted"],
                [Status.NonAuthoritativeInfo, "Non-Authoritative Information"],
                [Status.NoContent, "No Content"],
                [Status.ResetContent, "Reset Content"],
                [Status.PartialContent, "Partial Content"],
                [Status.MultiStatus, "Multi-Status"],
                [Status.AlreadyReported, "Already Reported"],
                [Status.IMUsed, "IM Used"],
                [Status.MultipleChoices, "Multiple Choices"],
                [Status.MovedPermanently, "Moved Permanently"],
                [Status.Found, "Found"],
                [Status.SeeOther, "See Other"],
                [Status.NotModified, "Not Modified"],
                [Status.UseProxy, "Use Proxy"],
                [Status.TemporaryRedirect, "Temporary Redirect"],
                [Status.PermanentRedirect, "Permanent Redirect"],
                [Status.BadRequest, "Bad Request"],
                [Status.Unauthorized, "Unauthorized"],
                [Status.PaymentRequired, "Payment Required"],
                [Status.Forbidden, "Forbidden"],
                [Status.NotFound, "Not Found"],
                [Status.MethodNotAllowed, "Method Not Allowed"],
                [Status.NotAcceptable, "Not Acceptable"],
                [Status.ProxyAuthRequired, "Proxy Authentication Required"],
                [Status.RequestTimeout, "Request Timeout"],
                [Status.Conflict, "Conflict"],
                [Status.Gone, "Gone"],
                [Status.LengthRequired, "Length Required"],
                [Status.PreconditionFailed, "Precondition Failed"],
                [Status.RequestEntityTooLarge, "Request Entity Too Large"],
                [Status.RequestURITooLong, "Request URI Too Long"],
                [Status.UnsupportedMediaType, "Unsupported Media Type"],
                [Status.RequestedRangeNotSatisfiable, "Requested Range Not Satisfiable"],
                [Status.ExpectationFailed, "Expectation Failed"],
                [Status.Teapot, "I'm a teapot"],
                [Status.MisdirectedRequest, "Misdirected Request"],
                [Status.UnprocessableEntity, "Unprocessable Entity"],
                [Status.Locked, "Locked"],
                [Status.FailedDependency, "Failed Dependency"],
                [Status.TooEarly, "Too Early"],
                [Status.UpgradeRequired, "Upgrade Required"],
                [Status.PreconditionRequired, "Precondition Required"],
                [Status.TooManyRequests, "Too Many Requests"],
                [Status.RequestHeaderFieldsTooLarge, "Request Header Fields Too Large"],
                [Status.UnavailableForLegalReasons, "Unavailable For Legal Reasons"],
                [Status.InternalServerError, "Internal Server Error"],
                [Status.NotImplemented, "Not Implemented"],
                [Status.BadGateway, "Bad Gateway"],
                [Status.ServiceUnavailable, "Service Unavailable"],
                [Status.GatewayTimeout, "Gateway Timeout"],
                [Status.HTTPVersionNotSupported, "HTTP Version Not Supported"],
                [Status.VariantAlsoNegotiates, "Variant Also Negotiates"],
                [Status.InsufficientStorage, "Insufficient Storage"],
                [Status.LoopDetected, "Loop Detected"],
                [Status.NotExtended, "Not Extended"],
                [Status.NetworkAuthenticationRequired, "Network Authentication Required"],
            ]));
        }
    };
});
System.register("https://deno.land/std@0.71.0/encoding/utf8", [], function (exports_7, context_7) {
    "use strict";
    var encoder, decoder;
    var __moduleName = context_7 && context_7.id;
    function encode(input) {
        return encoder.encode(input);
    }
    exports_7("encode", encode);
    function decode(input) {
        return decoder.decode(input);
    }
    exports_7("decode", decode);
    return {
        setters: [],
        execute: function () {
            exports_7("encoder", encoder = new TextEncoder());
            exports_7("decoder", decoder = new TextDecoder());
        }
    };
});
System.register("https://deno.land/std@0.71.0/bytes/mod", [], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    function findIndex(source, pat) {
        const s = pat[0];
        for (let i = 0; i < source.length; i++) {
            if (source[i] !== s)
                continue;
            const pin = i;
            let matched = 1;
            let j = i;
            while (matched < pat.length) {
                j++;
                if (source[j] !== pat[j - pin]) {
                    break;
                }
                matched++;
            }
            if (matched === pat.length) {
                return pin;
            }
        }
        return -1;
    }
    exports_8("findIndex", findIndex);
    function findLastIndex(source, pat) {
        const e = pat[pat.length - 1];
        for (let i = source.length - 1; i >= 0; i--) {
            if (source[i] !== e)
                continue;
            const pin = i;
            let matched = 1;
            let j = i;
            while (matched < pat.length) {
                j--;
                if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
                    break;
                }
                matched++;
            }
            if (matched === pat.length) {
                return pin - pat.length + 1;
            }
        }
        return -1;
    }
    exports_8("findLastIndex", findLastIndex);
    function equal(source, match) {
        if (source.length !== match.length)
            return false;
        for (let i = 0; i < match.length; i++) {
            if (source[i] !== match[i])
                return false;
        }
        return true;
    }
    exports_8("equal", equal);
    function hasPrefix(source, prefix) {
        for (let i = 0, max = prefix.length; i < max; i++) {
            if (source[i] !== prefix[i])
                return false;
        }
        return true;
    }
    exports_8("hasPrefix", hasPrefix);
    function hasSuffix(source, suffix) {
        for (let srci = source.length - 1, sfxi = suffix.length - 1; sfxi >= 0; srci--, sfxi--) {
            if (source[srci] !== suffix[sfxi])
                return false;
        }
        return true;
    }
    exports_8("hasSuffix", hasSuffix);
    function repeat(origin, count) {
        if (count === 0) {
            return new Uint8Array();
        }
        if (count < 0) {
            throw new Error("bytes: negative repeat count");
        }
        else if ((origin.length * count) / count !== origin.length) {
            throw new Error("bytes: repeat count causes overflow");
        }
        const int = Math.floor(count);
        if (int !== count) {
            throw new Error("bytes: repeat count must be an integer");
        }
        const nb = new Uint8Array(origin.length * count);
        let bp = copyBytes(origin, nb);
        for (; bp < nb.length; bp *= 2) {
            copyBytes(nb.slice(0, bp), nb, bp);
        }
        return nb;
    }
    exports_8("repeat", repeat);
    function concat(origin, b) {
        const output = new Uint8Array(origin.length + b.length);
        output.set(origin, 0);
        output.set(b, origin.length);
        return output;
    }
    exports_8("concat", concat);
    function contains(source, pat) {
        return findIndex(source, pat) != -1;
    }
    exports_8("contains", contains);
    function copyBytes(src, dst, off = 0) {
        off = Math.max(0, Math.min(off, dst.byteLength));
        const dstBytesAvailable = dst.byteLength - off;
        if (src.byteLength > dstBytesAvailable) {
            src = src.subarray(0, dstBytesAvailable);
        }
        dst.set(src, off);
        return src.byteLength;
    }
    exports_8("copyBytes", copyBytes);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.71.0/io/bufio", ["https://deno.land/std@0.71.0/bytes/mod", "https://deno.land/std@0.71.0/_util/assert"], function (exports_9, context_9) {
    "use strict";
    var mod_ts_2, assert_ts_2, DEFAULT_BUF_SIZE, MIN_BUF_SIZE, MAX_CONSECUTIVE_EMPTY_READS, CR, LF, BufferFullError, PartialReadError, BufReader, AbstractBufBase, BufWriter, BufWriterSync;
    var __moduleName = context_9 && context_9.id;
    function createLPS(pat) {
        const lps = new Uint8Array(pat.length);
        lps[0] = 0;
        let prefixEnd = 0;
        let i = 1;
        while (i < lps.length) {
            if (pat[i] == pat[prefixEnd]) {
                prefixEnd++;
                lps[i] = prefixEnd;
                i++;
            }
            else if (prefixEnd === 0) {
                lps[i] = 0;
                i++;
            }
            else {
                prefixEnd = pat[prefixEnd - 1];
            }
        }
        return lps;
    }
    async function* readDelim(reader, delim) {
        const delimLen = delim.length;
        const delimLPS = createLPS(delim);
        let inputBuffer = new Deno.Buffer();
        const inspectArr = new Uint8Array(Math.max(1024, delimLen + 1));
        let inspectIndex = 0;
        let matchIndex = 0;
        while (true) {
            const result = await reader.read(inspectArr);
            if (result === null) {
                yield inputBuffer.bytes();
                return;
            }
            if (result < 0) {
                return;
            }
            const sliceRead = inspectArr.subarray(0, result);
            await Deno.writeAll(inputBuffer, sliceRead);
            let sliceToProcess = inputBuffer.bytes();
            while (inspectIndex < sliceToProcess.length) {
                if (sliceToProcess[inspectIndex] === delim[matchIndex]) {
                    inspectIndex++;
                    matchIndex++;
                    if (matchIndex === delimLen) {
                        const matchEnd = inspectIndex - delimLen;
                        const readyBytes = sliceToProcess.subarray(0, matchEnd);
                        const pendingBytes = sliceToProcess.slice(inspectIndex);
                        yield readyBytes;
                        sliceToProcess = pendingBytes;
                        inspectIndex = 0;
                        matchIndex = 0;
                    }
                }
                else {
                    if (matchIndex === 0) {
                        inspectIndex++;
                    }
                    else {
                        matchIndex = delimLPS[matchIndex - 1];
                    }
                }
            }
            inputBuffer = new Deno.Buffer(sliceToProcess);
        }
    }
    exports_9("readDelim", readDelim);
    async function* readStringDelim(reader, delim) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        for await (const chunk of readDelim(reader, encoder.encode(delim))) {
            yield decoder.decode(chunk);
        }
    }
    exports_9("readStringDelim", readStringDelim);
    async function* readLines(reader) {
        yield* readStringDelim(reader, "\n");
    }
    exports_9("readLines", readLines);
    return {
        setters: [
            function (mod_ts_2_1) {
                mod_ts_2 = mod_ts_2_1;
            },
            function (assert_ts_2_1) {
                assert_ts_2 = assert_ts_2_1;
            }
        ],
        execute: function () {
            DEFAULT_BUF_SIZE = 4096;
            MIN_BUF_SIZE = 16;
            MAX_CONSECUTIVE_EMPTY_READS = 100;
            CR = "\r".charCodeAt(0);
            LF = "\n".charCodeAt(0);
            BufferFullError = class BufferFullError extends Error {
                constructor(partial) {
                    super("Buffer full");
                    this.partial = partial;
                    this.name = "BufferFullError";
                }
            };
            exports_9("BufferFullError", BufferFullError);
            PartialReadError = class PartialReadError extends Deno.errors.UnexpectedEof {
                constructor() {
                    super("Encountered UnexpectedEof, data only partially read");
                    this.name = "PartialReadError";
                }
            };
            exports_9("PartialReadError", PartialReadError);
            BufReader = class BufReader {
                constructor(rd, size = DEFAULT_BUF_SIZE) {
                    this.r = 0;
                    this.w = 0;
                    this.eof = false;
                    if (size < MIN_BUF_SIZE) {
                        size = MIN_BUF_SIZE;
                    }
                    this._reset(new Uint8Array(size), rd);
                }
                static create(r, size = DEFAULT_BUF_SIZE) {
                    return r instanceof BufReader ? r : new BufReader(r, size);
                }
                size() {
                    return this.buf.byteLength;
                }
                buffered() {
                    return this.w - this.r;
                }
                async _fill() {
                    if (this.r > 0) {
                        this.buf.copyWithin(0, this.r, this.w);
                        this.w -= this.r;
                        this.r = 0;
                    }
                    if (this.w >= this.buf.byteLength) {
                        throw Error("bufio: tried to fill full buffer");
                    }
                    for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
                        const rr = await this.rd.read(this.buf.subarray(this.w));
                        if (rr === null) {
                            this.eof = true;
                            return;
                        }
                        assert_ts_2.assert(rr >= 0, "negative read");
                        this.w += rr;
                        if (rr > 0) {
                            return;
                        }
                    }
                    throw new Error(`No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`);
                }
                reset(r) {
                    this._reset(this.buf, r);
                }
                _reset(buf, rd) {
                    this.buf = buf;
                    this.rd = rd;
                    this.eof = false;
                }
                async read(p) {
                    let rr = p.byteLength;
                    if (p.byteLength === 0)
                        return rr;
                    if (this.r === this.w) {
                        if (p.byteLength >= this.buf.byteLength) {
                            const rr = await this.rd.read(p);
                            const nread = rr ?? 0;
                            assert_ts_2.assert(nread >= 0, "negative read");
                            return rr;
                        }
                        this.r = 0;
                        this.w = 0;
                        rr = await this.rd.read(this.buf);
                        if (rr === 0 || rr === null)
                            return rr;
                        assert_ts_2.assert(rr >= 0, "negative read");
                        this.w += rr;
                    }
                    const copied = mod_ts_2.copyBytes(this.buf.subarray(this.r, this.w), p, 0);
                    this.r += copied;
                    return copied;
                }
                async readFull(p) {
                    let bytesRead = 0;
                    while (bytesRead < p.length) {
                        try {
                            const rr = await this.read(p.subarray(bytesRead));
                            if (rr === null) {
                                if (bytesRead === 0) {
                                    return null;
                                }
                                else {
                                    throw new PartialReadError();
                                }
                            }
                            bytesRead += rr;
                        }
                        catch (err) {
                            err.partial = p.subarray(0, bytesRead);
                            throw err;
                        }
                    }
                    return p;
                }
                async readByte() {
                    while (this.r === this.w) {
                        if (this.eof)
                            return null;
                        await this._fill();
                    }
                    const c = this.buf[this.r];
                    this.r++;
                    return c;
                }
                async readString(delim) {
                    if (delim.length !== 1) {
                        throw new Error("Delimiter should be a single character");
                    }
                    const buffer = await this.readSlice(delim.charCodeAt(0));
                    if (buffer === null)
                        return null;
                    return new TextDecoder().decode(buffer);
                }
                async readLine() {
                    let line;
                    try {
                        line = await this.readSlice(LF);
                    }
                    catch (err) {
                        let { partial } = err;
                        assert_ts_2.assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
                        if (!(err instanceof BufferFullError)) {
                            throw err;
                        }
                        if (!this.eof &&
                            partial.byteLength > 0 &&
                            partial[partial.byteLength - 1] === CR) {
                            assert_ts_2.assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                            this.r--;
                            partial = partial.subarray(0, partial.byteLength - 1);
                        }
                        return { line: partial, more: !this.eof };
                    }
                    if (line === null) {
                        return null;
                    }
                    if (line.byteLength === 0) {
                        return { line, more: false };
                    }
                    if (line[line.byteLength - 1] == LF) {
                        let drop = 1;
                        if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                            drop = 2;
                        }
                        line = line.subarray(0, line.byteLength - drop);
                    }
                    return { line, more: false };
                }
                async readSlice(delim) {
                    let s = 0;
                    let slice;
                    while (true) {
                        let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
                        if (i >= 0) {
                            i += s;
                            slice = this.buf.subarray(this.r, this.r + i + 1);
                            this.r += i + 1;
                            break;
                        }
                        if (this.eof) {
                            if (this.r === this.w) {
                                return null;
                            }
                            slice = this.buf.subarray(this.r, this.w);
                            this.r = this.w;
                            break;
                        }
                        if (this.buffered() >= this.buf.byteLength) {
                            this.r = this.w;
                            const oldbuf = this.buf;
                            const newbuf = this.buf.slice(0);
                            this.buf = newbuf;
                            throw new BufferFullError(oldbuf);
                        }
                        s = this.w - this.r;
                        try {
                            await this._fill();
                        }
                        catch (err) {
                            err.partial = slice;
                            throw err;
                        }
                    }
                    return slice;
                }
                async peek(n) {
                    if (n < 0) {
                        throw Error("negative count");
                    }
                    let avail = this.w - this.r;
                    while (avail < n && avail < this.buf.byteLength && !this.eof) {
                        try {
                            await this._fill();
                        }
                        catch (err) {
                            err.partial = this.buf.subarray(this.r, this.w);
                            throw err;
                        }
                        avail = this.w - this.r;
                    }
                    if (avail === 0 && this.eof) {
                        return null;
                    }
                    else if (avail < n && this.eof) {
                        return this.buf.subarray(this.r, this.r + avail);
                    }
                    else if (avail < n) {
                        throw new BufferFullError(this.buf.subarray(this.r, this.w));
                    }
                    return this.buf.subarray(this.r, this.r + n);
                }
            };
            exports_9("BufReader", BufReader);
            AbstractBufBase = class AbstractBufBase {
                constructor() {
                    this.usedBufferBytes = 0;
                    this.err = null;
                }
                size() {
                    return this.buf.byteLength;
                }
                available() {
                    return this.buf.byteLength - this.usedBufferBytes;
                }
                buffered() {
                    return this.usedBufferBytes;
                }
            };
            BufWriter = class BufWriter extends AbstractBufBase {
                constructor(writer, size = DEFAULT_BUF_SIZE) {
                    super();
                    this.writer = writer;
                    if (size <= 0) {
                        size = DEFAULT_BUF_SIZE;
                    }
                    this.buf = new Uint8Array(size);
                }
                static create(writer, size = DEFAULT_BUF_SIZE) {
                    return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
                }
                reset(w) {
                    this.err = null;
                    this.usedBufferBytes = 0;
                    this.writer = w;
                }
                async flush() {
                    if (this.err !== null)
                        throw this.err;
                    if (this.usedBufferBytes === 0)
                        return;
                    try {
                        await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
                    }
                    catch (e) {
                        this.err = e;
                        throw e;
                    }
                    this.buf = new Uint8Array(this.buf.length);
                    this.usedBufferBytes = 0;
                }
                async write(data) {
                    if (this.err !== null)
                        throw this.err;
                    if (data.length === 0)
                        return 0;
                    let totalBytesWritten = 0;
                    let numBytesWritten = 0;
                    while (data.byteLength > this.available()) {
                        if (this.buffered() === 0) {
                            try {
                                numBytesWritten = await this.writer.write(data);
                            }
                            catch (e) {
                                this.err = e;
                                throw e;
                            }
                        }
                        else {
                            numBytesWritten = mod_ts_2.copyBytes(data, this.buf, this.usedBufferBytes);
                            this.usedBufferBytes += numBytesWritten;
                            await this.flush();
                        }
                        totalBytesWritten += numBytesWritten;
                        data = data.subarray(numBytesWritten);
                    }
                    numBytesWritten = mod_ts_2.copyBytes(data, this.buf, this.usedBufferBytes);
                    this.usedBufferBytes += numBytesWritten;
                    totalBytesWritten += numBytesWritten;
                    return totalBytesWritten;
                }
            };
            exports_9("BufWriter", BufWriter);
            BufWriterSync = class BufWriterSync extends AbstractBufBase {
                constructor(writer, size = DEFAULT_BUF_SIZE) {
                    super();
                    this.writer = writer;
                    if (size <= 0) {
                        size = DEFAULT_BUF_SIZE;
                    }
                    this.buf = new Uint8Array(size);
                }
                static create(writer, size = DEFAULT_BUF_SIZE) {
                    return writer instanceof BufWriterSync
                        ? writer
                        : new BufWriterSync(writer, size);
                }
                reset(w) {
                    this.err = null;
                    this.usedBufferBytes = 0;
                    this.writer = w;
                }
                flush() {
                    if (this.err !== null)
                        throw this.err;
                    if (this.usedBufferBytes === 0)
                        return;
                    try {
                        Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
                    }
                    catch (e) {
                        this.err = e;
                        throw e;
                    }
                    this.buf = new Uint8Array(this.buf.length);
                    this.usedBufferBytes = 0;
                }
                writeSync(data) {
                    if (this.err !== null)
                        throw this.err;
                    if (data.length === 0)
                        return 0;
                    let totalBytesWritten = 0;
                    let numBytesWritten = 0;
                    while (data.byteLength > this.available()) {
                        if (this.buffered() === 0) {
                            try {
                                numBytesWritten = this.writer.writeSync(data);
                            }
                            catch (e) {
                                this.err = e;
                                throw e;
                            }
                        }
                        else {
                            numBytesWritten = mod_ts_2.copyBytes(data, this.buf, this.usedBufferBytes);
                            this.usedBufferBytes += numBytesWritten;
                            this.flush();
                        }
                        totalBytesWritten += numBytesWritten;
                        data = data.subarray(numBytesWritten);
                    }
                    numBytesWritten = mod_ts_2.copyBytes(data, this.buf, this.usedBufferBytes);
                    this.usedBufferBytes += numBytesWritten;
                    totalBytesWritten += numBytesWritten;
                    return totalBytesWritten;
                }
            };
            exports_9("BufWriterSync", BufWriterSync);
        }
    };
});
System.register("https://deno.land/std@0.71.0/async/deferred", [], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    function deferred() {
        let methods;
        const promise = new Promise((resolve, reject) => {
            methods = { resolve, reject };
        });
        return Object.assign(promise, methods);
    }
    exports_10("deferred", deferred);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.71.0/async/delay", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    function delay(ms) {
        return new Promise((res) => setTimeout(() => {
            res();
        }, ms));
    }
    exports_11("delay", delay);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.71.0/async/mux_async_iterator", ["https://deno.land/std@0.71.0/async/deferred"], function (exports_12, context_12) {
    "use strict";
    var deferred_ts_1, MuxAsyncIterator;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (deferred_ts_1_1) {
                deferred_ts_1 = deferred_ts_1_1;
            }
        ],
        execute: function () {
            MuxAsyncIterator = class MuxAsyncIterator {
                constructor() {
                    this.iteratorCount = 0;
                    this.yields = [];
                    this.throws = [];
                    this.signal = deferred_ts_1.deferred();
                }
                add(iterator) {
                    ++this.iteratorCount;
                    this.callIteratorNext(iterator);
                }
                async callIteratorNext(iterator) {
                    try {
                        const { value, done } = await iterator.next();
                        if (done) {
                            --this.iteratorCount;
                        }
                        else {
                            this.yields.push({ iterator, value });
                        }
                    }
                    catch (e) {
                        this.throws.push(e);
                    }
                    this.signal.resolve();
                }
                async *iterate() {
                    while (this.iteratorCount > 0) {
                        await this.signal;
                        for (let i = 0; i < this.yields.length; i++) {
                            const { iterator, value } = this.yields[i];
                            yield value;
                            this.callIteratorNext(iterator);
                        }
                        if (this.throws.length) {
                            for (const e of this.throws) {
                                throw e;
                            }
                            this.throws.length = 0;
                        }
                        this.yields.length = 0;
                        this.signal = deferred_ts_1.deferred();
                    }
                }
                [Symbol.asyncIterator]() {
                    return this.iterate();
                }
            };
            exports_12("MuxAsyncIterator", MuxAsyncIterator);
        }
    };
});
System.register("https://deno.land/std@0.71.0/async/pool", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    function pooledMap(poolLimit, array, iteratorFn) {
        const res = new TransformStream({
            async transform(p, controller) {
                controller.enqueue(await p);
            },
        });
        (async () => {
            const writer = res.writable.getWriter();
            const executing = [];
            for await (const item of array) {
                const p = Promise.resolve().then(() => iteratorFn(item));
                writer.write(p);
                const e = p.then(() => executing.splice(executing.indexOf(e), 1));
                executing.push(e);
                if (executing.length >= poolLimit) {
                    await Promise.race(executing);
                }
            }
            await Promise.all(executing);
            writer.close();
        })();
        return res.readable.getIterator();
    }
    exports_13("pooledMap", pooledMap);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.71.0/async/mod", ["https://deno.land/std@0.71.0/async/deferred", "https://deno.land/std@0.71.0/async/delay", "https://deno.land/std@0.71.0/async/mux_async_iterator", "https://deno.land/std@0.71.0/async/pool"], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_14(exports);
    }
    return {
        setters: [
            function (deferred_ts_2_1) {
                exportStar_1(deferred_ts_2_1);
            },
            function (delay_ts_1_1) {
                exportStar_1(delay_ts_1_1);
            },
            function (mux_async_iterator_ts_1_1) {
                exportStar_1(mux_async_iterator_ts_1_1);
            },
            function (pool_ts_1_1) {
                exportStar_1(pool_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.71.0/textproto/mod", ["https://deno.land/std@0.71.0/bytes/mod", "https://deno.land/std@0.71.0/encoding/utf8"], function (exports_15, context_15) {
    "use strict";
    var mod_ts_3, utf8_ts_1, invalidHeaderCharRegex, TextProtoReader;
    var __moduleName = context_15 && context_15.id;
    function str(buf) {
        if (buf == null) {
            return "";
        }
        else {
            return utf8_ts_1.decode(buf);
        }
    }
    function charCode(s) {
        return s.charCodeAt(0);
    }
    return {
        setters: [
            function (mod_ts_3_1) {
                mod_ts_3 = mod_ts_3_1;
            },
            function (utf8_ts_1_1) {
                utf8_ts_1 = utf8_ts_1_1;
            }
        ],
        execute: function () {
            invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
            TextProtoReader = class TextProtoReader {
                constructor(r) {
                    this.r = r;
                }
                async readLine() {
                    const s = await this.readLineSlice();
                    if (s === null)
                        return null;
                    return str(s);
                }
                async readMIMEHeader() {
                    const m = new Headers();
                    let line;
                    let buf = await this.r.peek(1);
                    if (buf === null) {
                        return null;
                    }
                    else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
                        line = (await this.readLineSlice());
                    }
                    buf = await this.r.peek(1);
                    if (buf === null) {
                        throw new Deno.errors.UnexpectedEof();
                    }
                    else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
                        throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str(line)}`);
                    }
                    while (true) {
                        const kv = await this.readLineSlice();
                        if (kv === null)
                            throw new Deno.errors.UnexpectedEof();
                        if (kv.byteLength === 0)
                            return m;
                        let i = kv.indexOf(charCode(":"));
                        if (i < 0) {
                            throw new Deno.errors.InvalidData(`malformed MIME header line: ${str(kv)}`);
                        }
                        const key = str(kv.subarray(0, i));
                        if (key == "") {
                            continue;
                        }
                        i++;
                        while (i < kv.byteLength &&
                            (kv[i] == charCode(" ") || kv[i] == charCode("\t"))) {
                            i++;
                        }
                        const value = str(kv.subarray(i)).replace(invalidHeaderCharRegex, encodeURI);
                        try {
                            m.append(key, value);
                        }
                        catch {
                        }
                    }
                }
                async readLineSlice() {
                    let line;
                    while (true) {
                        const r = await this.r.readLine();
                        if (r === null)
                            return null;
                        const { line: l, more } = r;
                        if (!line && !more) {
                            if (this.skipSpace(l) === 0) {
                                return new Uint8Array(0);
                            }
                            return l;
                        }
                        line = line ? mod_ts_3.concat(line, l) : l;
                        if (!more) {
                            break;
                        }
                    }
                    return line;
                }
                skipSpace(l) {
                    let n = 0;
                    for (let i = 0; i < l.length; i++) {
                        if (l[i] === charCode(" ") || l[i] === charCode("\t")) {
                            continue;
                        }
                        n++;
                    }
                    return n;
                }
            };
            exports_15("TextProtoReader", TextProtoReader);
        }
    };
});
System.register("https://deno.land/std@0.71.0/http/_io", ["https://deno.land/std@0.71.0/io/bufio", "https://deno.land/std@0.71.0/textproto/mod", "https://deno.land/std@0.71.0/_util/assert", "https://deno.land/std@0.71.0/encoding/utf8", "https://deno.land/std@0.71.0/http/server", "https://deno.land/std@0.71.0/http/http_status"], function (exports_16, context_16) {
    "use strict";
    var bufio_ts_1, mod_ts_4, assert_ts_3, utf8_ts_2, server_ts_1, http_status_ts_1;
    var __moduleName = context_16 && context_16.id;
    function emptyReader() {
        return {
            read(_) {
                return Promise.resolve(null);
            },
        };
    }
    exports_16("emptyReader", emptyReader);
    function bodyReader(contentLength, r) {
        let totalRead = 0;
        let finished = false;
        async function read(buf) {
            if (finished)
                return null;
            let result;
            const remaining = contentLength - totalRead;
            if (remaining >= buf.byteLength) {
                result = await r.read(buf);
            }
            else {
                const readBuf = buf.subarray(0, remaining);
                result = await r.read(readBuf);
            }
            if (result !== null) {
                totalRead += result;
            }
            finished = totalRead === contentLength;
            return result;
        }
        return { read };
    }
    exports_16("bodyReader", bodyReader);
    function chunkedBodyReader(h, r) {
        const tp = new mod_ts_4.TextProtoReader(r);
        let finished = false;
        const chunks = [];
        async function read(buf) {
            if (finished)
                return null;
            const [chunk] = chunks;
            if (chunk) {
                const chunkRemaining = chunk.data.byteLength - chunk.offset;
                const readLength = Math.min(chunkRemaining, buf.byteLength);
                for (let i = 0; i < readLength; i++) {
                    buf[i] = chunk.data[chunk.offset + i];
                }
                chunk.offset += readLength;
                if (chunk.offset === chunk.data.byteLength) {
                    chunks.shift();
                    if ((await tp.readLine()) === null) {
                        throw new Deno.errors.UnexpectedEof();
                    }
                }
                return readLength;
            }
            const line = await tp.readLine();
            if (line === null)
                throw new Deno.errors.UnexpectedEof();
            const [chunkSizeString] = line.split(";");
            const chunkSize = parseInt(chunkSizeString, 16);
            if (Number.isNaN(chunkSize) || chunkSize < 0) {
                throw new Error("Invalid chunk size");
            }
            if (chunkSize > 0) {
                if (chunkSize > buf.byteLength) {
                    let eof = await r.readFull(buf);
                    if (eof === null) {
                        throw new Deno.errors.UnexpectedEof();
                    }
                    const restChunk = new Uint8Array(chunkSize - buf.byteLength);
                    eof = await r.readFull(restChunk);
                    if (eof === null) {
                        throw new Deno.errors.UnexpectedEof();
                    }
                    else {
                        chunks.push({
                            offset: 0,
                            data: restChunk,
                        });
                    }
                    return buf.byteLength;
                }
                else {
                    const bufToFill = buf.subarray(0, chunkSize);
                    const eof = await r.readFull(bufToFill);
                    if (eof === null) {
                        throw new Deno.errors.UnexpectedEof();
                    }
                    if ((await tp.readLine()) === null) {
                        throw new Deno.errors.UnexpectedEof();
                    }
                    return chunkSize;
                }
            }
            else {
                assert_ts_3.assert(chunkSize === 0);
                if ((await r.readLine()) === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                await readTrailers(h, r);
                finished = true;
                return null;
            }
        }
        return { read };
    }
    exports_16("chunkedBodyReader", chunkedBodyReader);
    function isProhibidedForTrailer(key) {
        const s = new Set(["transfer-encoding", "content-length", "trailer"]);
        return s.has(key.toLowerCase());
    }
    async function readTrailers(headers, r) {
        const trailers = parseTrailer(headers.get("trailer"));
        if (trailers == null)
            return;
        const trailerNames = [...trailers.keys()];
        const tp = new mod_ts_4.TextProtoReader(r);
        const result = await tp.readMIMEHeader();
        if (result == null) {
            throw new Deno.errors.InvalidData("Missing trailer header.");
        }
        const undeclared = [...result.keys()].filter((k) => !trailerNames.includes(k));
        if (undeclared.length > 0) {
            throw new Deno.errors.InvalidData(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
        }
        for (const [k, v] of result) {
            headers.append(k, v);
        }
        const missingTrailers = trailerNames.filter((k) => !result.has(k));
        if (missingTrailers.length > 0) {
            throw new Deno.errors.InvalidData(`Missing trailers: ${Deno.inspect(missingTrailers)}.`);
        }
        headers.delete("trailer");
    }
    exports_16("readTrailers", readTrailers);
    function parseTrailer(field) {
        if (field == null) {
            return undefined;
        }
        const trailerNames = field.split(",").map((v) => v.trim().toLowerCase());
        if (trailerNames.length === 0) {
            throw new Deno.errors.InvalidData("Empty trailer header.");
        }
        const prohibited = trailerNames.filter((k) => isProhibidedForTrailer(k));
        if (prohibited.length > 0) {
            throw new Deno.errors.InvalidData(`Prohibited trailer names: ${Deno.inspect(prohibited)}.`);
        }
        return new Headers(trailerNames.map((key) => [key, ""]));
    }
    async function writeChunkedBody(w, r) {
        const writer = bufio_ts_1.BufWriter.create(w);
        for await (const chunk of Deno.iter(r)) {
            if (chunk.byteLength <= 0)
                continue;
            const start = utf8_ts_2.encoder.encode(`${chunk.byteLength.toString(16)}\r\n`);
            const end = utf8_ts_2.encoder.encode("\r\n");
            await writer.write(start);
            await writer.write(chunk);
            await writer.write(end);
        }
        const endChunk = utf8_ts_2.encoder.encode("0\r\n\r\n");
        await writer.write(endChunk);
    }
    exports_16("writeChunkedBody", writeChunkedBody);
    async function writeTrailers(w, headers, trailers) {
        const trailer = headers.get("trailer");
        if (trailer === null) {
            throw new TypeError("Missing trailer header.");
        }
        const transferEncoding = headers.get("transfer-encoding");
        if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
            throw new TypeError(`Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`);
        }
        const writer = bufio_ts_1.BufWriter.create(w);
        const trailerNames = trailer.split(",").map((s) => s.trim().toLowerCase());
        const prohibitedTrailers = trailerNames.filter((k) => isProhibidedForTrailer(k));
        if (prohibitedTrailers.length > 0) {
            throw new TypeError(`Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`);
        }
        const undeclared = [...trailers.keys()].filter((k) => !trailerNames.includes(k));
        if (undeclared.length > 0) {
            throw new TypeError(`Undeclared trailers: ${Deno.inspect(undeclared)}.`);
        }
        for (const [key, value] of trailers) {
            await writer.write(utf8_ts_2.encoder.encode(`${key}: ${value}\r\n`));
        }
        await writer.write(utf8_ts_2.encoder.encode("\r\n"));
        await writer.flush();
    }
    exports_16("writeTrailers", writeTrailers);
    async function writeResponse(w, r) {
        const protoMajor = 1;
        const protoMinor = 1;
        const statusCode = r.status || 200;
        const statusText = http_status_ts_1.STATUS_TEXT.get(statusCode);
        const writer = bufio_ts_1.BufWriter.create(w);
        if (!statusText) {
            throw new Deno.errors.InvalidData("Bad status code");
        }
        if (!r.body) {
            r.body = new Uint8Array();
        }
        if (typeof r.body === "string") {
            r.body = utf8_ts_2.encoder.encode(r.body);
        }
        let out = `HTTP/${protoMajor}.${protoMinor} ${statusCode} ${statusText}\r\n`;
        const headers = r.headers ?? new Headers();
        if (r.body && !headers.get("content-length")) {
            if (r.body instanceof Uint8Array) {
                out += `content-length: ${r.body.byteLength}\r\n`;
            }
            else if (!headers.get("transfer-encoding")) {
                out += "transfer-encoding: chunked\r\n";
            }
        }
        for (const [key, value] of headers) {
            out += `${key}: ${value}\r\n`;
        }
        out += `\r\n`;
        const header = utf8_ts_2.encoder.encode(out);
        const n = await writer.write(header);
        assert_ts_3.assert(n === header.byteLength);
        if (r.body instanceof Uint8Array) {
            const n = await writer.write(r.body);
            assert_ts_3.assert(n === r.body.byteLength);
        }
        else if (headers.has("content-length")) {
            const contentLength = headers.get("content-length");
            assert_ts_3.assert(contentLength != null);
            const bodyLength = parseInt(contentLength);
            const n = await Deno.copy(r.body, writer);
            assert_ts_3.assert(n === bodyLength);
        }
        else {
            await writeChunkedBody(writer, r.body);
        }
        if (r.trailers) {
            const t = await r.trailers();
            await writeTrailers(writer, headers, t);
        }
        await writer.flush();
    }
    exports_16("writeResponse", writeResponse);
    function parseHTTPVersion(vers) {
        switch (vers) {
            case "HTTP/1.1":
                return [1, 1];
            case "HTTP/1.0":
                return [1, 0];
            default: {
                const Big = 1000000;
                if (!vers.startsWith("HTTP/")) {
                    break;
                }
                const dot = vers.indexOf(".");
                if (dot < 0) {
                    break;
                }
                const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
                const major = Number(majorStr);
                if (!Number.isInteger(major) || major < 0 || major > Big) {
                    break;
                }
                const minorStr = vers.substring(dot + 1);
                const minor = Number(minorStr);
                if (!Number.isInteger(minor) || minor < 0 || minor > Big) {
                    break;
                }
                return [major, minor];
            }
        }
        throw new Error(`malformed HTTP version ${vers}`);
    }
    exports_16("parseHTTPVersion", parseHTTPVersion);
    async function readRequest(conn, bufr) {
        const tp = new mod_ts_4.TextProtoReader(bufr);
        const firstLine = await tp.readLine();
        if (firstLine === null)
            return null;
        const headers = await tp.readMIMEHeader();
        if (headers === null)
            throw new Deno.errors.UnexpectedEof();
        const req = new server_ts_1.ServerRequest();
        req.conn = conn;
        req.r = bufr;
        [req.method, req.url, req.proto] = firstLine.split(" ", 3);
        [req.protoMinor, req.protoMajor] = parseHTTPVersion(req.proto);
        req.headers = headers;
        fixLength(req);
        return req;
    }
    exports_16("readRequest", readRequest);
    function fixLength(req) {
        const contentLength = req.headers.get("Content-Length");
        if (contentLength) {
            const arrClen = contentLength.split(",");
            if (arrClen.length > 1) {
                const distinct = [...new Set(arrClen.map((e) => e.trim()))];
                if (distinct.length > 1) {
                    throw Error("cannot contain multiple Content-Length headers");
                }
                else {
                    req.headers.set("Content-Length", distinct[0]);
                }
            }
            const c = req.headers.get("Content-Length");
            if (req.method === "HEAD" && c && c !== "0") {
                throw Error("http: method cannot contain a Content-Length");
            }
            if (c && req.headers.has("transfer-encoding")) {
                throw new Error("http: Transfer-Encoding and Content-Length cannot be send together");
            }
        }
    }
    return {
        setters: [
            function (bufio_ts_1_1) {
                bufio_ts_1 = bufio_ts_1_1;
            },
            function (mod_ts_4_1) {
                mod_ts_4 = mod_ts_4_1;
            },
            function (assert_ts_3_1) {
                assert_ts_3 = assert_ts_3_1;
            },
            function (utf8_ts_2_1) {
                utf8_ts_2 = utf8_ts_2_1;
            },
            function (server_ts_1_1) {
                server_ts_1 = server_ts_1_1;
            },
            function (http_status_ts_1_1) {
                http_status_ts_1 = http_status_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("https://deno.land/std@0.71.0/http/server", ["https://deno.land/std@0.71.0/encoding/utf8", "https://deno.land/std@0.71.0/io/bufio", "https://deno.land/std@0.71.0/_util/assert", "https://deno.land/std@0.71.0/async/mod", "https://deno.land/std@0.71.0/http/_io"], function (exports_17, context_17) {
    "use strict";
    var utf8_ts_3, bufio_ts_2, assert_ts_4, mod_ts_5, _io_ts_1, ServerRequest, Server;
    var __moduleName = context_17 && context_17.id;
    function _parseAddrFromStr(addr) {
        let url;
        try {
            const host = addr.startsWith(":") ? `0.0.0.0${addr}` : addr;
            url = new URL(`http://${host}`);
        }
        catch {
            throw new TypeError("Invalid address.");
        }
        if (url.username ||
            url.password ||
            url.pathname != "/" ||
            url.search ||
            url.hash) {
            throw new TypeError("Invalid address.");
        }
        return {
            hostname: url.hostname,
            port: url.port === "" ? 80 : Number(url.port),
        };
    }
    exports_17("_parseAddrFromStr", _parseAddrFromStr);
    function serve(addr) {
        if (typeof addr === "string") {
            addr = _parseAddrFromStr(addr);
        }
        const listener = Deno.listen(addr);
        return new Server(listener);
    }
    exports_17("serve", serve);
    async function listenAndServe(addr, handler) {
        const server = serve(addr);
        for await (const request of server) {
            handler(request);
        }
    }
    exports_17("listenAndServe", listenAndServe);
    function serveTLS(options) {
        const tlsOptions = {
            ...options,
            transport: "tcp",
        };
        const listener = Deno.listenTls(tlsOptions);
        return new Server(listener);
    }
    exports_17("serveTLS", serveTLS);
    async function listenAndServeTLS(options, handler) {
        const server = serveTLS(options);
        for await (const request of server) {
            handler(request);
        }
    }
    exports_17("listenAndServeTLS", listenAndServeTLS);
    return {
        setters: [
            function (utf8_ts_3_1) {
                utf8_ts_3 = utf8_ts_3_1;
            },
            function (bufio_ts_2_1) {
                bufio_ts_2 = bufio_ts_2_1;
            },
            function (assert_ts_4_1) {
                assert_ts_4 = assert_ts_4_1;
            },
            function (mod_ts_5_1) {
                mod_ts_5 = mod_ts_5_1;
            },
            function (_io_ts_1_1) {
                _io_ts_1 = _io_ts_1_1;
            }
        ],
        execute: function () {
            ServerRequest = class ServerRequest {
                constructor() {
                    this.done = mod_ts_5.deferred();
                    this._contentLength = undefined;
                    this._body = null;
                    this.finalized = false;
                }
                get contentLength() {
                    if (this._contentLength === undefined) {
                        const cl = this.headers.get("content-length");
                        if (cl) {
                            this._contentLength = parseInt(cl);
                            if (Number.isNaN(this._contentLength)) {
                                this._contentLength = null;
                            }
                        }
                        else {
                            this._contentLength = null;
                        }
                    }
                    return this._contentLength;
                }
                get body() {
                    if (!this._body) {
                        if (this.contentLength != null) {
                            this._body = _io_ts_1.bodyReader(this.contentLength, this.r);
                        }
                        else {
                            const transferEncoding = this.headers.get("transfer-encoding");
                            if (transferEncoding != null) {
                                const parts = transferEncoding
                                    .split(",")
                                    .map((e) => e.trim().toLowerCase());
                                assert_ts_4.assert(parts.includes("chunked"), 'transfer-encoding must include "chunked" if content-length is not set');
                                this._body = _io_ts_1.chunkedBodyReader(this.headers, this.r);
                            }
                            else {
                                this._body = _io_ts_1.emptyReader();
                            }
                        }
                    }
                    return this._body;
                }
                async respond(r) {
                    let err;
                    try {
                        await _io_ts_1.writeResponse(this.w, r);
                    }
                    catch (e) {
                        try {
                            this.conn.close();
                        }
                        catch {
                        }
                        err = e;
                    }
                    this.done.resolve(err);
                    if (err) {
                        throw err;
                    }
                }
                async finalize() {
                    if (this.finalized)
                        return;
                    const body = this.body;
                    const buf = new Uint8Array(1024);
                    while ((await body.read(buf)) !== null) {
                    }
                    this.finalized = true;
                }
            };
            exports_17("ServerRequest", ServerRequest);
            Server = class Server {
                constructor(listener) {
                    this.listener = listener;
                    this.closing = false;
                    this.connections = [];
                }
                close() {
                    this.closing = true;
                    this.listener.close();
                    for (const conn of this.connections) {
                        try {
                            conn.close();
                        }
                        catch (e) {
                            if (!(e instanceof Deno.errors.BadResource)) {
                                throw e;
                            }
                        }
                    }
                }
                async *iterateHttpRequests(conn) {
                    const reader = new bufio_ts_2.BufReader(conn);
                    const writer = new bufio_ts_2.BufWriter(conn);
                    while (!this.closing) {
                        let request;
                        try {
                            request = await _io_ts_1.readRequest(conn, reader);
                        }
                        catch (error) {
                            if (error instanceof Deno.errors.InvalidData ||
                                error instanceof Deno.errors.UnexpectedEof) {
                                await _io_ts_1.writeResponse(writer, {
                                    status: 400,
                                    body: utf8_ts_3.encode(`${error.message}\r\n\r\n`),
                                });
                            }
                            break;
                        }
                        if (request === null) {
                            break;
                        }
                        request.w = writer;
                        yield request;
                        const responseError = await request.done;
                        if (responseError) {
                            this.untrackConnection(request.conn);
                            return;
                        }
                        await request.finalize();
                    }
                    this.untrackConnection(conn);
                    try {
                        conn.close();
                    }
                    catch (e) {
                    }
                }
                trackConnection(conn) {
                    this.connections.push(conn);
                }
                untrackConnection(conn) {
                    const index = this.connections.indexOf(conn);
                    if (index !== -1) {
                        this.connections.splice(index, 1);
                    }
                }
                async *acceptConnAndIterateHttpRequests(mux) {
                    if (this.closing)
                        return;
                    let conn;
                    try {
                        conn = await this.listener.accept();
                    }
                    catch (error) {
                        if (error instanceof Deno.errors.BadResource ||
                            error instanceof Deno.errors.InvalidData ||
                            error instanceof Deno.errors.UnexpectedEof) {
                            return mux.add(this.acceptConnAndIterateHttpRequests(mux));
                        }
                        throw error;
                    }
                    this.trackConnection(conn);
                    mux.add(this.acceptConnAndIterateHttpRequests(mux));
                    yield* this.iterateHttpRequests(conn);
                }
                [Symbol.asyncIterator]() {
                    const mux = new mod_ts_5.MuxAsyncIterator();
                    mux.add(this.acceptConnAndIterateHttpRequests(mux));
                    return mux.iterate();
                }
            };
            exports_17("Server", Server);
        }
    };
});
System.register("https://deno.land/std@0.71.0/http/mod", ["https://deno.land/std@0.71.0/http/cookie", "https://deno.land/std@0.71.0/http/http_status", "https://deno.land/std@0.71.0/http/server"], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_18(exports);
    }
    return {
        setters: [
            function (cookie_ts_1_1) {
                exportStar_2(cookie_ts_1_1);
            },
            function (http_status_ts_2_1) {
                exportStar_2(http_status_ts_2_1);
            },
            function (server_ts_2_1) {
                exportStar_2(server_ts_2_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/deps", ["https://deno.land/std@0.71.0/http/mod"], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (mod_ts_6_1) {
                exports_19({
                    "ServerRequest": mod_ts_6_1["ServerRequest"],
                    "serve": mod_ts_6_1["serve"],
                    "Server": mod_ts_6_1["Server"],
                    "Status": mod_ts_6_1["Status"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/lib/logger", [], function (exports_20, context_20) {
    "use strict";
    var Logger;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [],
        execute: function () {
            Logger = class Logger {
                constructor(id) {
                    this.id = id;
                }
                static time() {
                    const date = new Date();
                    return `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}`;
                }
                trace(message) {
                    console.trace(`${Logger.time()} [TRACE] ${this.id} | ${message}`);
                }
                info(message) {
                    console.info(`${Logger.time()} [INFO] ${this.id} | ${message}`);
                }
                warn(message) {
                    console.warn(`${Logger.time()} [WARN] ${this.id} | ${message}`);
                }
                error(message) {
                    console.error(`${Logger.time()} [ERROR] ${this.id} | ${message}`);
                }
                time(label) {
                    console.time(`${Logger.time()} [TIMER] ${this.id} | ${label}`);
                }
                timeEnd(label) {
                    console.timeEnd(`${Logger.time()} [TIMER] ${this.id} | ${label}`);
                }
                timeLog(label) {
                    console.timeLog(`${Logger.time()} [TIMER] ${this.id} | ${label}`);
                }
            };
            exports_20("Logger", Logger);
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/lib/request", ["file:///home/codespace/workspace/lapi/lib/logger"], function (exports_21, context_21) {
    "use strict";
    var logger_ts_1, Request;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [
            function (logger_ts_1_1) {
                logger_ts_1 = logger_ts_1_1;
            }
        ],
        execute: function () {
            Request = class Request {
                constructor(id, serverRequest, body) {
                    this.id = id;
                    this.serverRequest = serverRequest;
                    this.body = body;
                    this.status = 200;
                    this.headers = new Headers();
                    this.url = this.serverRequest.url;
                    this.logger = new logger_ts_1.Logger(this.id);
                }
                json(body) {
                    this.responseBody = JSON.stringify(body);
                    this.setHeader("Content-type", "application/json");
                    return this;
                }
                xml(body) {
                    this.responseBody = body;
                    this.setHeader("Content-type", "application/xml");
                    return this;
                }
                send(response) {
                    this.serverRequest.respond(response ||
                        { body: this.responseBody, status: this.status, headers: this.headers });
                }
                setHeader(name, value) {
                    this.headers.set(name, value);
                    return this;
                }
                getHeader(name) {
                    return this.headers.get(name);
                }
                setStatus(status) {
                    this.status = status;
                    return this;
                }
                get method() {
                    return this.serverRequest.method;
                }
                get queries() {
                    return new URL(`http://fakeurl${this.url}`).searchParams;
                }
            };
            exports_21("Request", Request);
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/lib/lapi_base", [], function (exports_22, context_22) {
    "use strict";
    var RequestMethod, LapiBase;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [],
        execute: function () {
            (function (RequestMethod) {
                RequestMethod["POST"] = "POST";
                RequestMethod["GET"] = "GET";
                RequestMethod["OPTIONS"] = "OPTIONS";
                RequestMethod["DELETE"] = "DELETE";
                RequestMethod["PUT"] = "PUT";
                RequestMethod["HEAD"] = "HEAD";
                RequestMethod["PATCH"] = "PATCH";
            })(RequestMethod || (RequestMethod = {}));
            exports_22("RequestMethod", RequestMethod);
            LapiBase = class LapiBase {
                constructor(options) {
                    this.timer = false;
                    this.middlewares = options?.middlewares || [];
                    this.routes = options?.routes || [];
                    this.timer = options?.timer || false;
                }
                addRoute(requestMethod, path, handler) {
                    this.routes.push({
                        requestMethod: requestMethod,
                        requestPath: path,
                        requestHandler: handler,
                    });
                }
                addMiddleware(middleware) {
                    this.middlewares.push(middleware);
                }
                post(path, handler) {
                    this.addRoute(RequestMethod.POST, path, handler);
                }
                get(path, handler) {
                    this.addRoute(RequestMethod.GET, path, handler);
                }
                put(path, handler) {
                    this.addRoute(RequestMethod.PUT, path, handler);
                }
                delete(path, handler) {
                    this.addRoute(RequestMethod.DELETE, path, handler);
                }
                options(path, handler) {
                    this.addRoute(RequestMethod.OPTIONS, path, handler);
                }
                head(path, handler) {
                    this.addRoute(RequestMethod.HEAD, path, handler);
                }
                patch(path, handler) {
                    this.addRoute(RequestMethod.PATCH, path, handler);
                }
                async runMiddleware(request) {
                    if (this.timer)
                        request.logger.time("middleware");
                    for (const middleware of this.middlewares) {
                        await middleware(request);
                    }
                    if (this.timer)
                        request.logger.timeEnd("middleware");
                }
                findRoute({ method, url }) {
                    const matches = this.routes.filter((route) => route.requestMethod === method &&
                        route.requestPath === url);
                    if (matches.length === 0) {
                        return null;
                    }
                    return matches[0];
                }
            };
            exports_22("LapiBase", LapiBase);
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/lib/controller", ["file:///home/codespace/workspace/lapi/lib/lapi_base"], function (exports_23, context_23) {
    "use strict";
    var lapi_base_ts_1, Controller;
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [
            function (lapi_base_ts_1_1) {
                lapi_base_ts_1 = lapi_base_ts_1_1;
            }
        ],
        execute: function () {
            Controller = class Controller extends lapi_base_ts_1.LapiBase {
            };
            exports_23("Controller", Controller);
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/lib/lapi_error", [], function (exports_24, context_24) {
    "use strict";
    var LapiError;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [],
        execute: function () {
            LapiError = class LapiError extends Error {
                constructor(message, status, path, body) {
                    super(message);
                    this.message = message;
                    this.status = status;
                    this.path = path;
                    this.body = body;
                    Object.defineProperty(this, "name", {
                        get() {
                            return "LapiError";
                        },
                    });
                    Object.defineProperty(this, "status", {
                        get() {
                            return status;
                        },
                    });
                    Object.defineProperty(this, "path", {
                        get() {
                            return path;
                        },
                    });
                    Error.captureStackTrace(this, LapiError);
                    return this;
                }
            };
            exports_24("LapiError", LapiError);
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/lib/utils", [], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    function id() {
        return (Math.random().toString(36).substring(2, 6) + Date.now().toString(36)).toUpperCase();
    }
    exports_25("id", id);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/lib/application", ["file:///home/codespace/workspace/lapi/deps", "file:///home/codespace/workspace/lapi/lib/lapi_base", "file:///home/codespace/workspace/lapi/lib/lapi_error", "file:///home/codespace/workspace/lapi/lib/request", "file:///home/codespace/workspace/lapi/lib/utils"], function (exports_26, context_26) {
    "use strict";
    var deps_ts_1, lapi_base_ts_2, lapi_error_ts_1, request_ts_1, utils_ts_1, Application;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (deps_ts_1_1) {
                deps_ts_1 = deps_ts_1_1;
            },
            function (lapi_base_ts_2_1) {
                lapi_base_ts_2 = lapi_base_ts_2_1;
            },
            function (lapi_error_ts_1_1) {
                lapi_error_ts_1 = lapi_error_ts_1_1;
            },
            function (request_ts_1_1) {
                request_ts_1 = request_ts_1_1;
            },
            function (utils_ts_1_1) {
                utils_ts_1 = utils_ts_1_1;
            }
        ],
        execute: function () {
            Application = class Application extends lapi_base_ts_2.LapiBase {
                constructor(options) {
                    super(options);
                    this.controllers = [];
                    this.serverPort = 3000;
                    this.serverHost = "0.0.0.0";
                    this.utf8TextDecoder = new TextDecoder("utf8");
                    if (options) {
                        const { controllers, errorHandler, serverPort, serverHost, } = options;
                        this.controllers = controllers || [];
                        this.errorHandler = errorHandler;
                        this.serverPort = serverPort || 3000;
                        this.serverHost = serverHost || "0.0.0.0";
                    }
                }
                addController(router) {
                    this.controllers.push(router);
                }
                async findRouteFromRouters(request) {
                    for (const router of this.controllers) {
                        const route = router.findRoute(request);
                        if (route) {
                            await router.runMiddleware(request);
                            return route;
                        }
                    }
                    return null;
                }
                async handleRequest(request) {
                    try {
                        await this.runMiddleware(request);
                        let route = this.findRoute(request);
                        if (!route)
                            route = await this.findRouteFromRouters(request);
                        if (!route) {
                            throw new lapi_error_ts_1.LapiError("Path not found", deps_ts_1.Status.NotFound, request.url);
                        }
                        if (this.timer)
                            request.logger.time("handler");
                        await route.requestHandler(request);
                        if (this.timer)
                            request.logger.timeEnd("handler");
                    }
                    catch (error) {
                        if (this.errorHandler) {
                            this.errorHandler(request, error);
                            return;
                        }
                        if (error instanceof lapi_error_ts_1.LapiError) {
                            const body = JSON.stringify(error.body || { message: error.message });
                            if (!error.body) {
                                request.headers.set("Content-type", "application/json");
                            }
                            request.send({ status: error.status, body });
                        }
                        else {
                            request.headers.set("Content-type", "application/json");
                            request.send({
                                status: deps_ts_1.Status.InternalServerError,
                                body: JSON.stringify({ message: "An unexpected error occurred" }),
                            });
                        }
                    }
                }
                async start(onStart) {
                    this.server = deps_ts_1.serve({ hostname: this.serverHost, port: this.serverPort });
                    if (onStart)
                        onStart();
                    for await (const serverRequest of this.server) {
                        const body = this.utf8TextDecoder.decode(await Deno.readAll(serverRequest.body));
                        const request = new request_ts_1.Request(utils_ts_1.id(), serverRequest, body);
                        request.logger.info(`${serverRequest.proto} - ${request.method} - ${request.url}`);
                        this.handleRequest(request);
                    }
                }
            };
            exports_26("Application", Application);
        }
    };
});
System.register("file:///home/codespace/workspace/lapi/mod", ["file:///home/codespace/workspace/lapi/lib/application", "file:///home/codespace/workspace/lapi/lib/lapi_error", "file:///home/codespace/workspace/lapi/lib/controller", "file:///home/codespace/workspace/lapi/lib/lapi_base", "file:///home/codespace/workspace/lapi/lib/request", "file:///home/codespace/workspace/lapi/deps"], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    function exportStar_3(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_27(exports);
    }
    return {
        setters: [
            function (application_ts_1_1) {
                exportStar_3(application_ts_1_1);
            },
            function (lapi_error_ts_2_1) {
                exportStar_3(lapi_error_ts_2_1);
            },
            function (controller_ts_1_1) {
                exportStar_3(controller_ts_1_1);
            },
            function (lapi_base_ts_3_1) {
                exportStar_3(lapi_base_ts_3_1);
            },
            function (request_ts_2_1) {
                exportStar_3(request_ts_2_1);
            },
            function (deps_ts_2_1) {
                exportStar_3(deps_ts_2_1);
            }
        ],
        execute: function () {
        }
    };
});

const __exp = __instantiate("file:///home/codespace/workspace/lapi/mod", false);
export const Application = __exp["Application"];
export const LapiError = __exp["LapiError"];
export const Controller = __exp["Controller"];
export const LapiBase = __exp["LapiBase"];
export const Request = __exp["Request"];
export const ServerRequest = __exp["ServerRequest"];
export const serve = __exp["serve"];
export const Server = __exp["Server"];
export const Status = __exp["Status"];
export const Response = __exp["Response"];
