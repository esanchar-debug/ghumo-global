import { createHandler, encodePath } from "../_handler.mjs";

export default createHandler((query) => `/api/destinations/${encodePath(query.path || query["...path"])}`);
