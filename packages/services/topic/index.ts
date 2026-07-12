import { db, asc, eq, count } from "@repo/database";
import { topicsTable, problemTopicsTable } from "@repo/database/schema";

import { createTopicInputSchema, CreateTopicInputType } from "./model";

class TopicService {
  public async createTopic(payload: CreateTopicInputType) {
    const input = await createTopicInputSchema.parseAsync(payload);

    const [duplicate] = await db
      .select({ id: topicsTable.id })
      .from(topicsTable)
      .where(eq(topicsTable.slug, input.slug));
    if (duplicate) {
      throw new Error("A topic with this slug already exists");
    }

    const [topic] = await db.insert(topicsTable).values(input).returning();
    if (!topic) throw new Error("Failed to create topic");

    return { topic };
  }

  public async listTopics() {
    const topics = await db
      .select({
        id: topicsTable.id,
        name: topicsTable.name,
        slug: topicsTable.slug,
        createdAt: topicsTable.createdAt,
        updatedAt: topicsTable.updatedAt,
        problemCount: count(problemTopicsTable.problemId),
      })
      .from(topicsTable)
      .leftJoin(problemTopicsTable, eq(problemTopicsTable.topicId, topicsTable.id))
      .groupBy(topicsTable.id)
      .orderBy(asc(topicsTable.name));

    return { topics };
  }
}

export default TopicService;
