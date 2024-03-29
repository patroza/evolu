import type * as Worker from "@effect/platform/Worker";
import {
  Bip39,
  DbWorkerFactory,
  EvoluFactory,
  EvoluFactoryCommon,
  InvalidMnemonicError,
  Mnemonic,
  createDbWorker,
} from "@evolu/common";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Bip39Live } from "./PlatformLive.js";

export * from "@evolu/common/public";

/** Parse a string to {@link Mnemonic}. */
export const parseMnemonic: (
  mnemonic: string,
) => Effect.Effect<Mnemonic, InvalidMnemonicError> = Bip39.pipe(
  Effect.provide(Bip39Live),
  Effect.runSync,
).parse;

// TODO:
const layer: (
  spawn: (id: number) => Worker | SharedWorker | MessagePort,
) => Layer.Layer<Worker.WorkerManager | Worker.Spawner, never, never> = () => {
  throw "";
};

export const EvoluFactoryReactNative = Layer.provide(
  EvoluFactoryCommon,
  Layer.succeed(DbWorkerFactory, {
    createDbWorker: Effect.provide(
      createDbWorker,
      layer(() => {
        throw "not implemented";
      }),
    ),
  }),
);

// JSDoc doesn't support destructured parameters, so we must copy-paste
// createEvolu docs from `evolu-common/src/Evolu.ts`.
// https://github.com/microsoft/TypeScript/issues/11859
export const {
  /**
   * Create Evolu from the database schema.
   *
   * Tables with a name prefixed with `_` are local-only, which means they are
   * never synced. It's useful for device-specific or temporal data.
   *
   * @example
   *   import * as S from "@effect/schema/Schema";
   *   import * as E from "@evolu/react-native";
   *
   *   const TodoId = E.id("Todo");
   *   type TodoId = S.Schema.Type<typeof TodoId>;
   *
   *   const TodoTable = E.table({
   *     id: TodoId,
   *     title: E.NonEmptyString1000,
   *   });
   *   type TodoTable = S.Schema.Type<typeof TodoTable>;
   *
   *   const Database = E.database({
   *     todo: TodoTable,
   *
   *     // Prefix `_` makes the table local-only (it will not sync)
   *     _todo: TodoTable,
   *   });
   *   type Database = S.Schema.Type<typeof Database>;
   *
   *   const evolu = E.createEvolu(Database);
   */
  createEvolu,
} = EvoluFactory.pipe(Effect.provide(EvoluFactoryReactNative), Effect.runSync);

// } = EvoluFactory.pipe(
//   Effect.provide(EvoluFactoryCommon.pipe(Layer.provide(DbWorkerFactoryCommon))),
//   Effect.runSync,
// );

// export const createEvolu = makeCreateEvolu(
//   EvoluCommonLive.pipe(
//     Layer.provide(
//       Layer.mergeAll(FlushSyncDefaultLive, AppStateLive, DbWorkerCommonLive),
//     ),
//     Layer.provide(
//       Layer.mergeAll(
//         Bip39Live,
//         NanoIdGeneratorLive,
//         SqliteLive,
//         SyncWorkerCommonLive,
//         DbWorkerLockLive,
//       ),
//     ),
//     Layer.provide(Layer.mergeAll(SecretBoxLive, SyncLockLive, FetchLive)),
//   ),
// );

export * from "@evolu/common-react";
