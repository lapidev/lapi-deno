// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/logger */

export class Logger {
  constructor(private id: string) {}

  static time(): string {
    const date = new Date();
    return `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}`;
  }

  trace(message: string): void {
    console.trace(`${Logger.time()} [TRACE] ${this.id} | ${message}`);
  }

  info(message: string): void {
    console.info(`${Logger.time()} [INFO] ${this.id} | ${message}`);
  }

  warn(message: string): void {
    console.warn(`${Logger.time()} [WARN] ${this.id} | ${message}`);
  }

  error(message: string): void {
    console.error(`${Logger.time()} [ERROR] ${this.id} | ${message}`);
  }

  time(label: string): void {
    console.time(`${Logger.time()} [TIMER] ${this.id} | ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`${Logger.time()} [TIMER] ${this.id} | ${label}`);
  }

  timeLog(label: string): void {
    console.timeLog(`${Logger.time()} [TIMER] ${this.id} | ${label}`);
  }
}
