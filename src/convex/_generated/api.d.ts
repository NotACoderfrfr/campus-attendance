/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as actionHistory from "../actionHistory.js";
import type * as adminImport from "../adminImport.js";
import type * as ai from "../ai.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as dataExport from "../dataExport.js";
import type * as dataExportQueries from "../dataExportQueries.js";
import type * as http from "../http.js";
import type * as importData from "../importData.js";
import type * as quickActions from "../quickActions.js";
import type * as sms from "../sms.js";
import type * as students from "../students.js";
import type * as users from "../users.js";
import type * as weeklyStats from "../weeklyStats.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  actionHistory: typeof actionHistory;
  adminImport: typeof adminImport;
  ai: typeof ai;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  crons: typeof crons;
  dataExport: typeof dataExport;
  dataExportQueries: typeof dataExportQueries;
  http: typeof http;
  importData: typeof importData;
  quickActions: typeof quickActions;
  sms: typeof sms;
  students: typeof students;
  users: typeof users;
  weeklyStats: typeof weeklyStats;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
