import { createHandler, encodePath } from "../_handler.mjs";

export default createHandler((query) => `/api/stories/${encodePath(query.path || query["...path"])}`);
