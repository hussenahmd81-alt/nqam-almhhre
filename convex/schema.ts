import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  erpCollections: defineTable({
    workspace: v.string(),
    collection: v.string(),
    data: v.any(),
    revision: v.number(),
    updatedAt: v.number()
  }).index('by_workspace_collection', ['workspace', 'collection'])
});
