import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Camera,
  Database,
  Globe,
  HardDrive,
  Laptop,
  Monitor,
  Network,
  Phone,
  Printer,
  Router,
  Server,
  Settings,
  Shield,
  Smartphone,
  Wifi,
} from "lucide-react";

export interface DeviceRole {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

export const deviceRoles: DeviceRole[] = [
  { id: "domain-controller", label: "Domain Controller", icon: Server, count: 5 },
  { id: "file-server", label: "File Server", icon: HardDrive, count: 8 },
  { id: "mobile-device", label: "Mobile Device", icon: Smartphone, count: 0 },
  { id: "pc", label: "PC", icon: Monitor, count: 55 },
  { id: "vulnerability-scanner", label: "Vulnerability Scanner", icon: Shield, count: 0 },
  { id: "vpn-client", label: "VPN Client", icon: Globe, count: 6 },
  { id: "vpn-gateway", label: "VPN Gateway", icon: Router, count: 1 },
  { id: "wifi-ap", label: "Wi-Fi Access Point", icon: Wifi, count: 0 },
  { id: "ip-camera", label: "IP Camera", icon: Camera, count: 0 },
  { id: "medical-device", label: "Medical Device", icon: Activity, count: 0 },
  { id: "printer", label: "Printer", icon: Printer, count: 1 },
  { id: "voip-phone", label: "VoIP Phone", icon: Phone, count: 43 },
  { id: "database", label: "Database", icon: Database, count: 7 },
  { id: "web-server", label: "Web Server", icon: Globe, count: 29 },
  { id: "load-balancer", label: "Load Balancer", icon: Network, count: 0 },
  { id: "proxy-server", label: "Web Proxy Server", icon: Globe, count: 0 },
  { id: "firewall", label: "Firewall", icon: Shield, count: 0 },
  { id: "gateway", label: "Gateway", icon: Router, count: 4 },
  { id: "custom-device", label: "Custom Device", icon: Settings, count: 1 },
  { id: "nat-gateway", label: "NAT Gateway", icon: Router, count: 4 },
  { id: "attack-simulator", label: "Attack Simulator", icon: AlertTriangle, count: 0 },
];

export const protocolStats = [
  { name: "Database", servers: 6, clients: 11 },
  { name: "DHCP", servers: 9, clients: 23 },
  { name: "DNS", servers: 17, clients: 91 },
  { name: "HL7", servers: 1, clients: 2 },
  { name: "HTTP", servers: 32, clients: 102 },
  { name: "ICA", servers: 6, clients: 26 },
  { name: "Kerberos", servers: 3, clients: 13 },
  { name: "LDAP", servers: 6, clients: 29 },
  { name: "MSRPC", servers: 7, clients: 25 },
  { name: "NFS", servers: 4, clients: 4 },
  { name: "SMB", servers: 12, clients: 45 },
  { name: "SSH", servers: 8, clients: 32 },
];

export const headerStats = [
  { label: "New Assets", value: 3, color: "text-emerald-500" },
  { label: "Active Assets", value: 9, color: "text-primary" },
  { label: "Asset Groups", value: 24, color: "text-primary" },
  { label: "Stale Assets", value: 20, color: "text-amber-500" },
];

export const roleToAssetMapping: Record<string, string[]> = {
  "domain-controller": ["Domain Controller"],
  "file-server": ["File Server"],
  "mobile-device": ["Mobile"],
  "pc": ["Workstation", "Laptop"],
  "vulnerability-scanner": ["Scanner"],
  "vpn-client": ["VPN Client"],
  "vpn-gateway": ["VPN Gateway"],
  "wifi-ap": ["Access Point"],
  "ip-camera": ["Camera"],
  "medical-device": ["Medical"],
  "printer": ["Printer"],
  "voip-phone": ["VoIP Phone"],
  database: ["Database"],
  "web-server": ["Web Server"],
  "load-balancer": ["Load Balancer"],
  "proxy-server": ["Proxy"],
  firewall: ["Firewall"],
  gateway: ["Gateway"],
  "custom-device": ["Custom"],
  "nat-gateway": ["NAT Gateway"],
  "attack-simulator": ["Attack Simulator"],
};

export const getDeviceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "server":
      return Server;
    case "laptop":
    case "workstation":
      return Laptop;
    case "mobile":
      return Smartphone;
    default:
      return Monitor;
  }
};
