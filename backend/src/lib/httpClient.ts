import axios from "axios";
import https from "https";
import fs from "fs";
import path from "path";

function resolveCaPath(envPath: string) {
  // Si es absoluta, úsala tal cual
  if (path.isAbsolute(envPath)) return envPath;

  // Si es relativa, la resolvemos contra el backend (cwd)
  return path.resolve(process.cwd(), envPath);
}

function buildHttpsAgentFromEnv(): https.Agent | undefined {
  const raw = process.env.EXTRA_CA_CERT_PATH;
  if (!raw) {
    console.log("[HTTP] EXTRA_CA_CERT_PATH not set");
    return undefined;
  }

  const caPath = resolveCaPath(raw);
  console.log("[HTTP] EXTRA_CA_CERT_PATH raw:", raw);
  console.log("[HTTP] EXTRA_CA_CERT_PATH resolved:", caPath);

  if (!fs.existsSync(caPath)) {
    console.log("[HTTP] CA file does not exist at:", caPath);
    return undefined;
  }

  const ca = fs.readFileSync(caPath, "utf8");
  console.log("[HTTP] CA loaded, length:", ca.length);
  console.log("[HTTP] CA preview:", ca.slice(0, 30)); // debería empezar por -----BEGIN CERTIFICATE-----

  return new https.Agent({ ca, keepAlive: true });
}

export const http = axios.create({
  timeout: 15000,
  httpsAgent: buildHttpsAgentFromEnv(),
});
