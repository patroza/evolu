import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

/**
 * FlushSync lets you force React to flush any updates inside the provided
 * callback synchronously. This ensures that the DOM is updated immediately.
 *
 * It's required only for React DOM. The other UI libraries probably don't need
 * that, so it should be a no-op.
 */
export type FlushSync = (callback: () => void) => void;

export const FlushSync = Context.GenericTag<FlushSync>("@services/FlushSync");

export interface SyncLock {
  /**
   * Try to acquire a sync lock. The caller must not call sync if a sync lock
   * can't be acquired.
   */
  readonly acquire: Effect.Effect<boolean>;

  /** Release a sync lock. */
  readonly release: Effect.Effect<void>;
}

export const SyncLock = Context.GenericTag<SyncLock>("@services/SyncLock");

export type DbWorkerLock = (callback: () => Promise<void>) => void;
export const DbWorkerLock = Context.GenericTag<DbWorkerLock>(
  "@services/DbWorkerLock",
);

export type Fetch = (
  url: string,
  body: Uint8Array,
) => Effect.Effect<Response, FetchError>;

export const Fetch = Context.GenericTag<Fetch>("@services/Fetch");

/**
 * This error occurs when there is a problem with the network connection, or the
 * server cannot be reached.
 */
export interface FetchError {
  readonly _tag: "FetchError";
}

export const FetchLive = Layer.succeed(
  Fetch,
  Fetch.of((url, body) =>
    Effect.tryPromise({
      try: () =>
        fetch(url, {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/x-protobuf",
            "Content-Length": body.length.toString(),
          },
        }),
      catch: (): FetchError => ({ _tag: "FetchError" }),
    }),
  ),
);

interface AppStateConfig {
  readonly onRequestSync: () => void;
}

export interface AppState {
  readonly init: (config: AppStateConfig) => void;
  readonly reset: Effect.Effect<void>;
}

export const AppState = Context.GenericTag<AppState>("@services/AppState");

/** To detect whether DOM can be used. */
export const canUseDom = ((): boolean => {
  // IDK why try-catch is necessary, but it is.
  // "ReferenceError: window is not defined" should not happen, but it does.
  try {
    return !!(
      typeof window !== "undefined" &&
      window.document &&
      window.document.createElement
    );
  } catch (e) {
    return false;
  }
})();
