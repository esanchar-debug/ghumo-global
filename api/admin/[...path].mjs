import { createHandler, encodePath } from "../_handler.mjs";

export default createHandler((query) => `/api/admin/${encodePath(query.path || query["...path"])}`);
