// Currency is now in USD/USDC directly (no conversion from GHS)
// Base token price ($10)
const BASE_TOKEN_PRICE = 10;

export const properties = [
  {
    id: '0x3d8e45a1c51bf05eb23be868d6ec26e050650f09a23af8161',
    name: 'Cantonments Luxury Apartments',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,luxury,apartment',
    images: [
      'https://source.unsplash.com/featured/?ghana,luxury,apartment',
      'https://source.unsplash.com/featured/?ghana,apartment,interior',
      'https://source.unsplash.com/featured/?ghana,kitchen,modern',
      'https://source.unsplash.com/featured/?ghana,bedroom,luxury',
    ],
    price: 2500000, // Now in USDC directly
    tokenPrice: 50, // Premium token price - 5x base
    ownerCount: 127,
    type: 'Fractional',
    roi: 8.5,
    tokensAvailable: 435,
    totalTokenSupply: 10000,
    description: 'This prime Cantonments property offers luxury living with smart home integration, sustainable energy systems, and premium amenities. Each token represents ownership in this premium Accra property with monthly rental distributions and DAO governance rights.',
    features: [
      'Premium Cantonments location',
      'Smart home integration',
      'Sustainable energy systems',
      'Automated rental distributions',
      'DAO governance rights',
      'Verified on-chain ownership',
      'Tokenized maintenance reserve',
      'Quarterly appreciation dividends',
    ],
    squareFeet: 3200,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2022,
    rentalYield: 5.8,
    rentalIncome: 12000, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x3d8e45a1c51bf05eb23be868d6ec26e050650f09a23af8161',
      tokenStandard: 'ERC-1155',
      tokenId: '1',
    }
  },
  {
    id: '0x6a4b8e03c50d1e78bc59c085fc4934095c63d55d7ef56e32',
    name: 'Airport Residential Estate',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,estate,modern',
    images: [
      'https://source.unsplash.com/featured/?ghana,estate,modern',
      'https://source.unsplash.com/featured/?ghana,living,room',
      'https://source.unsplash.com/featured/?ghana,interior,design',
      'https://source.unsplash.com/featured/?ghana,balcony,view',
    ],
    price: 1800000, // Now in USDC directly
    tokenPrice: 35, // Premium token price - 3.5x base
    ownerCount: 83,
    type: 'Buy',
    roi: 6.2,
    tokensAvailable: 278,
    totalTokenSupply: 1000,
    description: 'Located in the prestigious Airport Residential Area, this property represents the pinnacle of Accra luxury real estate. This tokenized property offers fractional ownership with automated rental income distribution via smart contracts, complete governance rights, and full transparency.',
    features: [
      'Panoramic city views',
      'Private rooftop terrace',
      'Premium finishes',
      'Smart home technology',
      'Automated rental income',
      'Voting rights on property decisions',
      'Transparent on-chain management',
      'Liquidity pool enabled',
    ],
    squareFeet: 2100,
    bedrooms: 3,
    bathrooms: 2.5,
    yearBuilt: 2021,
    rentalYield: 4.9,
    rentalIncome: 7800, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x6a4b8e03c50d1e78bc59c085fc4934095c63d55d7ef56e32',
      tokenStandard: 'ERC-1155',
      tokenId: '2',
    }
  },
  {
    id: '0x9f2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    name: 'Labadi Beach Villa',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,beach,house',
    images: [
      'https://source.unsplash.com/featured/?ghana,beach,house',
      'https://source.unsplash.com/featured/?ghana,beach,interior',
      'https://source.unsplash.com/featured/?ghana,swimming,pool',
      'https://source.unsplash.com/featured/?ghana,ocean,view',
    ],
    price: 3200000, // Now in USDC directly
    tokenPrice: 60, // Premium token price - 6x base
    ownerCount: 156,
    type: 'Auction',
    roi: 9.1,
    tokensAvailable: 782,
    totalTokenSupply: 2000,
    description: 'This premium beachfront property offers direct access to Labadi Beach with stunning ocean views. This tokenized property offers fractional ownership with automated rental income distribution, providing investors with passive income and governance rights.',
    features: [
      'Beachfront property',
      'Direct beach access',
      'Infinity pool',
      'Smart home integration',
      'Rental income smart contracts',
      'DAO property governance',
      'Real-time appreciation tracking',
      'Staking rewards for token holders',
    ],
    squareFeet: 4500,
    bedrooms: 5,
    bathrooms: 4.5,
    yearBuilt: 2020,
    rentalYield: 7.2,
    rentalIncome: 19200, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x9f2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
      tokenStandard: 'ERC-1155',
      tokenId: '3',
    }
  },
  {
    id: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    name: 'East Legon Loft',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,loft,urban',
    images: [
      'https://source.unsplash.com/featured/?ghana,loft,urban',
      'https://source.unsplash.com/featured/?ghana,loft,interior',
      'https://source.unsplash.com/featured/?ghana,modern,design',
      'https://source.unsplash.com/featured/?ghana,living,space',
    ],
    price: 1200000, // Now in USDC directly
    tokenPrice: 20, // Medium token price - 2x base
    ownerCount: 64,
    type: 'Rent',
    roi: 7.8,
    tokensAvailable: 124,
    totalTokenSupply: 500,
    description: 'East Legon Loft offers a unique investment opportunity in one of Accra\'s most vibrant neighborhoods. This fully tokenized property offers fractional ownership with guaranteed rental yield distributed monthly through smart contracts and full governance participation.',
    features: [
      'Prime East Legon location',
      'Industrial modern design',
      'High ceilings and expansive windows',
      'Smart building integration',
      'Monthly rental distributions',
      'Token holder voting rights',
      'Transparent on-chain financials',
      'Liquidity pool for token trading',
    ],
    squareFeet: 1800,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2018,
    rentalYield: 6.5,
    rentalIncome: 6500, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
      tokenStandard: 'ERC-1155',
      tokenId: '4',
    }
  },
  {
    id: '0x2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b',
    name: 'Trassaco Valley Estate',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,luxury,estate',
    images: [
      'https://source.unsplash.com/featured/?ghana,luxury,estate',
      'https://source.unsplash.com/featured/?ghana,villa,interior',
      'https://source.unsplash.com/featured/?ghana,garden,luxury',
      'https://source.unsplash.com/featured/?ghana,swimming,pool',
    ],
    price: 4500000, // Now in USDC directly
    tokenPrice: 75, // Premium token price - 7.5x base
    ownerCount: 212,
    type: 'Fractional',
    roi: 10.3,
    tokensAvailable: 1273,
    totalTokenSupply: 5000,
    description: 'Trassaco Valley Estate is an exclusive Accra property offering tokenized ownership with high rental yield and long-term appreciation potential. Each token represents a fraction of this luxury estate with automatic rental income distribution.',
    features: [
      'Premium Trassaco Valley neighborhood',
      'Panoramic city views',
      'Luxury finishes throughout',
      'Electric vehicle charging',
      'Automated yield distribution',
      'Quarterly appreciation dividends',
      'DAO governance structure',
      'Enhanced liquidity through token trading',
    ],
    squareFeet: 6200,
    bedrooms: 6,
    bathrooms: 5.5,
    yearBuilt: 2021,
    rentalYield: 8.4,
    rentalIncome: 31500, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b',
      tokenStandard: 'ERC-1155',
      tokenId: '5',
    }
  },
  {
    id: '0x5e6d7c8b9a0f1e2d3c4b5a6f7d8e9c0b1a2f3e4d5c6b7',
    name: 'Ridge Royal Penthouse',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,penthouse,luxury',
    images: [
      'https://source.unsplash.com/featured/?ghana,penthouse,luxury',
      'https://source.unsplash.com/featured/?ghana,penthouse,view',
      'https://source.unsplash.com/featured/?ghana,modern,interior',
      'https://source.unsplash.com/featured/?ghana,living,luxury',
    ],
    price: 5800000, // Now in USDC directly
    tokenPrice: 100, // Premium token price - 10x base
    ownerCount: 245,
    type: 'Buy',
    roi: 7.5,
    tokensAvailable: 327,
    totalTokenSupply: 1000,
    description: 'The Ridge Royal Penthouse represents the pinnacle of Accra luxury real estate. This tokenized property allows fractional ownership with automated rental distributions, staking rewards, and full DAO governance participation.',
    features: [
      '360-degree city views',
      'Private rooftop terrace',
      'Premium smart home integration',
      'Private elevator access',
      'Blockchain rental distributions',
      'On-chain governance voting',
      'Staking rewards for long-term holders',
      'Transparent property management',
    ],
    squareFeet: 4800,
    bedrooms: 4,
    bathrooms: 4.5,
    yearBuilt: 2022,
    rentalYield: 6.8,
    rentalIncome: 29000, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x5e6d7c8b9a0f1e2d3c4b5a6f7d8e9c0b1a2f3e4d5c6b7',
      tokenStandard: 'ERC-1155',
      tokenId: '6',
    }
  },
  {
    id: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
    name: 'Spintex Road Townhouse',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,townhouse,modern',
    images: [
      'https://source.unsplash.com/featured/?ghana,townhouse,modern',
      'https://source.unsplash.com/featured/?ghana,townhouse,interior',
      'https://source.unsplash.com/featured/?ghana,living,room',
      'https://source.unsplash.com/featured/?ghana,bedroom,modern',
    ],
    price: 850000, // Now in USDC directly
    tokenPrice: 15, // Medium token price - 1.5x base
    ownerCount: 78,
    type: 'Rent',
    roi: 8.2,
    tokensAvailable: 320,
    totalTokenSupply: 850,
    description: 'Located in the bustling Spintex Road area, this modern townhouse offers great value with easy access to key Accra destinations. This property offers rental income potential with automated distribution to token holders.',
    features: [
      'Modern design',
      'Gated community',
      'Shared recreational facilities',
      'Energy efficient systems',
      'Smart home features',
      'Maintenance DAO',
      'Rental income sharing',
      'Community governance',
    ],
    squareFeet: 1600,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2020,
    rentalYield: 7.6,
    rentalIncome: 5400, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9',
      tokenStandard: 'ERC-1155',
      tokenId: '7',
    }
  },
  {
    id: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    name: 'Osu Commercial Building',
    location: 'Accra, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,commercial,building',
    images: [
      'https://source.unsplash.com/featured/?ghana,commercial,building',
      'https://source.unsplash.com/featured/?ghana,office,space',
      'https://source.unsplash.com/featured/?ghana,conference,room',
      'https://source.unsplash.com/featured/?ghana,business,district',
    ],
    price: 2200000, // Now in USDC directly
    tokenPrice: 45, // Premium token price - 4.5x base
    ownerCount: 134,
    type: 'Fractional',
    roi: 9.5,
    tokensAvailable: 570,
    totalTokenSupply: 2200,
    description: 'Prime commercial space in Osu, one of Accra\'s most vibrant business and entertainment districts. This commercial property offers steady income from established business tenants with long-term leases.',
    features: [
      'Prime Osu location',
      'Multiple commercial units',
      'Established tenants',
      'Long-term leases',
      'Dividend automation',
      'Business district',
      'High foot traffic',
      'Appreciation potential',
    ],
    squareFeet: 5800,
    bedrooms: 0,
    bathrooms: 4,
    yearBuilt: 2019,
    rentalYield: 8.7,
    rentalIncome: 15900, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
      tokenStandard: 'ERC-1155',
      tokenId: '8',
    }
  },
  {
    id: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    name: 'Kumasi Cultural Complex',
    location: 'Kumasi, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,cultural,building',
    images: [
      'https://source.unsplash.com/featured/?ghana,cultural,building',
      'https://source.unsplash.com/featured/?ghana,traditional,architecture',
      'https://source.unsplash.com/featured/?ghana,cultural,center',
      'https://source.unsplash.com/featured/?ghana,community,space',
    ],
    price: 1750000, // Now in USDC directly
    tokenPrice: 30, // Medium token price - 3x base
    ownerCount: 109,
    type: 'Auction',
    roi: 7.3,
    tokensAvailable: 492,
    totalTokenSupply: 1750,
    description: 'Located in the cultural heart of Kumasi, this unique complex combines traditional Ashanti architecture with modern amenities. This property offers cultural significance along with steady income from tourism and events.',
    features: [
      'Cultural significance',
      'Event spaces',
      'Tourism income',
      'Traditional design',
      'Modern amenities',
      'Community benefits',
      'Historical value',
      'Cultural preservation',
    ],
    squareFeet: 7500,
    bedrooms: 2,
    bathrooms: 6,
    yearBuilt: 2016,
    rentalYield: 6.9,
    rentalIncome: 10050, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
      tokenStandard: 'ERC-1155',
      tokenId: '9',
    }
  },
  {
    id: '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    name: 'Takoradi Harbor View Apartments',
    location: 'Takoradi, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,apartment,harbor',
    images: [
      'https://source.unsplash.com/featured/?ghana,apartment,harbor',
      'https://source.unsplash.com/featured/?ghana,harbor,view',
      'https://source.unsplash.com/featured/?ghana,coastal,apartment',
      'https://source.unsplash.com/featured/?ghana,modern,living',
    ],
    price: 1350000, // Now in USDC directly
    tokenPrice: 25, // Medium token price - 2.5x base
    ownerCount: 91,
    type: 'Buy',
    roi: 8.7,
    tokensAvailable: 378,
    totalTokenSupply: 1350,
    description: 'Situated in Takoradi with stunning harbor views, this apartment complex offers modern living in Ghana\'s western port city. The property provides steady income from long-term tenants in this growing economic center.',
    features: [
      'Harbor views',
      'Port city location',
      'Growing economic area',
      'Modern amenities',
      'Steady occupancy',
      'Long-term tenants',
      'Automated income',
      'Property value growth',
    ],
    squareFeet: 2800,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2019,
    rentalYield: 7.8,
    rentalIncome: 8775, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      tokenStandard: 'ERC-1155',
      tokenId: '10',
    }
  },
  {
    id: '0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    name: 'Tamale Eco-Resort',
    location: 'Tamale, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,resort,eco',
    images: [
      'https://source.unsplash.com/featured/?ghana,resort,eco',
      'https://source.unsplash.com/featured/?ghana,sustainable,tourism',
      'https://source.unsplash.com/featured/?ghana,eco,architecture',
      'https://source.unsplash.com/featured/?ghana,resort,outdoor',
    ],
    price: 2900000, // Now in USDC directly
    tokenPrice: 55, // Premium token price - 5.5x base
    ownerCount: 176,
    type: 'Auction',
    roi: 11.2,
    tokensAvailable: 823,
    totalTokenSupply: 2900,
    description: 'An innovative eco-resort in Tamale focusing on sustainable tourism with minimal environmental impact. This unique property combines tourism income with environmental conservation efforts.',
    features: [
      'Sustainable design',
      'Eco-tourism',
      'Low carbon footprint',
      'Renewable energy',
      'Water conservation',
      'Local community benefits',
      'Seasonal high yields',
      'Green investment appeal',
    ],
    squareFeet: 12000,
    bedrooms: 18,
    bathrooms: 20,
    yearBuilt: 2021,
    rentalYield: 9.6,
    rentalIncome: 23200, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0xe2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
      tokenStandard: 'ERC-1155',
      tokenId: '11',
    }
  },
  {
    id: '0xf3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    name: 'Cape Coast Heritage Home',
    location: 'Cape Coast, Ghana',
    image: 'https://source.unsplash.com/featured/?ghana,heritage,home',
    images: [
      'https://source.unsplash.com/featured/?ghana,heritage,home',
      'https://source.unsplash.com/featured/?ghana,colonial,architecture',
      'https://source.unsplash.com/featured/?ghana,historical,building',
      'https://source.unsplash.com/featured/?ghana,restored,interior',
    ],
    price: 980000, // Now in USDC directly
    tokenPrice: 8, // Basic token price - 0.8x base
    ownerCount: 65,
    type: 'Rent',
    roi: 7.1,
    tokensAvailable: 274,
    totalTokenSupply: 980,
    description: 'A beautifully restored colonial-era home in historic Cape Coast, offering a blend of heritage value and modern comfort. This property attracts tourism and provides authentic cultural experiences.',
    features: [
      'Historical significance',
      'Restoration quality',
      'Tourism potential',
      'Cultural heritage',
      'Modern amenities',
      'Unique character',
      'Event hosting',
      'Educational value',
    ],
    squareFeet: 3200,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 1885,
    rentalYield: 6.7,
    rentalIncome: 5460, // Now in USDC directly
    blockchainMetadata: {
      network: 'Ethereum',
      contractAddress: '0xf3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
      tokenStandard: 'ERC-1155',
      tokenId: '12',
    }
  }
];
