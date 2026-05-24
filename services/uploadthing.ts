import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

/** Upload routes — extend in later steps for branch images, event galleries */
export const uploadRouter = {
  branchImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
  eventGallery: f({
    image: { maxFileSize: "4MB", maxFileCount: 8 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
