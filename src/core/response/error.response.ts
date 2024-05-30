import { HttpException, HttpStatus } from '@nestjs/common';

export class ResponseError {
  private _status: HttpStatus;
  public get status(): HttpStatus {
    return this._status;
  }
  public set status(value: HttpStatus) {
    this._status = value;
  }
  private _name: string;
  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }
  private _message: string;
  public get message(): string {
    return this._message;
  }
  public set message(value: string) {
    this._message = value;
  }
  private _stack: string;
  public get stack(): string {
    return this._stack;
  }
  public set stack(value: string) {
    this._stack = value;
  }

  constructor() {
    this.status = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  fromError(exception: unknown) {
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as Record<string, any>;

      this.status = exception.getStatus();
      this.message = errorResponse.message ?? errorResponse;
      this.name =
        errorResponse.error ??
        errorResponse.name ??
        errorResponse.message ??
        errorResponse;
    } else {
      this.status =
        (exception as any).status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      this.message = (exception as Error).message;
      this.name = (exception as Error).name;
    }
    this.stack = (exception as Error).stack;
    return this;
  }

  toLog(endpoint?: string) {
    return `${this.name} :: ${this.message} :: ${
      endpoint ? `${endpoint} :: ` : ''
    }${this.status}`;
  }

  toJson() {
    return {
      status: this.status,
      name: this.name,
      message: this.message,
      stack: this.stack,
    };
  }
}
