import {ethers} from "ethers";
import { ALCHEMY_RINKEBY, ALCHEMY_ARBRINKEBY} from "./keys";

const getWeb3 = async () => {

    let result = null;

    if (window.ethereum) {

        let provider = new ethers.providers.Web3Provider(window.ethereum);

        // if ((await provider.getNetwork()).chainId !== 421611) {
        //
        //     await provider.send("wallet_addEthereumChain", [
        //         {chainId: '0x66EEB',
        //             chainName: 'ArbRinkeby',
        //             nativeCurrency: {name: 'ETH', symbol: 'ETH', decimals: 18},
        //             rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
        //             blockExplorerUrls: ['https://rinkeby-explorer.arbitrum.io/#/']}
        //     ]);
        // }

        await provider.send("eth_requestAccounts", []);
        result = provider;

    } else {
        console.log("Can't find window.ethereum");
    }

    return result;
}

const getNetworkName = (chainId) => {

    let networkName;
    switch (parseInt(chainId)) {
        case 1:
            networkName = "Mainnet";
            break;
        case 4:
            networkName = "Rinkeby";
            break;
        case 421611 :
            networkName = "ArbRinkeby";
            break;
        default:
            networkName = "No Network";
    }
    return networkName;
}

const ProviderL1 = new ethers.providers.JsonRpcProvider(`https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_RINKEBY}`);
const ProviderL2 = new ethers.providers.JsonRpcProvider(`https://arb-rinkeby.g.alchemy.com/v2/${ALCHEMY_ARBRINKEBY}`);

export {
    getNetworkName,
    ProviderL1,
    ProviderL2
}

export default getWeb3;
