import { z } from 'zod';
import { uuidSchema } from './common.js';
import { REPORT_REASON, REPORT_TARGET_COLLECTION, VOTE_VALUE } from '../enums.js';

export const castVoteSchema = z.object({
  itemId: uuidSchema,
  value: z.union([z.literal(VOTE_VALUE[0]), z.literal(VOTE_VALUE[1])]),
});
export type CastVoteInput = z.infer<typeof castVoteSchema>;

export const createCommentSchema = z.object({
  itemId: uuidSchema,
  parentId: uuidSchema.nullable().optional(),
  body: z.string().trim().min(1).max(4000),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const editCommentSchema = z.object({
  commentId: uuidSchema,
  body: z.string().trim().min(1).max(4000),
});
export type EditCommentInput = z.infer<typeof editCommentSchema>;

export const createReportSchema = z.object({
  targetCollection: z.enum(REPORT_TARGET_COLLECTION),
  targetId: z.string().min(1),
  reason: z.enum(REPORT_REASON),
  details: z.string().trim().max(2000).optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;
