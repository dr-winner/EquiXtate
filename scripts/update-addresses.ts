import fs from 'fs';
import path from 'path';

function updateContractAddresses() {
  try {
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
    
    // Read constants file
    const constantsPath = path.join(__dirname, '../src/services/web3/constants.ts');
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Update contract addresses
    constantsContent = constantsContent.replace(
      /export const CONTRACT_ADDRESSES = {[^}]*}/,
      `export const CONTRACT_ADDRESSES = {
  TOKEN: "${deploymentInfo.PropertyToken}",
  MARKETPLACE: "${deploymentInfo.Marketplace}",
  GOVERNANCE: "${deploymentInfo.Governance}",
  SONIC_TOKEN: "${deploymentInfo.SwapModule}"
};`
    );
    
    // Write updated constants file
    fs.writeFileSync(constantsPath, constantsContent);
    console.log("Contract addresses updated successfully!");
  } catch (error) {
    console.error("Error updating contract addresses:", error);
    process.exit(1);
  }
}

updateContractAddresses(); 