import { createRouteHandler } from "uploadthing/next";

import { uploadRouter } from "@/services/uploadthing";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
