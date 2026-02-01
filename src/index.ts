#!/usr/bin/env node
import { runCLI } from "./cli-tool";
import dotenv from "dotenv";
dotenv.config({quiet: true, path: ['/.env']});
runCLI();