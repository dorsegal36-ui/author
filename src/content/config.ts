import { defineCollection, z } from 'astro:content';

const stories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    language: z.enum(['english', 'spanish', 'hebrew']),
    publishedAt: z.coerce.date(),
    draft: z.boolean().default(false),
    sourceFile: z.string().optional()
  })
});

export const collections = { stories };
