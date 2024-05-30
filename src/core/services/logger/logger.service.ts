import { HttpConfigDTO } from '@environments/dto/http-config.dto';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { INQUIRER } from '@nestjs/core';

const LogLevel = {
  LOG: 'log',
  ERROR: 'error',
  WARN: 'warn',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
  REQUEST: 'request',
  RESPONSE: 'response',
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

const WriteStreamTypes = {
  STDOUT: 'stdout',
  STDERR: 'stderr',
} as const;

export type WriteStreamTypes =
  (typeof WriteStreamTypes)[keyof typeof WriteStreamTypes];

const Colors = {
  BOLD: `\x1B[1m`,
  GREEN: `\x1B[32m`,
  YELLOW: `\x1B[33m`,
  RED: `\x1B[31m`,
  MAGENTA: `\x1B[95m`,
  CYAN_BRIGHT: `\x1B[96m`,
  BLUE: `\x1b[34m`,
  WHITE: `\x1b[37m`,
  RESET: `\x1B[39m`,
  REVERSE: `\x1b[7m`,
  BG_CYAN: '\x1b[46m',
  BG_PURPLE: '\x1b[45m',
  BG_BLUE: '\x1b[44m',
  BG_YELLOW: '\x1b[43m',
  BG_GREEN: '\x1b[42m',
  BG_RED: '\x1b[41m',
  BG_WHITE: '\x1b[47m',
  BG_RESET: '\x1b[40m',
} as const;

const SPACE = ' ';

export type Colors = (typeof Colors)[keyof typeof Colors];

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private appName: string;
  context: string;

  constructor(
    private c: ConfigService,
    @Inject(INQUIRER) source?: string | object,
  ) {
    this.appName = this.c.get<HttpConfigDTO>('httpConfig').name;
    this.context =
      typeof source === 'string' ? source : source?.constructor?.name;
  }

  /**
   * Write a 'log' level log.
   */
  log(message: any) {
    this.printMessage(message, LogLevel.LOG);
  }
  /**
   * Write an 'error' level log.
   */
  error(message: any) {
    this.printMessage(message, LogLevel.ERROR, WriteStreamTypes.STDERR);
  }
  /**
   * Write a 'warn' level log.
   */
  warn(message: any) {
    this.printMessage(message, LogLevel.LOG);
  }
  /**
   * Write a 'debug' level log.
   */
  debug?(message: any) {
    this.printMessage(message, LogLevel.LOG);
  }
  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any) {
    this.printMessage(message, LogLevel.LOG);
  }
  /**
   * Write a 'request' level log.
   */
  request?(message: any) {
    this.printMessage(message, LogLevel.REQUEST);
  }
  /**
   * Write a 'response' level log.
   */
  response?(message: any, ms: string) {
    this.printMessage(message, LogLevel.RESPONSE, WriteStreamTypes.STDOUT, ms);
  }

  private getTimestamp() {
    const localeStringOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: '2-digit',
      month: '2-digit',
    };
    return new Date(Date.now()).toLocaleString(undefined, localeStringOptions);
  }

  private formatPid() {
    return `${this.colorify('[', [
      Colors.BOLD,
      Colors.CYAN_BRIGHT,
    ])}${this.colorify(this.appName, Colors.MAGENTA)}${this.colorify(
      ']',
      Colors.CYAN_BRIGHT,
    )} ${process.pid}  - `;
  }

  private formatContext() {
    return this.colorify(`[${this.context}]`, Colors.YELLOW);
  }

  private getColorByLevel(logLevel: LogLevel) {
    let color: Colors;

    switch (logLevel) {
      case LogLevel.LOG:
        color = Colors.GREEN;
        break;
      case LogLevel.ERROR:
        color = Colors.RED;
        break;
      case LogLevel.WARN:
        color = Colors.YELLOW;
        break;
      case LogLevel.DEBUG:
        color = Colors.CYAN_BRIGHT;
        break;
      case LogLevel.VERBOSE:
        color = Colors.WHITE;
        break;
      case LogLevel.REQUEST:
        color = Colors.WHITE;
        break;
      case LogLevel.RESPONSE:
        color = Colors.WHITE;
        break;
      default:
        break;
    }
    return color;
  }

  private printMessage(
    message: string,
    logLevel: LogLevel,
    writeStreamType: WriteStreamTypes = WriteStreamTypes.STDOUT,
    ms?: string,
  ) {
    const color = this.getColorByLevel(logLevel);
    const logKey = this.colorify(
      ''.padStart(7, SPACE) + logLevel.toUpperCase(),
      color,
    );
    const formattedMessage =
      this.formatPid() +
      this.colorify(this.getTimestamp(), Colors.BLUE) +
      logKey +
      Colors.BG_RESET +
      SPACE +
      this.formatContext() +
      SPACE +
      this.colorify(message, color) +
      SPACE +
      this.colorify(ms ?? '', Colors.YELLOW) +
      '\n';
    process[writeStreamType].write(formattedMessage);
  }
  private colorify(message: string, color: Colors | Array<Colors>) {
    return `${Array.isArray(color) ? color.join('') : color}${message}${
      Colors.RESET
    }${Colors.BG_RESET}`;
  }
}
