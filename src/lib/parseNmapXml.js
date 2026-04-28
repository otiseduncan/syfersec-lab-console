import { XMLParser } from "fast-xml-parser";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickAddress(host) {
  const addresses = asArray(host.address);
  const ipv4 = addresses.find((address) => address.addrtype === "ipv4");
  return ipv4?.addr || addresses[0]?.addr || "unknown";
}

function pickHostname(host) {
  const hostnames = asArray(host.hostnames?.hostname);
  return hostnames[0]?.name || "";
}

function pickOsGuess(host) {
  const matches = asArray(host.os?.osmatch);
  return matches[0]?.name || "";
}

export function parseNmapXml(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  const parsed = parser.parse(xml);
  const hostNodes = asArray(parsed?.nmaprun?.host);

  const hosts = hostNodes.map((host) => {
    const ports = asArray(host.ports?.port)
      .map((port) => ({
        port: Number(port.portid),
        protocol: port.protocol || "tcp",
        state: port.state?.state || "unknown",
        service: port.service?.name || "unknown",
        product: port.service?.product || "",
        version: port.service?.version || "",
      }))
      .filter((port) => port.state === "open");

    return {
      ip: pickAddress(host),
      hostname: pickHostname(host),
      status: host.status?.state || "unknown",
      osGuess: pickOsGuess(host),
      ports,
    };
  });

  const openPorts = hosts.flatMap((host) =>
    host.ports.map((port) => ({
      host: host.ip,
      hostname: host.hostname,
      ...port,
    }))
  );

  return {
    hosts,
    openPorts,
    summary: {
      hostsUp: hosts.filter((host) => host.status === "up").length,
      openPorts: openPorts.length,
    },
  };
}

export function generateFindings(parsed) {
  const findings = [];

  for (const port of parsed.openPorts || []) {
    const service = String(port.service || "").toLowerCase();

    if (port.port === 3389 || service.includes("rdp")) {
      findings.push({
        severity: "Medium",
        title: "RDP service detected",
        host: port.host,
        description: "Remote Desktop was detected on this host.",
        recommendation: "Confirm RDP is required and restrict access to trusted lab machines.",
      });
    }

    if (port.port === 445 || service.includes("smb") || service.includes("microsoft-ds")) {
      findings.push({
        severity: "Medium",
        title: "SMB service detected",
        host: port.host,
        description: "SMB or Windows file sharing appears to be available.",
        recommendation: "Review shares, permissions, guest access, and patch status.",
      });
    }

    if (port.port === 22 || service.includes("ssh")) {
      findings.push({
        severity: "Low",
        title: "SSH service detected",
        host: port.host,
        description: "SSH is open on this host.",
        recommendation: "Use strong authentication and monitor login attempts.",
      });
    }

    if ([80, 443, 8080, 3000, 5000, 8000].includes(port.port) || service.includes("http")) {
      findings.push({
        severity: "Info",
        title: "Web service detected",
        host: port.host,
        description: `A web service was detected on port ${port.port}.`,
        recommendation: "Review exposed routes, headers, and development-only settings.",
      });
    }

    if ([3306, 5432, 1433, 27017, 6379].includes(port.port)) {
      findings.push({
        severity: "High",
        title: "Database service detected",
        host: port.host,
        description: `A database-related service was detected on port ${port.port}.`,
        recommendation: "Confirm this is required and restrict access to trusted lab systems only.",
      });
    }

    if (port.protocol === "udp") {
      findings.push({
        severity: "Info",
        title: "UDP service detected",
        host: port.host,
        description: `A UDP service was detected on port ${port.port}.`,
        recommendation: "Confirm the service is required and document its purpose.",
      });
    }
  }

  return findings;
}
