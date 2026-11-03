import type { Query, QueryFilter } from "mongoose";

interface PaginationResult {
  pagesCount: number;
  currentPage: number;
  limit: number;
}

class ApiFeatures<T> {
  mongooseQuery: Query<T[], T>;
  queryString: Record<string, unknown>;
  paginationResult?: PaginationResult;
  constructor(
    mongooseQuery: Query<T[], T>,
    queryString: Record<string, unknown>,
  ) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  filter() {
    const excluded = ["page", "sort", "limit", "fields", "keyword"];
    const allowedOps = ["gte", "gt", "lte", "lt", "in"];

    const convert = (v: unknown): unknown =>
      typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))
        ? Number(v)
        : v;

    const filter: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(this.queryString)) {
      if (excluded.includes(key) || key.startsWith("$")) continue;

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        const ops: Record<string, unknown> = {};
        for (const [op, v] of Object.entries(value)) {
          if (!allowedOps.includes(op)) continue;
          ops[`$${op}`] =
            op === "in" ? String(v).split(",").map(convert) : convert(v);
        }
        if (Object.keys(ops).length) filter[key] = ops;
      } else if (typeof value === "string") {
        filter[key] = convert(value);
      }
    }

    this.mongooseQuery = this.mongooseQuery.find(filter as QueryFilter<T>);
    return this;
  }
  sort() {
    const sort = this.queryString.sort;
    const sortBy =
      typeof sort === "string" && sort.trim()
        ? sort.split(",").join(" ")
        : "-createdAt";
    this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    return this;
  }

  limitFields() {
    const fields = this.queryString.fields;
    const selected =
      typeof fields === "string" && fields.trim()
        ? fields.split(",").join(" ")
        : "-__v";
    this.mongooseQuery = this.mongooseQuery.select(selected);
    return this;
  }
  search(modelName: string) {
    const keyword = this.queryString.keyword;
    if (typeof keyword !== "string" || !keyword.trim()) return this;

    const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query: Record<string, unknown> =
      modelName === "Product"
        ? {
            $or: [
              { title: { $regex: escaped, $options: "i" } },
              { description: { $regex: escaped, $options: "i" } },
            ],
          }
        : { name: { $regex: escaped, $options: "i" } };

    this.mongooseQuery = this.mongooseQuery.find(query);
    return this;
  }
  pagination(documentsCount: number) {
    const page = Math.max(Number(this.queryString.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(this.queryString.limit) || 50, 1),
      100,
    );
    const skip = (page - 1) * limit;

    this.paginationResult = {
      pagesCount: Math.ceil(documentsCount / limit),
      currentPage: page,
      limit,
    };

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
