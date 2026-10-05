import { mutationGeneric, queryGeneric } from 'convex/server';
import { v } from 'convex/values';

export const loadAll = queryGeneric({
  args: { workspace: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('erpCollections')
      .filter((q) => q.eq(q.field('workspace'), args.workspace))
      .collect();

    return rows.map((row) => ({
      collection: row.collection,
      data: row.data,
      revision: row.revision,
      updatedAt: row.updatedAt
    }));
  }
});

export const saveCollection = mutationGeneric({
  args: {
    workspace: v.string(),
    collection: v.string(),
    data: v.any(),
    expectedRevision: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('erpCollections')
      .filter((q) =>
        q.and(
          q.eq(q.field('workspace'), args.workspace),
          q.eq(q.field('collection'), args.collection)
        )
      )
      .unique();

    const updatedAt = Date.now();

    if (!existing) {
      if (args.expectedRevision !== undefined && args.expectedRevision !== 0) {
        throw new Error('REVISION_CONFLICT');
      }
      await ctx.db.insert('erpCollections', {
        workspace: args.workspace,
        collection: args.collection,
        data: args.data,
        revision: 1,
        updatedAt
      });
      return { revision: 1, updatedAt };
    }

    if (args.expectedRevision !== undefined && existing.revision !== args.expectedRevision) {
      throw new Error('REVISION_CONFLICT');
    }

    const revision = existing.revision + 1;
    await ctx.db.patch(existing._id, { data: args.data, revision, updatedAt });
    return { revision, updatedAt };
  }
});
