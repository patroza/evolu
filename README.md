# Evolu

The first complete and usable library for local-first software is here.

It's so simple that everybody should understand how it works, and it's so complete that you can start building apps on it right now.

Those are strong claims, so let me explain them, but first things first — what is local-first software, and why do we need it?

## Local-first software

The term local-first is probably best described in [this famous article](https://www.inkandswitch.com/local-first/).

TLDR; Local-first software allows users to own their data. It means data are stored in the user's device(s), so local-first software can work offline. How is it different from keeping files on disk? A very. Files are not the right abstraction for applications and are complicated or impossible to synchronize among devices. That's why client-server architecture rules the world. But as with everything, it has trade-offs.

### The trade-offs of the client-server architecture

Client-server architecture provides us with easy backup and synchronization, but all that fun depends on the ability of the server to fulfill its promises. Companies go bankrupt, users are banned, errors occur, all those things happen all the time, and then what? Right, that's why the world needs local-first software. But until now, writing local-first software has been challenging because of the lack of libraries and design patterns. I personally failed several times, and that's why I created Evolu.

## What Evolu is

_Evolu is React Hooks library for local-first software with end-to-end encrypted backup and sync using SQLite and CRDT._

It's even more, but this is the shortest claim I have been able to come up with. Evolu is my idea of how local-first software should be written.

- It must use an SQL database in the browser. No leaky abstractions.
- It has to have as minimal API as possible. No barriers.
- The source code must be as simple as possible. No Ph.D. complexity.
- It must use types as much as possible. Autocomplete FTW.
- All data must be end-to-end encrypted. No excuses.
- Developer experience is foremost. And always will be.
- And it must be fast. Or don't block the main thread, at least 🙃

That's why I wasn't satisfied with prior work and had to create Evolu. But it does not mean I did not use any. On the contrary, I used many other people's work and ideas. First and foremost, the Evolu architecture is almost a clone of James Long [CRDT for mortals](https://www.youtube.com/watch?v=DEcwa68f-jY). Rewritten and improved, of course.

## Getting Started

The complete Next.js example is [here](https://github.com/evoluhq/evolu/tree/main/examples/nextjs).

### Create a table with columns

```ts
const { useQuery, useMutation } = createHooks({
  todo: {
    id: model.id<"todo">(),
    title: model.NonEmptyString1000,
    isCompleted: model.SqliteBoolean,
  },
});
```

### Query data

```ts
const { rows } = useQuery((db) =>
  // Yep, autocomplete works.
  db
    .selectFrom("todo")
    .select(["id", "title", "isCompleted", "updatedAt"])
    .orderBy("updatedAt")
);
```

### Mutate data

```ts
const handleAddTodoClick = () => {
  // Every Zod branded types is a validator.
  const title = model.NonEmptyString1000.safeParse(
    prompt("What needs to be done?")
  );
  if (!title.success) {
    alert(JSON.stringify(title.error, null, 2));
    return;
  }
  // Add new todo. Note that UI is updated automatically.
  // While we have full SQL queries, mutations are limited.
  // That's because of CRDT (conflict-free replicated data type).
  // CRDT allows Evolu to sync data without conclicts.
  mutate("todo", { title: title.data });
};
```

### Show mnemonic (your safe autogenerated password)

```ts
const handleShowMnemonic = () => {
  getOwner().then((owner) => {
    // Mnemonic is your safe password for backup and sync.
    // It's safe because it's long and autogenerated.
    // Evolu is not only local but also private first software.
    // All you data are encrypted with OpenPGP, the same ProtonMail uses.
    alert(owner.mnemonic);
  });
};
```

### Delete all data

```ts
const handleResetOwner = () => {
  if (confirm("Are you sure? It will delete all your local data."))
    resetOwner();
};
```

### Restore your data elsewhere

```ts
const handleRestoreOwner = () => {
  const mnemonic = prompt("Your Mnemonic");
  if (mnemonic == null) return;
  const either = restoreOwner(mnemonic);
  if (either._tag === "Left") alert(JSON.stringify(either.left, null, 2));
};
```

And that's all. Minimal API is the key to a great developer experience. In the next few days, I will add more docs and explanations.

## Privacy

Evolu uses end-to-end encryption and generates strong and safe passwords for you. Evolu sync and backup server see only timestamps. Nothing more. We plan to do at least two security audits.

## Trade-offs

> “There are no solutions. There are only trade-offs.” ― Thomas Sowell

Evolu is not pure P2P software. For syncing and backup, there needs to be a server. Evolu server is very minimal, and everyone can run their own. While it's theoretically possible to have pure P2P Evolu, I haven't seen a reliable solution yet. It's not only a technical problem; it's mainly an economic problem. Someone has to be paid to keep all your data safe. Evolu provides a free server (syncUrl in Evolu config) for testing. Soon we will provide our paid server for production usage.

All table columns except for ID are nullable by default. It's not a bug; it's a feature. Evolu data, like all local-first data, ale meant to last forever, but applications data schemas evolve. Local-first software can migrate data only locally. This design decision is inspired by GraphQL [nullability](https://graphql.org/learn/best-practices/#nullability) and [versionless](https://graphql.org/learn/best-practices/#versioning) schema.

Evolu CRDT has no support for transactions because CRDT transactions are still an unsolved issue. Instead of a half-baked solution, I made a design decision not to implement them. I have a few ideas but need a community to discuss them, and it's not a show-stopper.

## Community

Use Github discussions for now.

[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/evoluhq.svg?style=social&label=Follow%20%40evoluhq)](https://twitter.com/evoluhq)

## What next

We have a lot on the table. While Evolu works, it's far from finished, and I consider it a cornerstone for further development. Check [issues](https://github.com/evoluhq/evolu/issues) and feel free to discuss them.

## FAQ

**Q:** Why GPL-3.0 license?

**A:** Yes, I know. GPL-3.0 requires that any software using Evolu must have the same license, which means it must be open-sourced. That's why Evolu uses this license. Unfortunately, there is only one maintained SQLite implementation for the browser IndexedDB. The good news is that Chrome developers are [actively working](https://twitter.com/ChromiumDev/status/1565105522092695553) on the official SQLite implementation over Wasm. Once it is available, Evolu will use it.

**Q:** Why only React?

**A:** Because React is the only UI library I'm using, but as you can see, Evolu React bindings are very simple, so it should be easy to write bindings to other UI libraries. Feel free to send a PR.

**Q:** Is userId generated from the mnemonic safe?

**A:** Yes, it is. It's impossible to compute a mnemonic from its hash because the Evolu mnemonic has high enough entropy, and we are using only 1/3 of it. But I must say I'm not a professional cryptographer, so don't use Evolu for critical security situations.

## Contributing

Use `pnpm changeset`.

## Thanks

The biggest thank belongs to [James Long](https://twitter.com/jlongster). Without his ingenious contributions to open-source, Evolu would not exists. He made the first SQLite in the IndexedDB [library](https://github.com/jlongster/absurd-sql). He made [CRDT for mortals](https://github.com/jlongster/crdt-example-app). Heck, he made Prettier, and without Prettier, I would not be able to write [functional pipes](https://github.com/gcanti/fp-ts) so quickly. Thank you James. I love your work.
