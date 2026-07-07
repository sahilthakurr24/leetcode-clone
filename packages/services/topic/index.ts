import { db, asc } from "@repo/database";
import { topicsTable } from "@repo/database/schema";

class TopicService {
  public async listTopics() {
    const topics = await db
      .select()
      .from(topicsTable)
      .orderBy(asc(topicsTable.name));

    return { topics };
  }
}

export default TopicService;
