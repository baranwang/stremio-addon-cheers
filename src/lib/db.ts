import { open } from "lmdb";

export const db = open({
  path: process.env.DATABASE_PATH || "./data",
  compression: true,
});
