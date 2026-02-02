import type { NetworkLocality } from "@/types/asset-management";

const toIpv4Int = (ip: string) => {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return null;
  if (parts.some((part) => part < 0 || part > 255)) return null;
  return (
    ((parts[0] << 24) >>> 0) +
    ((parts[1] << 16) >>> 0) +
    ((parts[2] << 8) >>> 0) +
    (parts[3] >>> 0)
  ) >>> 0;
};

const parseCidr = (cidr: string) => {
  const [base, bitsRaw] = cidr.split("/");
  const bits = Number(bitsRaw);
  if (!base || Number.isNaN(bits)) return null;
  if (bits < 0 || bits > 32) return null;
  const baseInt = toIpv4Int(base);
  if (baseInt === null) return null;
  return { baseInt, bits };
};

const cidrContains = (ipInt: number, cidr: string) => {
  const parsed = parseCidr(cidr);
  if (!parsed) return false;
  const { baseInt, bits } = parsed;
  if (bits === 0) return true;
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
};

export type LocalityMatch = {
  id: string;
  name: string;
  type: NetworkLocality["type"];
  cidr: string;
};

export const matchLocalityByIp = (ip: string, localities: NetworkLocality[]) => {
  const ipInt = toIpv4Int(ip);
  if (ipInt === null) return null;
  let best: LocalityMatch | null = null;
  let bestPrefix = -1;

  localities.forEach((locality) => {
    locality.cidrBlocks.forEach((cidr) => {
      const parsed = parseCidr(cidr);
      if (!parsed) return;
      if (!cidrContains(ipInt, cidr)) return;
      if (parsed.bits > bestPrefix) {
        bestPrefix = parsed.bits;
        best = {
          id: locality.id,
          name: locality.name,
          type: locality.type,
          cidr,
        };
      }
    });
  });

  return best;
};
