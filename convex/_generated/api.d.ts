/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as affiliates_d from "../affiliates/d.js";
import type * as affiliates_m from "../affiliates/m.js";
import type * as affiliates_q from "../affiliates/q.js";
import type * as qrcodes_d from "../qrcodes/d.js";
import type * as qrcodes_m from "../qrcodes/m.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "affiliates/d": typeof affiliates_d;
  "affiliates/m": typeof affiliates_m;
  "affiliates/q": typeof affiliates_q;
  "qrcodes/d": typeof qrcodes_d;
  "qrcodes/m": typeof qrcodes_m;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
