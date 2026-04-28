import { getScanModeById, scanPolicy } from "./scanPolicy";

function hasSuspiciousChars(value) {
  return /[;&|`$(){}[\]<>\\'"!]/.test(value);
}

function isValidIPv4(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const number = Number(part);
    return number >= 0 && number <= 255;
  });
}

function isPrivateIPv4(ip) {
  if (!isValidIPv4(ip)) return false;

  const [a, b] = ip.split(".").map(Number);

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;

  return false;
}

function isValidPrivateSingleTarget(target) {
  const cleanTarget = String(target || "").trim().toLowerCase();

  if (!cleanTarget) return false;
  if (hasSuspiciousChars(cleanTarget)) return false;
  if (cleanTarget === "localhost") return true;

  if (cleanTarget.startsWith("http://") || cleanTarget.startsWith("https://")) {
    return false;
  }

  const [ip, cidr] = cleanTarget.split("/");

  if (!isPrivateIPv4(ip)) return false;

  if (cidr === undefined) return true;

  if (!/^\d{1,2}$/.test(cidr)) return false;

  const prefix = Number(cidr);
  return prefix >= 0 && prefix <= 32;
}

function parseTargets(targetInput) {
  const cleanInput = String(targetInput || "")
    .trim()
    .replace(/，/g, ",");

  if (!cleanInput) {
    return { ok: false, error: "Target is required." };
  }

  if (hasSuspiciousChars(cleanInput)) {
    return { ok: false, error: "Target contains blocked characters." };
  }

  const targets = cleanInput
    .split(",")
    .map((target) => target.trim())
    .filter(Boolean);

  if (targets.length === 0) {
    return { ok: false, error: "Target is required." };
  }

  if (targets.length > 32) {
    return {
      ok: false,
      error: "Too many comma-separated targets. Use a private CIDR range for larger scans.",
    };
  }

  for (const target of targets) {
    if (!scanPolicy.allowPublicTargets && !isValidPrivateSingleTarget(target)) {
      return {
        ok: false,
        error:
          "Target blocked. Use localhost, 127.0.0.1, private IPs, comma-separated private IPs, or private CIDR like 192.168.50.0/24.",
      };
    }
  }

  return { ok: true, targets };
}

function validatePorts(ports) {
  if (!ports) return { ok: true, value: "" };

  const cleanPorts = String(ports)
    .trim()
    .replace(/\s+/g, "")
    .replace(/，/g, ",");

  if (!cleanPorts) return { ok: true, value: "" };

  if (hasSuspiciousChars(cleanPorts)) {
    return { ok: false, error: "Ports contain blocked characters." };
  }

  if (!/^(\d{1,5}(-\d{1,5})?)(,\d{1,5}(-\d{1,5})?)*$/.test(cleanPorts)) {
    return {
      ok: false,
      error: "Ports must look like 22,80,443 or 1-1000 or 1-65535.",
    };
  }

  const parts = cleanPorts.split(",");

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);

      if (start < 1 || end > 65535 || start > end) {
        return { ok: false, error: "Port ranges must be between 1 and 65535." };
      }
    } else {
      const port = Number(part);

      if (port < 1 || port > 65535) {
        return { ok: false, error: "Ports must be between 1 and 65535." };
      }
    }
  }

  return { ok: true, value: cleanPorts };
}

function removePortArgs(args) {
  const next = [];

  for (let index = 0; index < args.length; index++) {
    const item = args[index];

    if (item === "-p" || item === "--top-ports") {
      index++;
      continue;
    }

    next.push(item);
  }

  return next;
}

function addUnique(args, flag) {
  if (!args.includes(flag)) args.push(flag);
}

export function buildValidatedNmapArgs(payload) {
  const modeId = String(payload.modeId || payload.presetId || "full-tcp").trim();
  const timing = String(payload.timing || "T3").trim();
  const customPorts = String(payload.customPorts || payload.ports || "").trim();
  const topPorts = String(payload.topPorts || "100").trim();

  const serviceDetection = Boolean(payload.serviceDetection);
  const osDetection = Boolean(payload.osDetection);
  const udpScan = Boolean(payload.udpScan);
  const skipHostDiscovery = Boolean(payload.skipHostDiscovery);
  const verboseOutput = Boolean(payload.verboseOutput);
  const confirmed = Boolean(payload.confirmed || payload.confirmationChecked);

  const targetValidation = parseTargets(payload.target);

  if (!targetValidation.ok) {
    return targetValidation;
  }

  const mode = getScanModeById(modeId);

  if (!mode) {
    return { ok: false, error: "Invalid scan mode." };
  }

  if (!scanPolicy.allowedTiming.includes(timing)) {
    return { ok: false, error: "Invalid timing option." };
  }

  const portValidation = validatePorts(customPorts);

  if (!portValidation.ok) {
    return portValidation;
  }

  if (topPorts && !scanPolicy.allowedTopPorts.includes(topPorts)) {
    return { ok: false, error: "Invalid top ports option." };
  }

  let args = [...mode.args];

  if (mode.id === "custom-advanced") {
    args = [];

    if (udpScan) {
      args.push("-sU");
    }

    if (!udpScan || payload.tcpScan !== false) {
      args.push("-sT");
    }

    if (serviceDetection) addUnique(args, "-sV");

    if (osDetection) {
      addUnique(args, "-O");
      addUnique(args, "--osscan-guess");
    }

    if (portValidation.value) {
      args.push("-p", portValidation.value);
    } else if (!args.includes("-sn")) {
      args.push("--top-ports", topPorts);
    }
  } else {
    if (mode.allowPortOverride && portValidation.value) {
      args = removePortArgs(args);
      args.push("-p", portValidation.value);
    }

    if (serviceDetection) addUnique(args, "-sV");

    if (osDetection) {
      addUnique(args, "-O");
      addUnique(args, "--osscan-guess");
    }

    if (udpScan) addUnique(args, "-sU");
  }

  if (skipHostDiscovery) addUnique(args, "-Pn");
  if (verboseOutput) addUnique(args, "-v");

  const confirmationRequired =
    mode.requiresConfirmation || args.includes("-O") || args.includes("-sU");

  if (confirmationRequired && !confirmed) {
    return {
      ok: false,
      error: "Confirmation is required for OS detection or UDP scans.",
    };
  }

  addUnique(args, `-${timing}`);

  args.push("-oX", "-");
  args.push(...targetValidation.targets);

  return {
    ok: true,
    mode,
    targets: targetValidation.targets,
    args,
    confirmationRequired,
    safeCommandPreview: `nmap ${args.join(" ")}`,
  };
}
