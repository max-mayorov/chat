declare module 'ws' {
  import { EventEmitter } from 'events';
  import { IncomingMessage } from 'http';
  import { Duplex } from 'stream';

  class WebSocket extends EventEmitter {
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;

    binaryType: string;
    readonly bufferedAmount: number;
    readonly extensions: string;
    readonly protocol: string;
    readonly readyState: number;
    readonly url: string;

    onopen: (event: { target: WebSocket }) => void;
    onerror: (event: {
      error: any;
      message: string;
      type: string;
      target: WebSocket;
    }) => void;
    onclose: (event: {
      wasClean: boolean;
      code: number;
      reason: string;
      target: WebSocket;
    }) => void;
    onmessage: (event: { data: any; type: string; target: WebSocket }) => void;

    constructor(address: string, options?: WebSocket.ClientOptions);
    constructor(
      address: string,
      protocols?: string | string[],
      options?: WebSocket.ClientOptions
    );

    close(code?: number, data?: string): void;
    ping(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    pong(data?: any, mask?: boolean, cb?: (err: Error) => void): void;
    send(data: any, cb?: (err?: Error) => void): void;
    send(
      data: any,
      options: {
        mask?: boolean;
        binary?: boolean;
        compress?: boolean;
        fin?: boolean;
      },
      cb?: (err?: Error) => void
    ): void;
    terminate(): void;

    on(event: 'close', listener: (code: number, reason: string) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'message', listener: (data: WebSocket.Data) => void): this;
    on(event: 'open', listener: () => void): this;
    on(event: 'ping' | 'pong', listener: (data: Buffer) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  namespace WebSocket {
    export interface ClientOptions {
      protocol?: string;
      handshakeTimeout?: number;
      perMessageDeflate?: boolean | PerMessageDeflateOptions;
      localAddress?: string;
      protocolVersion?: number;
      headers?: { [key: string]: string };
      origin?: string;
      agent?: any;
      host?: string;
      family?: number;
      checkServerIdentity?(
        servername: string,
        cert: { subject: { CN: string } }
      ): boolean;
      rejectUnauthorized?: boolean;
      maxPayload?: number;
    }

    export interface PerMessageDeflateOptions {
      serverNoContextTakeover?: boolean;
      clientNoContextTakeover?: boolean;
      serverMaxWindowBits?: number;
      clientMaxWindowBits?: number;
      zlibDeflateOptions?: {
        flush?: number;
        finishFlush?: number;
        chunkSize?: number;
        windowBits?: number;
        level?: number;
        memLevel?: number;
        strategy?: number;
        dictionary?: Buffer | Buffer[] | DataView;
        info?: boolean;
      };
      zlibInflateOptions?: {
        chunkSize?: number;
        windowBits?: number;
        to?: string;
        raw?: boolean;
        flush?: number;
      };
      threshold?: number;
      concurrencyLimit?: number;
    }

    export type Data = string | Buffer | ArrayBuffer | Buffer[];
  }

  interface WebSocketServerOptions {
    host?: string;
    port?: number;
    backlog?: number;
    server?: any;
    verifyClient?: (info: {
      origin: string;
      secure: boolean;
      req: IncomingMessage;
    }) => boolean | Promise<boolean>;
    handleProtocols?: (
      protocols: string[],
      request: IncomingMessage
    ) => string | false;
    path?: string;
    noServer?: boolean;
    clientTracking?: boolean;
    perMessageDeflate?: boolean | WebSocket.PerMessageDeflateOptions;
    maxPayload?: number;
  }

  class WebSocketServer extends EventEmitter {
    options: WebSocketServerOptions;
    path: string;
    clients: Set<WebSocket>;

    constructor(options?: WebSocketServerOptions, callback?: () => void);

    close(cb?: (err?: Error) => void): void;
    handleUpgrade(
      request: IncomingMessage,
      socket: Duplex,
      upgradeHead: Buffer,
      callback: (client: WebSocket, request: IncomingMessage) => void
    ): void;
    shouldHandle(request: IncomingMessage): boolean;

    on(
      event: 'connection',
      listener: (socket: WebSocket, request: IncomingMessage) => void
    ): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(
      event: 'headers',
      listener: (headers: string[], request: IncomingMessage) => void
    ): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'listening', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }

  export { WebSocket, WebSocketServer };
}
