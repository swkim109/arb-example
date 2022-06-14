const hre = require("hardhat");

async function main() {

    const SimpleStorageL1 = await hre.ethers.getContractFactory("SimpleStorageL1");
    const s1 = await SimpleStorageL1.deploy();

    console.log("SimpleStorageL1 deployed to:", s1.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
