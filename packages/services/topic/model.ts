import { z } from "zod";

export const listTopicsInputSchema = z.object({});

export type ListTopicsInputType = z.infer<typeof listTopicsInputSchema>;
