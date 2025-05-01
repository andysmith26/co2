
// Enhanced concept map data for Big Idea 4: Computing Systems and Networks

export const conceptNodes = [
  // Learning Objectives
  {
    id: "CSN-1.A",
    label: "Network Basics",
    description: "How computing devices work together in a network",
    bigIdea: 4,
    type: "learning-objective",
    importance: 5
  },
  {
    id: "CSN-1.B",
    label: "Internet Operation",
    description: "How the Internet works",
    bigIdea: 4,
    type: "learning-objective",
    importance: 5
  },
  {
    id: "CSN-1.C",
    label: "Data Transmission",
    description: "How data are sent through the Internet via packets",
    bigIdea: 4,
    type: "learning-objective",
    importance: 5
  },
  {
    id: "CSN-1.D",
    label: "Internet vs. WWW",
    description: "Differences between the Internet and the World Wide Web",
    bigIdea: 4,
    type: "learning-objective",
    importance: 5
  },
  {
    id: "CSN-1.E",
    label: "Fault Tolerance",
    description: "How fault-tolerant systems like the Internet handle failure",
    bigIdea: 4,
    type: "learning-objective",
    importance: 5
  },
  
  // Key Vocabulary
  {
    id: "computing-device",
    label: "Computing Device",
    description: "A physical artifact that can run a program (computers, tablets, servers, routers, smart sensors)",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "computing-system",
    label: "Computing System",
    description: "One or more computing devices and software programs running on those devices",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "computer-network",
    label: "Computer Network",
    description: "A group of interconnected computing devices capable of sending or receiving data",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 5
  },
  {
    id: "lan",
    label: "LAN",
    description: "Local Area Network - connects computing devices over a short distance",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "wan",
    label: "WAN",
    description: "Wide Area Network - connects computing devices over a wide geographical area",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "internet",
    label: "Internet",
    description: "A computer network consisting of interconnected networks using standardized, open communication protocols",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 5
  },
  {
    id: "routing",
    label: "Routing",
    description: "The process of finding a path from sender to receiver",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 5
  },
  {
    id: "network-infrastructure",
    label: "Network Infrastructure",
    description: "Hardware components and transmission media that determine paths between sender and receiver",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "autonomous-system",
    label: "Autonomous System",
    description: "A collection of connected Internet Protocol routing prefixes controlled by a single organization",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.B",
    importance: 3
  },
  {
    id: "packet-switching",
    label: "Packet Switching",
    description: "Breaking data into blocks of bits called packets for transmission across networks",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.B",
    importance: 5
  },
  {
    id: "data-stream",
    label: "Data Stream",
    description: "Information passed through the Internet containing chunks of data encapsulated in packets",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.B",
    importance: 4
  },
  {
    id: "protocol",
    label: "Protocol",
    description: "A set of rules that specify the behavior of a system",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.C",
    importance: 5
  },
  {
    id: "open-protocol",
    label: "Open Protocol",
    description: "Communication standards that are publicly available and can be used by anyone",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.C",
    importance: 4
  },
  {
    id: "ip-address",
    label: "IP Address",
    description: "A unique identifier used to determine the transmission path of packets over the Internet",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.C",
    importance: 5
  },
  {
    id: "domain-name",
    label: "Domain Name",
    description: "Human-readable address for a website that gets translated to an IP address",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.C",
    importance: 4
  },
  {
    id: "world-wide-web",
    label: "World Wide Web",
    description: "A system of linked pages, programs, and files that uses the Internet",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.D",
    importance: 5
  },
  {
    id: "fault-tolerance",
    label: "Fault Tolerance",
    description: "The ability of a system to continue operating despite failures in some components",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.E",
    importance: 5
  },
  {
    id: "scalability",
    label: "Scalability",
    description: "The ability of a system to handle growing amounts of work or expand to accommodate growth",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.E",
    importance: 4
  },
  {
    id: "redundancy",
    label: "Redundancy",
    description: "Multiple components/paths performing the same function to improve reliability",
    bigIdea: 4,
    type: "vocabulary",
    relatedLO: "CSN-1.E",
    importance: 5
  },
  
  // Specific Protocols
  {
    id: "http",
    label: "HTTP",
    description: "HyperText Transfer Protocol - protocol used by the World Wide Web",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.D",
    importance: 5
  },
  {
    id: "https",
    label: "HTTPS",
    description: "Secure HTTP - encrypted version of HTTP for secure communication",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.E",
    importance: 4
  },
  {
    id: "tcp-ip",
    label: "TCP/IP",
    description: "Transmission Control Protocol/Internet Protocol - foundational protocols of the Internet",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.C",
    importance: 5
  },
  {
    id: "dns-protocol",
    label: "DNS Protocol",
    description: "Domain Name System protocol for translating domain names to IP addresses",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.C",
    importance: 5
  },
  {
    id: "ftp",
    label: "FTP",
    description: "File Transfer Protocol - standard for transferring files between computers over a network",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.C",
    importance: 3
  },
  {
    id: "smtp",
    label: "SMTP",
    description: "Simple Mail Transfer Protocol - for sending email messages between servers",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.C",
    importance: 3
  },
  {
    id: "ipv4",
    label: "IPv4",
    description: "Internet Protocol version 4 - uses 32-bit addresses (e.g., 192.168.1.1)",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.C",
    importance: 4
  },
  {
    id: "ipv6",
    label: "IPv6",
    description: "Internet Protocol version 6 - uses 128-bit addresses to expand available addresses",
    bigIdea: 4,
    type: "protocol",
    relatedLO: "CSN-1.C",
    importance: 3
  },
  
  // Technologies
  {
    id: "web-browser",
    label: "Web Browser",
    description: "Software application for accessing information on the World Wide Web",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.D",
    importance: 4
  },
  {
    id: "email",
    label: "Email",
    description: "Method of exchanging digital messages between computers over a network",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.B",
    importance: 3
  },
  {
    id: "search-engine",
    label: "Search Engine",
    description: "Software system designed to search for information on the World Wide Web",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.D",
    importance: 3
  },
  {
    id: "social-media",
    label: "Social Media",
    description: "Web-based platforms that enable users to create and share content",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.D",
    importance: 3
  },
  {
    id: "cloud-computing",
    label: "Cloud Computing",
    description: "On-demand availability of computer system resources over the Internet",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.B",
    importance: 4
  },
  {
    id: "vpn",
    label: "VPN",
    description: "Virtual Private Network - extends a private network across a public network",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.A",
    importance: 3
  },
  {
    id: "iot",
    label: "IoT",
    description: "Internet of Things - everyday objects with computing devices that connect to the Internet",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.A",
    importance: 3
  },
  {
    id: "cdn",
    label: "CDN",
    description: "Content Delivery Network - distributed server system delivering web content based on geographic location",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.E",
    importance: 3
  },
  {
    id: "dns-service",
    label: "DNS Service",
    description: "System that translates domain names to IP addresses",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.C",
    importance: 4
  },
  {
    id: "isp",
    label: "ISP",
    description: "Internet Service Provider - organization that provides access to the Internet",
    bigIdea: 4,
    type: "technology",
    relatedLO: "CSN-1.B",
    importance: 4
  },
  
  // Infrastructure Components
  {
    id: "router",
    label: "Router",
    description: "Networking device that forwards data packets between computer networks",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.A",
    importance: 5
  },
  {
    id: "switch",
    label: "Switch",
    description: "Networking device that connects devices within a single network",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "server",
    label: "Server",
    description: "Computer program or device that provides functionality to other programs or devices",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "data-center",
    label: "Data Center",
    description: "Facility that houses computer systems and associated components",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.B",
    importance: 3
  },
  {
    id: "fiber-optic",
    label: "Fiber Optic Cable",
    description: "Uses light to transmit data over glass or plastic fibers",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.A",
    importance: 3
  },
  {
    id: "wifi",
    label: "WiFi",
    description: "Wireless networking technology allowing devices to communicate without direct cable connections",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.A",
    importance: 4
  },
  {
    id: "cellular-network",
    label: "Cellular Network",
    description: "Communication network distributed over land areas called cells",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.A",
    importance: 3
  },
  {
    id: "satellite",
    label: "Satellite",
    description: "Space-based system for communication, positioning, and data relay",
    bigIdea: 4,
    type: "infrastructure",
    relatedLO: "CSN-1.A",
    importance: 3
  }
];

// Initial starter connections between concepts
export const starterConnections = [
  // Learning Objective to Vocabulary connections
  { id: "c1", source: "CSN-1.A", target: "computing-device", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c2", source: "CSN-1.A", target: "computing-system", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c3", source: "CSN-1.A", target: "computer-network", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c4", source: "CSN-1.A", target: "lan", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c5", source: "CSN-1.A", target: "wan", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c6", source: "CSN-1.A", target: "internet", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c7", source: "CSN-1.A", target: "routing", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c8", source: "CSN-1.A", target: "network-infrastructure", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  
  { id: "c9", source: "CSN-1.B", target: "autonomous-system", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c10", source: "CSN-1.B", target: "packet-switching", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c11", source: "CSN-1.B", target: "data-stream", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  
  { id: "c12", source: "CSN-1.C", target: "protocol", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c13", source: "CSN-1.C", target: "open-protocol", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c14", source: "CSN-1.C", target: "ip-address", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c15", source: "CSN-1.C", target: "domain-name", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  
  { id: "c16", source: "CSN-1.D", target: "world-wide-web", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  
  { id: "c17", source: "CSN-1.E", target: "fault-tolerance", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c18", source: "CSN-1.E", target: "scalability", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  { id: "c19", source: "CSN-1.E", target: "redundancy", type: "hierarchical", description: "LO includes this concept", userCreated: false },
  
  // Connect protocols to relevant vocabulary
  { id: "c20", source: "protocol", target: "http", type: "hierarchical", description: "HTTP is a specific protocol", userCreated: false },
  { id: "c21", source: "protocol", target: "https", type: "hierarchical", description: "HTTPS is a specific protocol", userCreated: false },
  { id: "c22", source: "protocol", target: "tcp-ip", type: "hierarchical", description: "TCP/IP are specific protocols", userCreated: false },
  { id: "c23", source: "protocol", target: "dns-protocol", type: "hierarchical", description: "DNS is a specific protocol", userCreated: false },
  { id: "c24", source: "protocol", target: "ftp", type: "hierarchical", description: "FTP is a specific protocol", userCreated: false },
  { id: "c25", source: "protocol", target: "smtp", type: "hierarchical", description: "SMTP is a specific protocol", userCreated: false },
  
  // Connect important functional relationships
  { id: "c26", source: "world-wide-web", target: "http", type: "functional", description: "The World Wide Web uses HTTP protocol", userCreated: false },
  { id: "c27", source: "world-wide-web", target: "internet", type: "functional", description: "The World Wide Web uses the Internet", userCreated: false },
  { id: "c28", source: "domain-name", target: "dns-protocol", type: "functional", description: "DNS translates domain names to IP addresses", userCreated: false },
  { id: "c29", source: "ip-address", target: "routing", type: "functional", description: "IP addresses are used for routing packets", userCreated: false },
  { id: "c30", source: "packet-switching", target: "redundancy", type: "causal", description: "Packet switching enables redundant routing paths", userCreated: false },
  
  // Connect infrastructure to network concepts
  { id: "c31", source: "network-infrastructure", target: "router", type: "hierarchical", description: "Routers are network infrastructure components", userCreated: false },
  { id: "c32", source: "network-infrastructure", target: "switch", type: "hierarchical", description: "Switches are network infrastructure components", userCreated: false },
  { id: "c33", source: "network-infrastructure", target: "fiber-optic", type: "hierarchical", description: "Fiber optic cables are network infrastructure components", userCreated: false },
  { id: "c34", source: "network-infrastructure", target: "wifi", type: "hierarchical", description: "WiFi is a network infrastructure component", userCreated: false },
  
  // Connect technologies to concepts
  { id: "c35", source: "world-wide-web", target: "web-browser", type: "functional", description: "Web browsers are used to access the World Wide Web", userCreated: false },
  { id: "c36", source: "tcp-ip", target: "email", type: "functional", description: "Email relies on TCP/IP for transmission", userCreated: false },
  { id: "c37", source: "autonomous-system", target: "isp", type: "hierarchical", description: "ISPs are autonomous systems", userCreated: false },
  { id: "c38", source: "domain-name", target: "dns-service", type: "functional", description: "DNS services translate domain names to IP addresses", userCreated: false }
];

// Connection types and their descriptions
export const connectionTypes = [
  {
    id: "hierarchical",
    label: "Hierarchical",
    description: "One concept is a type/part of another concept"
  },
  {
    id: "sequential",
    label: "Sequential",
    description: "One concept happens before another concept"
  },
  {
    id: "causal",
    label: "Causal",
    description: "One concept causes or enables another concept"
  },
  {
    id: "comparative",
    label: "Comparative",
    description: "Concepts are similar but different in specific ways"
  },
  {
    id: "functional",
    label: "Functional",
    description: "Concepts work together to accomplish a task"
  }
];

// Type definitions for coloring/styling
export const nodeTypes = [
  {
    id: "learning-objective",
    label: "Learning Objective",
    color: "#3498db", // Blue
    size: 24
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    color: "#e74c3c", // Red
    size: 18
  },
  {
    id: "protocol",
    label: "Protocol",
    color: "#2ecc71", // Green
    size: 16
  },
  {
    id: "technology",
    label: "Technology",
    color: "#9b59b6", // Purple
    size: 16
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    color: "#f39c12", // Orange
    size: 16
  }
];
