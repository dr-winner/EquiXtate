# EquiXtate

EquiXtate is a Real-World Asset (RWA) platform for real estate fractional ownership. It leverages blockchain technology to tokenize real estate properties, allowing investors to purchase fractional ownership tokens and participate in property governance.

## Project Overview

This project is structured as a modern web application built with React, TypeScript, and Vite. It integrates with blockchain technology to manage property tokens, rental income distribution, and governance features. The platform provides a seamless experience for users to explore, invest in, and manage their real estate investments.

### Key Features

- **Property Tokenization**: Properties are tokenized into fractional ownership tokens, allowing investors to purchase shares of real estate assets.
- **Marketplace**: A marketplace where users can browse, filter, and invest in various properties.
- **User Dashboard**: A personalized dashboard for users to manage their investments, view transaction history, and participate in governance.
- **Governance**: Token holders can participate in governance decisions affecting the properties they own.
- **AI Investment Advisor**: An AI-powered advisor to provide insights and recommendations on real estate investments.
- **Admin Panel**: An administrative interface for managing properties, user verifications, and platform settings.

## Project Structure

- **src/**: Contains the main source code of the application.
  - **components/**: Reusable UI components.
  - **pages/**: Main pages of the application.
  - **services/**: Backend services and API integrations.
  - **contracts/**: Smart contracts for property tokenization and governance.
  - **data/**: Mock data and utilities for development.
  - **hooks/**: Custom React hooks for state management and logic.
  - **utils/**: Utility functions and helpers.
  - **types/**: TypeScript type definitions.
  - **contexts/**: React context providers for global state management.

## KRNL Labs

Real world asset tonization requires off-chain data and also integrating with governmental systems to make transacting real world assets possible. EquiXtate faced issues concerning how to get external asset data, and how to inteoperate with other chains that has the same asset.
The barrier was always the limitation Ethereum introduced.
Our Kernel calls our smart contract property in other EVM compatible chains using kernel to grab properties listed on our platform. This allows for shared property details across chain, making it possible for our systems to make decisions on data available on our main smart contract.

Our future plans on using kernel is bridging external or governmental systems unto our platform to verify, assert and attest for assets on our platform.

**KERNEL ID**: 1529

**SMART CONTRACT ID**: 7709

We encountered a few issues and will like to talk to the team about some encounters with the kernel platform.
Our feedback and commits will be sent to the telegram channel.

## Getting Started

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd equixtate
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Development Server**:

   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Smart Contract**: src/contracts - (we used Remix for deploying)
- **Blockchain**: Ethereum, Solidity, ethers.js
- **UI Components**: Radix UI, Framer Motion
- **State Management**: Zustand, React Context
- **API Integration**: Web3Service for blockchain interactions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
