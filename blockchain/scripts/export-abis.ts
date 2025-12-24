import { promises as fs } from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.resolve(__dirname, '..', 'artifacts');
const OUTPUT_DIR = path.resolve(__dirname, '..', '..', 'src', 'services', 'web3', 'abi');

const CONTRACTS: { file: string; name: string }[] = [
  { file: 'KYCRegistry.sol', name: 'KYCRegistry' },
  { file: 'PropertyOracle.sol', name: 'PropertyOracle' },
  { file: 'PropertyTokenERC1155.sol', name: 'PropertyTokenERC1155' },
  { file: 'AuctionHouse.sol', name: 'AuctionHouse' },
  { file: 'RentalManager.sol', name: 'RentalManager' },
  { file: 'PropertyFactory.sol', name: 'PropertyFactory' },
];

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const c of CONTRACTS) {
    const p = path.join(
      ARTIFACTS_DIR,
      'contracts',
      c.file,
      `${c.name}.json`
    );
    try {
      const raw = await fs.readFile(p, 'utf-8');
      const json = JSON.parse(raw);
      const abi = json.abi;
      const outPath = path.join(OUTPUT_DIR, `${c.name}.json`);
      await fs.writeFile(outPath, JSON.stringify(abi, null, 2));
      console.log('Exported ABI:', outPath);
    } catch (err) {
      console.warn(`Skip ${c.name}:`, (err as Error).message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
