import React, {useEffect, useState} from 'react';
import {Container, Row, Col, InputGroup, FormControl, ButtonGroup, Button, Card} from "react-bootstrap";
import "./css/bootstrap-4.5.3-dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import Loader from "react-loader-spinner";

// @arbitrum/sdk 2.0
import {L1ToL2MessageGasEstimator} from "@arbitrum/sdk";

import getWeb3, { getNetworkName, ProviderL1, ProviderL2 } from "./getWeb3";
import SimpleStorage from "./contracts/SimpleStorageL1.json";

function DApp() {

    const CONNECT_TEXT = "Connect";
    const CONNECTED_TEXT = "Connected";

    const SIMPLE_STORAGE_CONTRACT_ADDRESS_L1 = "0x456498F4882797649e764F9DecDc1F8e83e6D859";
    const SIMPLE_STORAGE_CONTRACT_ADDRESS_L2 = "0x120AFe9dE982f4bD441e5A97AdCAD1c933D91Fe1";

    const REFUND_ADDRESS = "Your refund address";

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const [network, setNetwork] = useState("");
    const [val, setVal] = useState(0);
    const [storedData, setStoredData] = useState("0");
    const [buttonText, setButtonText] = useState(CONNECT_TEXT);
    const [spinner, setSpinner] = useState(false);

    useEffect(() => {
        const getAccount = async (p) => {
            return (await p.getSigner(0));
        }

        if (provider !== null) {

            provider.getNetwork().then(v=>{
                setNetwork(getNetworkName(v.chainId));
            });

            getAccount(provider).then((s) => {
                setSigner(s);
                setButtonText(CONNECTED_TEXT);

                const c = new ethers.Contract(SIMPLE_STORAGE_CONTRACT_ADDRESS_L1, SimpleStorage.abi, s);
                setContract(c);
            })
        }
    }, [provider]);

    useEffect(()=> {
        if (contract) {
            contract.on("Change", handleEvent);
        }
    }, [contract])

    const handleEvent = (msg, val) => {
        setStoredData(val.toNumber());
        setSpinner(false);
    }


    const handleConnect = async () => {
        const provider = await getWeb3();
        if (provider) setProvider(provider);
    }

    const handleSet = async () => {
        if (signer === null || contract === null) return;

        if (val > 0) {

            contract.set(val)
                .then(async (tx) => {
                    setSpinner(true);
                    const receipt = await tx.wait();
                    console.log(receipt);
                })
                .catch(error=>console.log(error));
        }
    }

    const handleGet = async () => {
        if (signer === null || contract === null) return;
        const v = await contract.get();
        setStoredData(v.toString());
    }

    const handleChange = (e) => {
        if (e.target.value !== "") {
            setVal(parseInt(e.target.value));
        }
    }


    const handleSend = async () => {

        if (signer === null || contract === null) return;

        const l1ToL2MessageGasEstimate = new L1ToL2MessageGasEstimator(ProviderL2);
        const iface = new ethers.utils.Interface(SimpleStorage.abi);
        const calldata = iface.encodeFunctionData("set", [parseInt(storedData)]);

        const maxSubmissionCost = await l1ToL2MessageGasEstimate.estimateSubmissionFee(
            ProviderL1,
            await ProviderL1.getGasPrice(),
            ethers.utils.hexDataLength(calldata) // bytes
        );

        const gasPrice = await ProviderL2.getGasPrice();
        const senderDeposit = ethers.utils.parseEther("0.1");

        const gasLimit = await l1ToL2MessageGasEstimate.estimateRetryableTicketGasLimit(
            SIMPLE_STORAGE_CONTRACT_ADDRESS_L1,
            SIMPLE_STORAGE_CONTRACT_ADDRESS_L2,
            ethers.utils.parseEther("0"),
            REFUND_ADDRESS,
            REFUND_ADDRESS,
            calldata,
            senderDeposit,
            maxSubmissionCost,
            ethers.BigNumber.from("0"),
            ethers.BigNumber.from("0")
        );

        let callValue = maxSubmissionCost.add(gasPrice.mul(gasLimit));
        callValue = callValue.mul(2);

        console.log(`CallValue=${callValue.toString()}`);
        console.log(`MaxSubmissionCost=${maxSubmissionCost.toString()}`);
        console.log(`gasLimit=${gasLimit.toString()}`);

        const tx = await contract.sendTxToL2(
            storedData,
            maxSubmissionCost,
            gasLimit.mul(2), // gas for redeem
            gasPrice,
            {
                value: callValue.toString()
            }
        )

        const receipt = await tx.wait();
        console.log(receipt.logs[2].topics);
    }



    return (

            <Container style={{marginTop:'20px'}} fluid>
                <Row>
                    <Col>
                        <div style={{paddingBottom:'20px'}}>
                            Layer 1
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div style={{width: '640px', paddingBottom:'10px'}}>
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text>Value</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl type="number" placeholder="Enter number" onChange={handleChange}/>
                            </InputGroup>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div style={{width: '640px', paddingBottom:'10px'}}>
                            <ButtonGroup style={{width: '100%'}}>
                                <Button href="#" variant="success" onClick={handleConnect}>
                                    {buttonText}
                                </Button>
                                <Button href="#" variant="primary" onClick={handleSet}>
                                    Set
                                </Button>
                                <Button href="#" variant="info" onClick={handleGet}>
                                    Get
                                </Button>
                                <Button href="#" variant="danger" onClick={handleSend}>
                                    Send To L2
                                </Button>
                            </ButtonGroup>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div style={{width: '640px', paddingBottom:'5px'}}>
                            <Card>
                                <Card.Body>
                                    <div style={{display:"inline-block", fontSize: "24px"}}>
                                        <b>{storedData}</b>
                                    </div>
                                    <div style={{display:"inline-block", float:"right"}}>
                                        {spinner?<Loader type="Bars" color="#CE62D4" height="32" width="32"/>:null}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div style={{width: '640px', paddingBottom:'5px'}}>
                            <Card>
                                <Card.Body>
                                    <Card.Text>
                                        <b>{network}</b>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>

    );
}

export default DApp;
