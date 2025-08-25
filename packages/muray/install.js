// @ts-check
import os from "node:os";
import { execSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";
const platform = os.platform();

if (platform !== "linux" && platform !== "darwin" && platform !== "win32") {
  throw new Error(`Unsupported platform: ${platform}`);
}

const releases = {
  linux: "linux_amd64.tar.gz",
  darwin: "macos.tar.gz",
  win32: "win64_msvc16.zip",
};

const url =
  "https://github.com/raysan5/raylib/releases/download/5.5/raylib-5.5_" +
  releases[platform];

const $ = (/**@type{string}*/ cmd) => execSync(cmd, { stdio: "inherit" });

if (
  fs.existsSync("vendor/raylib-5.5_win64_msvc16") ||
  fs.existsSync("vendor/raylib-5.5_linux_amd64") ||
  fs.existsSync("vendor/raylib-5.5_macos")
) {
  console.log("raylib already installed");
  process.exit(0);
}

if (platform === "win32") {
  $(`curl.exe --output raylib.zip -L "${url}"`);
  $(`tar -xzf raylib.zip -C vendor`);
  $(`del raylib.zip`);
} else {
  $(`curl --output raylib.tar.gz -L "${url}"`);
  $(`tar -xzf raylib.tar.gz -C vendor`);
  $(`rm raylib.tar.gz`);
}
