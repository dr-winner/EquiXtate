export interface AdvisorResponse {
  patterns: string[];
  responses: string[];
  followUp?: {
    patterns: string[];
    responses: string[];
  };
}

export const advisorResponses: AdvisorResponse[] = [
  // Basic Interactions
  {
    patterns: [
      "hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"
    ],
    responses: [
      "Hello! I'm your EquiXtate AI financial advisor. How can I help you with real estate investing today?",
      "Hi there! I'm here to assist you with your real estate investment journey. What would you like to know?",
      "Greetings! I'm your AI investment advisor. How can I help you make informed real estate decisions today?"
    ]
  },
  {
    patterns: [
      "help", "support", "assistance", "need help"
    ],
    responses: [
      "I'm here to help you with all aspects of real estate investing and tokenization. You can ask me about: investment strategies, tokenization benefits, risk management, market analysis, portfolio diversification, or specific property types. What would you like to know more about?",
      "I can assist you with: understanding tokenized real estate, investment strategies, market trends, risk assessment, portfolio management, and more. What specific area would you like to explore?",
      "I'm your comprehensive real estate investment guide. I can help with: property analysis, investment strategies, tokenization benefits, risk management, market trends, and portfolio optimization. What interests you most?"
    ]
  },
  {
    patterns: [
      "thank", "thanks", "appreciate"
    ],
    responses: [
      "You're welcome! Is there anything else you'd like to know about real estate investing or tokenization?",
      "My pleasure! Feel free to ask if you have more questions about real estate investments or tokenization.",
      "Glad I could help! Let me know if you need any other information about real estate investing."
    ]
  },
  {
    patterns: [
      "bye", "goodbye", "see you", "farewell"
    ],
    responses: [
      "Goodbye! Feel free to return if you have more questions about real estate investing or tokenization.",
      "See you later! Remember, I'm here to help with all your real estate investment queries.",
      "Farewell! Don't hesitate to come back if you need more information about tokenized real estate investments."
    ]
  },

  // Tokenization Fundamentals
  {
    patterns: [
      "token", "tokenization", "fractional", "fractional ownership", "what is tokenization", "explain tokenization"
    ],
    responses: [
      "Real estate tokenization is a revolutionary process that converts property ownership into digital tokens on the blockchain. This innovative approach offers: fractional ownership, increased liquidity, lower investment thresholds, transparent transactions, and global market access. Each token represents a share of the underlying property, making real estate investing more accessible and efficient.",
      "Tokenization transforms real estate into digital assets, making it more accessible and liquid. Each token represents partial ownership of the underlying property, with benefits including: easier transferability, lower transaction costs, global market access, automated compliance, and transparent ownership records. This democratizes real estate investing while maintaining all the benefits of property ownership.",
      "Through tokenization, you can own a fraction of premium properties that were previously out of reach. This process involves: property valuation, legal structuring, token creation, smart contract implementation, and regulatory compliance. The result is a more efficient, transparent, and accessible real estate market."
    ]
  },
  {
    patterns: [
      "blockchain", "smart contract", "digital asset", "crypto", "web3"
    ],
    responses: [
      "Blockchain technology is the foundation of real estate tokenization. It provides: immutable ownership records, transparent transactions, automated compliance through smart contracts, and secure digital asset management. Our platform uses enterprise-grade blockchain solutions to ensure security and regulatory compliance.",
      "Smart contracts automate many aspects of real estate transactions, including: ownership transfers, rental distributions, compliance checks, and property management tasks. This reduces administrative costs and increases efficiency while maintaining security and transparency.",
      "Digital assets in real estate tokenization represent actual property ownership, backed by real assets and legal structures. Unlike cryptocurrencies, these tokens are asset-backed securities that provide real-world value and income potential."
    ]
  },
  {
    patterns: [
      "benefits", "advantages", "pros", "why tokenize"
    ],
    responses: [
      "Tokenized real estate offers numerous benefits: lower investment minimums, increased liquidity, fractional ownership, global market access, transparent transactions, automated compliance, reduced transaction costs, and efficient property management. Would you like to explore any of these benefits in detail?",
      "The advantages of tokenized real estate include: democratized access to premium properties, 24/7 trading capabilities, automated dividend distributions, transparent ownership records, reduced administrative costs, and enhanced portfolio diversification opportunities.",
      "Tokenization provides significant advantages over traditional real estate investing: faster transactions, lower entry barriers, better liquidity, automated processes, transparent pricing, and global market access. This makes real estate investing more efficient and accessible."
    ]
  },

  // Investment Strategies
  {
    patterns: [
      "invest", "investment", "investing", "how to invest", "investment strategy"
    ],
    responses: [
      "Real estate investing through tokenization offers several strategic advantages: lower entry barriers, increased liquidity, and portfolio diversification. Key strategies include: value investing, growth investing, income investing, and opportunistic investing. Would you like to explore any specific strategy in detail?",
      "When developing your investment strategy, consider: risk tolerance, investment horizon, income requirements, and market conditions. Tokenized real estate allows for flexible strategies including: core investments, value-add opportunities, development projects, and specialized property types.",
      "Successful real estate investing requires a well-defined strategy. Consider: property type selection, geographic diversification, investment timeline, risk management, and income objectives. Tokenization makes it easier to implement these strategies with smaller capital requirements."
    ]
  },
  {
    patterns: [
      "portfolio", "diversify", "diversification", "asset allocation"
    ],
    responses: [
      "A well-diversified real estate portfolio should include: different property types (residential, commercial, industrial), various geographic locations, different investment strategies, and varying risk profiles. Tokenization makes this diversification achievable with smaller investments.",
      "Portfolio diversification in tokenized real estate involves: spreading investments across property types, geographic regions, investment strategies, and risk levels. This helps manage risk while maintaining exposure to the real estate market's growth potential.",
      "Effective portfolio management in tokenized real estate includes: regular rebalancing, risk assessment, performance monitoring, and strategic allocation. Our platform provides tools to help you manage and optimize your real estate portfolio."
    ]
  },
  {
    patterns: [
      "beginner", "start", "new", "first time", "how to start"
    ],
    responses: [
      "For beginners, I recommend: starting with fractional ownership through tokenized properties, beginning with small investments across multiple properties, researching neighborhoods with growth potential, and focusing on properties with strong rental demand. Would you like guidance on creating your first investment portfolio?",
      "New investors should: understand their risk tolerance, set clear investment goals, start with smaller investments, focus on learning market fundamentals, and gradually build their portfolio. Our platform makes it easy to begin with tokenized properties.",
      "Starting in real estate investing requires: education about market fundamentals, understanding risk management, setting realistic expectations, and developing a long-term strategy. Tokenized properties offer a great way to begin with lower capital requirements."
    ]
  },

  // Risk Management
  {
    patterns: [
      "risk", "risks", "safe", "security", "risk management"
    ],
    responses: [
      "Real estate investments carry several risks: market fluctuations, property damage, regulatory changes, and liquidity constraints. However, tokenization helps mitigate these through: diversification opportunities, transparent transactions, reduced entry barriers, and professional property management.",
      "Risk management in tokenized real estate involves: thorough due diligence, portfolio diversification, regular property valuations, insurance coverage, and compliance monitoring. Our platform implements multiple layers of security and risk management protocols.",
      "Security is our top priority. Our tokenized properties are: backed by real assets, supported by transparent ownership records, subject to regular valuations, managed by professionals, and protected by comprehensive insurance coverage."
    ]
  },
  {
    patterns: [
      "due diligence", "research", "analysis", "evaluation"
    ],
    responses: [
      "Proper due diligence for tokenized properties includes: property valuation, market analysis, legal review, management assessment, and financial analysis. Our platform provides comprehensive due diligence reports for all listed properties.",
      "Researching tokenized real estate investments involves: analyzing property fundamentals, market conditions, management quality, financial performance, and regulatory compliance. We provide detailed information to help you make informed decisions.",
      "Investment evaluation should consider: property location, market trends, tenant quality, management efficiency, and financial metrics. Our platform offers tools and data to help you analyze potential investments thoroughly."
    ]
  },

  // Financial Aspects
  {
    patterns: [
      "return", "roi", "profit", "earnings", "income", "yield"
    ],
    responses: [
      "Real estate returns typically come from: property value appreciation and rental income. On EquiXtate, our tokenized properties have historically delivered 5-10% annual returns, with some premium properties performing even better. Returns vary by property type and market conditions.",
      "ROI in real estate depends on: location, property type, market conditions, management efficiency, and investment strategy. Our platform provides detailed performance metrics and historical data for each property.",
      "Tokenized properties offer: regular income through rental distributions, potential capital appreciation, and tax advantages. Would you like to see specific performance data for our available properties?"
    ]
  },
  {
    patterns: [
      "cost", "fees", "expenses", "price", "valuation"
    ],
    responses: [
      "Investing in tokenized real estate involves: property acquisition costs, management fees, platform fees, and potential exit costs. However, these are typically lower than traditional real estate investments due to reduced administrative overhead.",
      "Costs associated with tokenized properties include: initial investment minimums, management fees, platform fees, and transaction costs. Our platform provides transparent fee structures and cost breakdowns for all properties.",
      "Property valuation in tokenized real estate is: conducted by independent appraisers, updated regularly, and transparently documented on the blockchain. This ensures fair pricing and accurate asset valuation."
    ]
  },
  {
    patterns: [
      "tax", "taxes", "taxation", "tax benefits", "tax implications"
    ],
    responses: [
      "Real estate investments have several tax implications: property taxes, income tax on rental income, capital gains tax, and potential tax benefits. Tokenized properties may offer additional tax efficiencies through blockchain-based ownership structures.",
      "Tax considerations for tokenized real estate include: income tax on distributions, capital gains tax on appreciation, property tax obligations, and potential tax benefits. Always consult with a tax professional for advice specific to your situation.",
      "Tax benefits vary by jurisdiction and investment structure. Our platform provides tax documentation for all tokenized properties, but you should consult with a tax advisor for personalized advice."
    ]
  },

  // Market Analysis
  {
    patterns: [
      "market", "trends", "analysis", "forecast", "outlook"
    ],
    responses: [
      "Current real estate market trends show: strong demand for tokenized properties, increasing institutional adoption, growing retail investor interest, and expanding global market access. Would you like specific market insights for particular regions or property types?",
      "Market analysis is crucial for successful real estate investing. Our platform provides: detailed market data, trend analysis, property comparisons, and investment opportunity assessments to help you make informed decisions.",
      "While I can't predict future market movements, I can help you understand: current market conditions, historical trends, key market indicators, and factors affecting real estate values in different regions."
    ]
  },
  {
    patterns: [
      "location", "area", "region", "geographic", "market selection"
    ],
    responses: [
      "Location analysis for real estate investing should consider: economic growth, population trends, employment rates, infrastructure development, and local market conditions. Our platform provides detailed location analysis for all properties.",
      "Geographic diversification is important in real estate investing. Consider: different economic regions, growth markets, established markets, and emerging opportunities. Tokenization makes it easier to achieve geographic diversification.",
      "Market selection should focus on: economic fundamentals, growth potential, market stability, and investment opportunities. Our platform offers comprehensive market analysis tools to help you identify promising locations."
    ]
  },

  // Property Types
  {
    patterns: [
      "residential", "apartment", "house", "condo", "single family"
    ],
    responses: [
      "Residential properties offer: stable rental income, lower volatility, and consistent demand. Tokenized residential investments provide access to: multi-family apartments, single-family homes, condominiums, and student housing.",
      "Residential real estate investing through tokenization allows for: fractional ownership of premium properties, diversified rental income, and exposure to housing market growth. Would you like to explore specific residential investment opportunities?",
      "Tokenized residential properties provide: regular rental income, potential appreciation, and lower entry barriers. Our platform offers various residential property types with different risk and return profiles."
    ]
  },
  {
    patterns: [
      "commercial", "office", "retail", "industrial", "warehouse"
    ],
    responses: [
      "Commercial properties include: office buildings, retail spaces, industrial facilities, and warehouses. Tokenized commercial real estate offers: higher potential returns, longer lease terms, and professional tenant relationships.",
      "Commercial real estate investing through tokenization provides: access to premium properties, diversified income streams, and professional property management. Would you like to explore specific commercial investment opportunities?",
      "Tokenized commercial properties offer: stable cash flows, potential appreciation, and portfolio diversification. Our platform features various commercial property types with different risk and return characteristics."
    ]
  },
  {
    patterns: [
      "specialty", "niche", "unique", "alternative"
    ],
    responses: [
      "Specialty real estate includes: medical facilities, data centers, self-storage, and hospitality properties. Tokenization makes these unique property types more accessible to investors seeking diversification.",
      "Niche property investments offer: unique risk-return profiles, specialized tenant bases, and potential for higher returns. Our platform provides access to carefully selected specialty properties.",
      "Alternative real estate investments through tokenization include: senior housing, student housing, medical offices, and specialized industrial facilities. Would you like to explore these unique investment opportunities?"
    ]
  },

  // Technical Aspects
  {
    patterns: [
      "platform", "technology", "system", "how it works"
    ],
    responses: [
      "Our platform combines: blockchain technology, smart contracts, and traditional real estate expertise to create a seamless investment experience. Features include: secure token issuance, automated compliance, transparent transactions, and professional property management.",
      "The technology behind our platform ensures: secure transactions, transparent ownership records, automated processes, and regulatory compliance. Would you like to learn more about any specific technical aspect?",
      "Our system integrates: property management, token issuance, investor relations, and compliance monitoring into a single, user-friendly platform. This creates an efficient and secure investment environment."
    ]
  },
  {
    patterns: [
      "security", "safety", "protection", "fraud"
    ],
    responses: [
      "Security measures on our platform include: blockchain-based ownership records, multi-factor authentication, encrypted transactions, regular security audits, and insurance coverage. We prioritize the safety of your investments.",
      "Investor protection is our top priority. We implement: thorough due diligence, regular property valuations, professional management, insurance coverage, and transparent reporting to ensure investment safety.",
      "Our platform combats fraud through: blockchain transparency, smart contract automation, regulatory compliance, and professional oversight. Would you like to know more about our security measures?"
    ]
  },

  // Legal and Regulatory
  {
    patterns: [
      "legal", "regulation", "compliance", "law", "rules"
    ],
    responses: [
      "Tokenized real estate operates within: securities regulations, property laws, and blockchain compliance requirements. Our platform ensures full regulatory compliance through: legal structuring, KYC/AML procedures, and transparent reporting.",
      "Legal considerations for tokenized real estate include: securities laws, property rights, investor protections, and regulatory compliance. We work with legal experts to ensure all investments meet regulatory requirements.",
      "Our platform maintains compliance with: securities regulations, property laws, anti-money laundering rules, and investor protection requirements. Would you like to know more about specific regulatory aspects?"
    ]
  },
  {
    patterns: [
      "kyc", "aml", "verification", "identity"
    ],
    responses: [
      "KYC (Know Your Customer) and AML (Anti-Money Laundering) procedures are essential for: regulatory compliance, investor protection, and platform security. Our verification process is secure and efficient.",
      "Identity verification on our platform involves: document verification, background checks, and compliance monitoring. This ensures a secure and compliant investment environment for all users.",
      "Our verification process includes: identity verification, source of funds verification, and ongoing compliance monitoring. This helps maintain platform integrity and regulatory compliance."
    ]
  },

  // Exit Strategies
  {
    patterns: [
      "exit", "sell", "withdraw", "liquidity", "secondary market"
    ],
    responses: [
      "One of the key advantages of tokenized real estate is increased liquidity. You can typically sell your tokens on our secondary market, though liquidity may vary based on market conditions and property type.",
      "Exiting a tokenized real estate investment is more flexible than traditional real estate. You can sell your tokens on our platform's secondary market, usually with lower transaction costs and faster processing times.",
      "Our platform provides a secondary market for token trading, offering more liquidity than traditional real estate. However, it's important to consider market conditions and potential holding periods when planning your exit strategy."
    ]
  },
  {
    patterns: [
      "holding period", "timeline", "long term", "short term"
    ],
    responses: [
      "Holding periods for tokenized real estate investments vary by: property type, market conditions, investment strategy, and individual goals. Our platform provides historical performance data to help you plan your investment timeline.",
      "Investment timelines should consider: property type, market cycle, investment strategy, and personal financial goals. Tokenization allows for more flexible holding periods compared to traditional real estate.",
      "Whether you're planning for short-term or long-term investments, tokenized real estate offers: flexible exit options, transparent pricing, and efficient transaction processes. Would you like to explore specific holding period strategies?"
    ]
  }
];

export const contextResponses = {
  followUpQuestions: [
    "Would you like more details about this aspect?",
    "Is there a specific area you'd like to explore further?",
    "Would you like to see some examples or case studies?",
    "How can I help you better understand this topic?",
    "Would you like to explore specific investment opportunities?",
    "Would you like to compare different investment options?",
    "Would you like to see performance data for similar properties?",
    "Would you like to explore risk management strategies?",
    "Would you like to learn more about market trends in this area?",
    "Would you like to understand the technical aspects in more detail?"
  ],
  clarificationRequests: [
    "I want to make sure I understand your question correctly. Could you provide more details?",
    "Could you specify which aspect you're most interested in?",
    "To give you the most relevant information, could you clarify your question?",
    "Would you like information about a specific property type or investment strategy?",
    "Could you tell me more about your investment goals?",
    "Are you interested in a particular geographic market?",
    "Would you like to focus on a specific property type?",
    "Could you specify your investment timeline?",
    "Are you more interested in income or appreciation potential?",
    "Would you like to discuss specific risk factors?"
  ],
  errorResponses: [
    "I want to provide you with the most accurate information. Could you rephrase your question?",
    "I'm not sure I understand. Could you ask about a specific aspect of real estate investing?",
    "To better assist you, could you provide more context about your question?",
    "I'd like to help you better. Could you specify what you'd like to know about real estate investing?",
    "Could you rephrase your question to help me provide more relevant information?",
    "I want to ensure I give you the most helpful response. Could you clarify your question?",
    "To provide the best guidance, could you specify your area of interest?",
    "I'd like to help you with your real estate investment questions. Could you provide more details?",
    "Could you ask about a specific aspect of real estate investing or tokenization?",
    "I want to give you the most relevant information. Could you specify your question?"
  ]
}; 