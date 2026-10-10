// Preloaded (node --import) into chart builds run by check S4 so they run offline: any attempt
// to open a network connection or resolve a name throws. Best effort, plain Node: it blocks
// fetch, net/tls sockets (and so http/https) and DNS; it is not a sandbox.

import dns from "node:dns";
import net from "node:net";

const refuse = (what) => {
  throw new Error(`network access blocked by the eval checker (offline build): ${what}`);
};

globalThis.fetch = async (url) => refuse(`fetch ${url}`);
net.Socket.prototype.connect = function connect() {
  refuse("socket connect");
};
for (const name of ["lookup", "resolve", "resolve4", "resolve6", "resolveAny"]) {
  dns[name] = () => refuse(`dns.${name}`);
  if (dns.promises[name]) dns.promises[name] = async () => refuse(`dns.promises.${name}`);
}
