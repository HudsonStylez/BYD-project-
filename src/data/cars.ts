export interface Car {
  id: number;
  model: string;
  year: number;
  price: number;
  monthlyFinance: number;
  range: number; // miles
  imageUrl: string; // Unsplash query or local path
  badge?: "Popular" | "New" | "Coming Soon";
  description: string;
  category: string;
  specs: {
    acceleration: string;
    topSpeed: string;
    batteryKwh: string;
    chargingMinutes: string;
  };
}

export const BYD_VEHICLE_FLEET: Car[] = [
  {
    id: 1,
    model: "BYD Seal",
    year: 2025,
    price: 45900,
    monthlyFinance: 699,
    range: 323,
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    category: "Sedan",
    description: "Form-fitting luxury sports sedan powered by BYD e-Platform 3.0. Features CTB (Cell-to-Body) integrated design, delivering 323 miles of pristine driving range with breathtaking responsive handling.",
    specs: {
      acceleration: "3.8s",
      topSpeed: "112 mph",
      batteryKwh: "82.5 kWh",
      chargingMinutes: "30 min"
    }
  },
  {
    id: 2,
    model: "BYD Atto 3",
    year: 2025,
    price: 38900,
    monthlyFinance: 529,
    range: 260,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    category: "SUV",
    description: "Sleek and playful urban electric SUV featuring fitness-inspired interior styling, rotating 15.6-inch screen, and advanced driver assistance safety nets.",
    specs: {
      acceleration: "7.3s",
      topSpeed: "99 mph",
      batteryKwh: "60.4 kWh",
      chargingMinutes: "40 min"
    }
  },
  {
    id: 3,
    model: "BYD Dolphin",
    year: 2025,
    price: 29900,
    monthlyFinance: 399,
    range: 211,
    imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    category: "Hatchback",
    description: "Agile, eco-friendly urban runabout designed with rounded oceanic form lines. The highly-maneuverable companion for everyday dense traffic commuting.",
    specs: {
      acceleration: "7.0s",
      topSpeed: "93 mph",
      batteryKwh: "44.9 kWh",
      chargingMinutes: "28 min"
    }
  },
  {
    id: 4,
    model: "BYD Han",
    year: 2025,
    price: 52500,
    monthlyFinance: 799,
    range: 375,
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    category: "Sedan",
    description: "Flagship luxury executive sedan matching ultimate dynamic speed with comfortable leather-appointed interior cabins and sound-insulating acoustic windows.",
    specs: {
      acceleration: "3.9s",
      topSpeed: "115 mph",
      batteryKwh: "85.4 kWh",
      chargingMinutes: "34 min"
    }
  },
  {
    id: 5,
    model: "BYD Tang",
    year: 2025,
    price: 58000,
    monthlyFinance: 859,
    range: 310,
    imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
    category: "SUV",
    description: "Premium seven-seat family cruise SUV equipped with comprehensive all-wheel-drive dynamics and reliable blade cell modules for absolute driving confidence.",
    specs: {
      acceleration: "4.6s",
      topSpeed: "112 mph",
      batteryKwh: "108.0 kWh",
      chargingMinutes: "45 min"
    }
  },
  {
    id: 6,
    model: "BYD Sea Lion 07",
    year: 2025,
    price: 49500,
    monthlyFinance: 719,
    range: 315,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    badge: "New",
    category: "SUV",
    description: "Premium mid-size coupe-style electric SUV showcasing the latest generation oceanic aesthetics and fast-charging capabilities on the global market.",
    specs: {
      acceleration: "4.5s",
      topSpeed: "115 mph",
      batteryKwh: "82.5 kWh",
      chargingMinutes: "25 min"
    }
  },
  {
    id: 7,
    model: "BYD Shark",
    year: 2026,
    price: 55000,
    monthlyFinance: 899,
    range: 280,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    badge: "Coming Soon",
    category: "Pickup",
    description: "Dual-motor advanced hybrid adventure pickup built utilizing structural cage durability. High payload, multiple power supply plugs, and trail-shredding suspension systems.",
    specs: {
      acceleration: "4.8s",
      topSpeed: "105 mph",
      batteryKwh: "29.6 kWh Plus PHEV Engine",
      chargingMinutes: "20 min"
    }
  },
  {
    id: 8,
    model: "BYD Super 9",
    year: 2027,
    price: 185000,
    monthlyFinance: 2499,
    range: 250,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    badge: "Coming Soon",
    category: "Concept",
    description: "Open-cockpit high-performance elite speedster conceptualized directly by the legendary Wolfgang Egger. An aerodynamic sculpture that defies the bounds of speed.",
    specs: {
      acceleration: "2.7s",
      topSpeed: "186 mph",
      batteryKwh: "95.0 kWh Extreme-C",
      chargingMinutes: "15 min"
    }
  },
  {
    id: 9,
    model: "BYD Yuan Plus",
    year: 2025,
    price: 36000,
    monthlyFinance: 499,
    range: 261,
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11051691a0a5?auto=format&fit=crop&w=800&q=80",
    category: "SUV",
    description: "Compact dynamic multi-purpose crossover, highly sought-after across South-East Asian and European markets, known for its superb efficiency.",
    specs: {
      acceleration: "7.3s",
      topSpeed: "99 mph",
      batteryKwh: "60.48 kWh",
      chargingMinutes: "35 min"
    }
  },
  {
    id: 10,
    model: "BYD Seagull",
    year: 2025,
    price: 19500,
    monthlyFinance: 289,
    range: 190,
    imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    category: "Hatchback",
    description: "Incredibly efficient ultra-compact urban runabout that delivers advanced electric transportation at unprecedented value, utilizing safe solid-phase salt-LFP cells.",
    specs: {
      acceleration: "12.0s",
      topSpeed: "81 mph",
      batteryKwh: "30.08 kWh",
      chargingMinutes: "30 min"
    }
  },
  {
    id: 11,
    model: "BYD Song Plus",
    year: 2025,
    price: 41000,
    monthlyFinance: 589,
    range: 305,
    imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
    category: "SUV",
    description: "Comfort-optimized family SUV offering dynamic drive assistance, generous legroom layouts, and clean solar air filters throughout.",
    specs: {
      acceleration: "7.9s",
      topSpeed: "103 mph",
      batteryKwh: "71.7 kWh",
      chargingMinutes: "38 min"
    }
  },
  {
    id: 12,
    model: "BYD Denza D9",
    year: 2025,
    price: 76000,
    monthlyFinance: 1150,
    range: 385,
    imageUrl: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    category: "MPV",
    description: "Grand imperial electric MPV. Features luxury captain seating with massage elements, independent rear screen layouts, and double acoustic privacy glasses.",
    specs: {
      acceleration: "6.9s",
      topSpeed: "112 mph",
      batteryKwh: "103.0 kWh",
      chargingMinutes: "40 min"
    }
  },
  {
    id: 13,
    model: "BYD Denza N7",
    year: 2025,
    price: 61050,
    monthlyFinance: 929,
    range: 350,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    category: "SUV",
    description: "Premium executive electric hunting-style crossover SUV equipped with Devialet audio integration and highly-sensitive lidar piloting networks.",
    specs: {
      acceleration: "3.9s",
      topSpeed: "112 mph",
      batteryKwh: "91.3 kWh",
      chargingMinutes: "28 min"
    }
  },
  {
    id: 14,
    model: "BYD Yangwang U8",
    year: 2025,
    price: 145000,
    monthlyFinance: 1999,
    range: 395,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    category: "SUV",
    description: "Amphibious extreme off-roader featuring quad-motor independent drive control, 360-degree tank turns, and active aquatic emergency flotation modes.",
    specs: {
      acceleration: "3.6s",
      topSpeed: "124 mph",
      batteryKwh: "49.05 kWh Plus PHEV Range-Ext",
      chargingMinutes: "18 min"
    }
  },
  {
    id: 15,
    model: "BYD Yangwang U9",
    year: 2025,
    price: 195000,
    monthlyFinance: 2699,
    range: 285,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    badge: "New",
    category: "Coupe",
    description: "Vanguard electric hyper-supercar leveraging the robust DiSus-X intelligent hydraulic suspension system. Features carbon-fiber monocoque chassis structures and massive downforce spoilers.",
    specs: {
      acceleration: "2.36s",
      topSpeed: "192 mph",
      batteryKwh: "80.0 kWh Fast-Cell",
      chargingMinutes: "10 min"
    }
  },
  {
    id: 16,
    model: "BYD Qin Plus",
    year: 2025,
    price: 24500,
    monthlyFinance: 349,
    range: 320,
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    category: "Sedan",
    description: "Elite plug-in executive companion. Boasts incredible fuel and charge balancing algorithms, allowing for up to 745 miles of hybrid range limits.",
    specs: {
      acceleration: "7.9s",
      topSpeed: "105 mph",
      batteryKwh: "18.32 kWh PHEV Unit",
      chargingMinutes: "35 min"
    }
  },
  {
    id: 17,
    model: "BYD Destroyer 05",
    year: 2025,
    price: 26000,
    monthlyFinance: 369,
    range: 290,
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    category: "Sedan",
    description: "Eco-optimized ocean-series sports sedan offering ultra-efficient performance, dynamic sound output, and smart biometric keyless entry handles.",
    specs: {
      acceleration: "7.8s",
      topSpeed: "105 mph",
      batteryKwh: "18.3 kWh",
      chargingMinutes: "30 min"
    }
  },
  {
    id: 18,
    model: "BYD e6",
    year: 2025,
    price: 33500,
    monthlyFinance: 459,
    range: 300,
    imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    category: "MPV",
    description: "Highly stable and vetted logistics and eco-cab vehicle, proven over billions of combined kilometers driven in multiple major international capitals.",
    specs: {
      acceleration: "11.0s",
      topSpeed: "87 mph",
      batteryKwh: "71.7 kWh",
      chargingMinutes: "40 min"
    }
  },
  {
    id: 19,
    model: "BYD D1",
    year: 2025,
    price: 28200,
    monthlyFinance: 389,
    range: 220,
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    category: "Hatchback",
    description: "Cooperative urban commuter hatchback designed in alignment with leading ride-hailing groups, featuring automatic passenger siding doors.",
    specs: {
      acceleration: "10.0s",
      topSpeed: "81 mph",
      batteryKwh: "47.5 kWh",
      chargingMinutes: "35 min"
    }
  },
  {
    id: 20,
    model: "BYD Frigate 07",
    year: 2025,
    price: 43000,
    monthlyFinance: 619,
    range: 295,
    imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80",
    category: "SUV",
    description: "Ocean-inspired midsize luxury SUV equipped with advanced digital cockpit grids and high-damping active suspension elements.",
    specs: {
      acceleration: "5.5s",
      topSpeed: "112 mph",
      batteryKwh: "36.8 kWh PHEV Unit",
      chargingMinutes: "25 min"
    }
  },
  {
    id: 21,
    model: "BYD Sea King",
    year: 2026,
    price: 89000,
    monthlyFinance: 1299,
    range: 410,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    badge: "Coming Soon",
    category: "Concept",
    description: "The ultimate concept of ocean aesthetics scaled into an elite-class cruising sedan. Packed with interactive smart projection headlights.",
    specs: {
      acceleration: "3.2s",
      topSpeed: "135 mph",
      batteryKwh: "120.0 kWh Quantum-Flow",
      chargingMinutes: "12 min"
    }
  },
  {
    id: 22,
    model: "BYD Dolphin Mini",
    year: 2025,
    price: 18900,
    monthlyFinance: 269,
    range: 195,
    imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    category: "Hatchback",
    description: "Optimized, fun compact urban runabout, bringing standard vehicle safety, modern infotainment screens and superb parkability to narrow city lines.",
    specs: {
      acceleration: "12.2s",
      topSpeed: "81 mph",
      batteryKwh: "30.08 kWh",
      chargingMinutes: "30 min"
    }
  },
  {
    id: 23,
    model: "BYD Fang Cheng Bao 5",
    year: 2025,
    price: 68000,
    monthlyFinance: 989,
    range: 360,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    category: "SUV",
    description: "Extreme exploration vehicle powered by the dynamic DMO hybrid tech platform. Built for overlanding with structural recovery winches and triple lockers.",
    specs: {
      acceleration: "4.8s",
      topSpeed: "112 mph",
      batteryKwh: "31.8 kWh",
      chargingMinutes: "16 min"
    }
  },
  {
    id: 24,
    model: "BYD Song L",
    year: 2025,
    price: 47500,
    monthlyFinance: 689,
    range: 312,
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11051691a0a5?auto=format&fit=crop&w=800&q=80",
    badge: "New",
    category: "Coupe",
    description: "Gorgeous electric hunting SUV coupe sporting a retractable smart wing stabilizer and active all-conditions torque distribution systems.",
    specs: {
      acceleration: "4.3s",
      topSpeed: "124 mph",
      batteryKwh: "87.0 kWh",
      chargingMinutes: "33 min"
    }
  },
  {
    id: 25,
    model: "BYD Ocean-M",
    year: 2026,
    price: 32500,
    monthlyFinance: 459,
    range: 275,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    badge: "Coming Soon",
    category: "Concept",
    description: "Sleek and aggressive hot hatch conceptualizing performance electric chassis dynamics for motorsport-level thrill in custom daily formats.",
    specs: {
      acceleration: "4.1s",
      topSpeed: "130 mph",
      batteryKwh: "64.0 kWh Active-C",
      chargingMinutes: "20 min"
    }
  }
];
