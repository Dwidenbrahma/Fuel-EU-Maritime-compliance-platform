import request from "supertest";
import { createApp } from "../../src/infrastructure/server/app";

// Call createApp() to get a fresh express app instance for tests
export const api = () => request(createApp());
