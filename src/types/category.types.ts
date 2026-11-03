import type { HydratedDocument } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  image: string;
}

export type CategoryDocument = HydratedDocument<ICategory>;
