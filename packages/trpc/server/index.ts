import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { problemRouter } from "./routes/problem";
import { languageRouter } from "./routes/language";
import { submissionRouter } from "./routes/submission";
import { progressRouter } from "./routes/progress";
import { listRouter } from "./routes/list";
import { solutionRouter } from "./routes/solution";
import { commentRouter } from "./routes/comment";
import { editorialRouter } from "./routes/editorial";
import { topicRouter } from "./routes/topic";
import { companyRouter } from "./routes/company";
import { userRouter } from "./routes/user";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  problem: problemRouter,
  language: languageRouter,
  submission: submissionRouter,
  progress: progressRouter,
  list: listRouter,
  solution: solutionRouter,
  comment: commentRouter,
  editorial: editorialRouter,
  topic: topicRouter,
  company: companyRouter,
  user: userRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
