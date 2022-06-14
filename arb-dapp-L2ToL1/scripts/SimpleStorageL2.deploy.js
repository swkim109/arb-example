const hre = require("hardhat");

async function main() {

    const SimpleStorageL1 = "0xA597EFe29052d817e48147fe769f7b169fB2dF4B";
    const SimpleStorageL2 = await hre.ethers.getContractFactory("SimpleStorageL2");
    const s2 = await SimpleStorageL2.deploy(SimpleStorageL1);

    console.log("SimpleStorageL2 deployed to:", s2.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
