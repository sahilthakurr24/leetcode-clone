import { db, asc, eq, count } from "@repo/database";
import { topicsTable, problemTopicsTable } from "@repo/database/schema";

class TopicService {
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
