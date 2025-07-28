/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Extend the ServiceWorkerGlobalScope interface to include missing properties
interface ServiceWorkerGlobalScope {
  registration: ServiceWorkerRegistration;
  clients: Clients;
  caches: CacheStorage;
}

// Declare the Clients interface
interface Clients {
  matchAll(options?: ClientQueryOptions): Promise<Client[]>;
  openWindow(url: string): Promise<WindowClient | null>;
}

// Declare Client interface
interface Client {
  id: string;
  url: string;
  type: ClientType;
  postMessage(message: any): void;
}

// Declare WindowClient interface
interface WindowClient extends Client {
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient>;
}

// Declare ClientQueryOptions interface
interface ClientQueryOptions {
  type?: ClientType;
  includeUncontrolled?: boolean;
}

// Declare ClientType
type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';

// Extend Event interface for service worker events
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

interface PushEvent extends ExtendableEvent {
  data: PushMessageData | null;
}

interface NotificationEvent extends ExtendableEvent {
  notification: Notification;
  action: string;
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

// Declare PushMessageData interface
interface PushMessageData {
  json(): any;
  text(): string;
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
}

// Declare CacheStorage interface
interface CacheStorage {
  open(cacheName: string): Promise<Cache>;
  keys(): Promise<string[]>;
  delete(cacheName: string): Promise<boolean>;
}

// Declare Cache interface
interface Cache {
  add(request: RequestInfo): Promise<void>;
  addAll(requests: RequestInfo[]): Promise<void>;
  match(request: RequestInfo): Promise<Response | undefined>;
  put(request: RequestInfo, response: Response): Promise<void>;
  delete(request: RequestInfo): Promise<boolean>;
  keys(): Promise<Request[]>;
}

// Declare RequestInfo type
type RequestInfo = Request | string;

// Declare global variables
declare const caches: CacheStorage;
declare const clients: Clients; 