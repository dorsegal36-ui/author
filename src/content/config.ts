import { defineCollection, z } from 'astro:content';

const stories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    language: z.enum(['english', 'spanish', 'hebrew']),
    author: z.string().nullable().optional(),
    writtenAt: z.coerce.date(),
    publishedAt: z.coerce.date(),
    draft: z.boolean().default(false),
    sourceFile: z.string().optional()
  })
});

export const collections = { stories };
