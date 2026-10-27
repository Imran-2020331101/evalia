import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const GATEWAY_JAVA = 'server/auth-gateway/src/main/java/com/example/server';

export const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8');

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ProxyEndpoint {
  method: Method;
  path: string; // full path incl. base, params as {name}
  javaMethod: string;
}

export interface ExpressRoute {
  method: Method;
  path: string; // full path incl. mount prefix, params as :name
}

const stripJavaComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const stripJsComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Parse a Spring Feign proxy interface into endpoints. */
export function parseFeignProxy(rel: string): { baseUrl: string; basePath: string; endpoints: ProxyEndpoint[] } {
  const src = stripJavaComments(read(rel));
  const urlMatch = /@FeignClient\([\s\S]*?url\s*=\s*"([^"]+)"/.exec(src);
  if (!urlMatch) throw new Error(`No @FeignClient url in ${rel}`);
  const baseUrl = urlMatch[1];
  const basePath = baseUrl.replace(/^(\$\{[^}]+\}|https?:\/\/[^/]+)/, '');
  const endpoints: ProxyEndpoint[] = [];
  const re = /@(Get|Post|Put|Delete|Patch)Mapping\s*(?:\(([^)]*)\))?\s*(?:public\s+)?[\w<>?,\s]+?\s+(\w+)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const args = m[2] ?? '';
    const sub = /"([^"]*)"/.exec(args)?.[1] ?? '';
    endpoints.push({
      method: m[1].toUpperCase() as Method,
      path: normalize(basePath + sub),
      javaMethod: m[3],
    });
  }
  return { baseUrl, basePath, endpoints };
}

/** Parse `router.<verb>('/path', ...)` calls from an Express router file. */
export function parseExpressRoutes(rel: string, mountPrefix: string): ExpressRoute[] {
  const src = stripJsComments(read(rel));
  const routes: ExpressRoute[] = [];
  const re = /\brouter\.(get|post|put|delete|patch)\(\s*(["'`])([^"'`]*)\2/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    routes.push({ method: m[1].toUpperCase() as Method, path: normalize(mountPrefix + m[3]) });
  }
  return routes;
}

export function normalize(p: string): string {
  const out = p.replace(/\/{2,}/g, '/');
  return out.length > 1 ? out.replace(/\/$/, '') : out;
}

const toRegex = (pattern: string) =>
  new RegExp('^' + pattern.replace(/:[A-Za-z_]\w*/g, '[^/]+') + '$');

/** Express semantics: first registered route matching method+path wins. */
export function resolveRoute(routes: ExpressRoute[], method: Method, concretePath: string): ExpressRoute | undefined {
  return routes.find((r) => r.method === method && toRegex(r.path).test(normalize(concretePath)));
}

/** Replace `{param}` with a sample value so the path can be matched. */
export const concretize = (p: string) => p.replace(/\{[^}]+\}/g, 'sample123');

export const asKey = (e: { method: string; path: string }) => `${e.method} ${e.path}`;

/** Component / field names declared by a Java record or Lombok class (flat, nested included). */
export function javaFields(rel: string): string[] {
  const src = stripJavaComments(read(rel));
  const fields = new Set<string>();
  const rec = /record\s+\w+\s*\(([\s\S]*?)\)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = rec.exec(src))) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+/).pop();
      if (name) fields.add(name);
    }
  }
  const fld = /^\s*private\s+[\w<>,.\s]+?\s+(\w+)\s*;/gm;
  while ((m = fld.exec(src))) fields.add(m[1]);
  return [...fields];
}

export function javaEnumValues(rel: string, enumName: string): string[] {
  const src = stripJavaComments(read(rel));
  const m = new RegExp(`enum\\s+${enumName}\\s*\\{([^}]*)\\}`).exec(src);
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
}
