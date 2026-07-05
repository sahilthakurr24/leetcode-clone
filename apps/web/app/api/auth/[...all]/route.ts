import { auth } from "@repo/auth"; // path to your auth file
import { toNextJsHandler } from "@repo/auth";

export const { POST, GET } = toNextJsHandler(auth);




