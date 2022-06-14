import React, {useEffect} from "react";
import {BrowserRouter, Routes, Route } from "react-router-dom";

import Main from "./Main";
import DApp from "./DApp";

function App() {

    useEffect(()=> {

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
        }

    }, [])

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            console.log(accounts[0]);
        } else {
            console.log("LOCK MetaMask");
        }
    }

    const handleChainChanged = (chainId) => {
        console.log(chainId);
        window.location.href = "/";
    }


    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main/>} />
                <Route path="/Dapp/:layerNo" element={<DApp/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
