export const scanPolicy = {
  allowPublicTargets: false,
  maxConcurrentScans: 1,
  defaultTimeoutSeconds: 900,

  allowedTiming: ["T2", "T3", "T4", "T5"],
  allowedTopPorts: ["10", "50", "100", "500", "1000"],

  scanModes: [
    {
      id: "quick-discovery",
      name: "Quick Discovery",
      description: "Find live hosts without checking ports.",
      args: ["-sn"],
      allowPortOverride: false,
      requiresConfirmation: false,
    },
    {
      id: "basic-tcp",
      name: "Basic TCP Scan",
      description: "Check the top 100 TCP ports.",
      args: ["-sT", "--top-ports", "100"],
      allowPortOverride: true,
      requiresConfirmation: false,
    },
    {
      id: "service-detection",
      name: "Service Detection",
      description: "Identify services and versions on common open ports.",
      args: ["-sT", "-sV", "--top-ports", "100"],
      allowPortOverride: true,
      requiresConfirmation: false,
    },
    {
      id: "deep-service",
      name: "Deep Service Scan",
      description: "Scan TCP ports 1-10000 with service detection.",
      args: ["-sT", "-sV", "-p", "1-10000"],
      allowPortOverride: true,
      requiresConfirmation: false,
    },
    {
      id: "full-tcp",
      name: "Full TCP Scan",
      description: "Scan every TCP port from 1-65535.",
      args: ["-sT", "-p", "1-65535"],
      allowPortOverride: true,
      requiresConfirmation: false,
    },
    {
      id: "full-tcp-service",
      name: "Full TCP + Service Detection",
      description: "Full TCP port scan with service and version detection.",
      args: ["-sT", "-sV", "-p", "1-65535"],
      allowPortOverride: true,
      requiresConfirmation: false,
    },
    {
      id: "os-lab",
      name: "OS Detection Lab Only",
      description: "Attempt OS detection against authorized lab targets.",
      args: ["-O", "--osscan-guess"],
      allowPortOverride: false,
      requiresConfirmation: true,
    },
    {
      id: "udp-top",
      name: "UDP Top Ports Lab Scan",
      description: "Scan top UDP ports. This can be slow.",
      args: ["-sU", "--top-ports", "100"],
      allowPortOverride: true,
      requiresConfirmation: true,
    },
    {
      id: "custom-advanced",
      name: "Custom Advanced Lab Scan",
      description: "Build a controlled advanced scan using UI options.",
      args: [],
      allowPortOverride: true,
      requiresConfirmation: false,
    },
  ],
};

export function getScanModeById(id) {
  return scanPolicy.scanModes.find((mode) => mode.id === id);
}
