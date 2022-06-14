import React, {useEffect, useRef, useState} from 'react';
import {Container, Row, Col, InputGroup, FormControl, ButtonGroup, Button, Card, Overlay, Tooltip} from "react-bootstrap";
import "./css/bootstrap-4.5.3-dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { L2TransactionReceipt } from "@arbitrum/sdk";
import {useParams } from "react-router-dom";
import Loader from "react-loader-spinner";

import getWeb3, { getNetworkName, ProviderL2 } from "./getWeb3";
import SimpleStorage from "./contracts/SimpleStorageL2.json";

function DApp() {

    const layerNo = useParams().layerNo;

    const CONNECT_TEXT = "Connect";
    const CONNECTED_TEXT = "Connected";

    let SIMPLE_STORAGE_CONTRACT_ADDRESS = "";
    if (layerNo === "1") {
        SIMPLE_STORAGE_CONTRACT_ADDRESS = "0xA597EFe29052d817e48147fe769f7b169fB2dF4B";
    } else if (layerNo === "2") {
        SIMPLE_STORAGE_CONTRACT_ADDRESS = "0x78792b4903C5a55122a7a31c43d2226F78bF6df3";
    }

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const [network, setNetwork] = useState("");
    const [val, setVal] = useState(0);
    const [storedData, setStoredData] = useState("0");
    const [buttonText, setButtonText] = useState(CONNECT_TEXT);
    const [spinner, setSpinner] = useState(false);

    const [status, setStatus] = useState("");
    const [show, setShow] = useState(false);
    const target = useRef(null);

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

                const c = new ethers.Contract(SIMPLE_STORAGE_CONTRACT_ADDRESS, SimpleStorage.abi, s);
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


    const handleSend = () => {

        if (signer === null || contract === null) return;

        if (layerNo === "2") {

            contract.sendTxToL1()
                .then(async (tx) => {
                    const receipt = await tx.wait();
                    console.log(receipt.logs);
                    localStorage.setItem("L2TxHash", receipt.transactionHash);
                })
                .catch(error=>console.log(error));
        }
    }

    const checkStatus = async () => {

        const l2TxHash = localStorage.getItem("L2TxHash");
        console.log(l2TxHash);
        if (l2TxHash !== null && l2TxHash !== "") {
            setShow(!show);
            setStatus(".....");
            await handleStatus(l2TxHash, false);

        }
    }

    const handleClaim = async () => {
        const l2TxHash = localStorage.getItem("L2TxHash");
        if (l2TxHash !== null && l2TxHash !== "") {
            await handleStatus(l2TxHash, true);
        }
    }

    const handleStatus = async (txHash, claim) => {

        const receipt = await ProviderL2.getTransactionReceipt(txHash);
        const receiptL2 = new L2TransactionReceipt(receipt);

        const messages = await receiptL2.getL2ToL1Messages(signer, ProviderL2);
        const l2Tol1Message = messages[0];

        if (claim) {
            const tx = await l2Tol1Message.execute(ProviderL2);
            const receiptL1 = await tx.wait();
            console.log(receiptL1.transactionHash);

        } else {

            l2Tol1Message.status(ProviderL2)
                .then(s => setStatus(getStatus(s)))
                .catch((error) => console.log("Pending..."));
        }
    }

    const getStatus = (s) => {
        let status;
        switch (parseInt(s)) {
            case 1 : status = "Unconfirmed"; break;
            case 2 : status = "Confirmed"; break;
            case 3 : status = "Executed"; break;
            default: status = ".....";
        }
        return status;
    }

    return (

        <Container style={{marginTop:'20px'}} fluid>
            <Row>
                <Col>
                    <div style={{paddingBottom:'20px'}}>
                        Layer {layerNo}
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
                            {layerNo === "1"?
                                <Button href="#" variant="danger" onClick={checkStatus} ref={target}>
                                    Status
                                </Button>
                                :
                                <Button href="#" variant="danger" onClick={handleSend}>
                                    Send To L1
                                </Button>
                            }
                        </ButtonGroup>
                    </div>
                    <Overlay target={target.current} show={show} placement="right" transition={false}>
                        {(props) => (
                            <Tooltip id="status" {...props}>
                                {status}
                            </Tooltip>
                        )}
                    </Overlay>
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
            {status==="Confirmed"?
                <Row>
                    <Col>
                        <div style={{width: '640px'}}>
                            <Button href="#" variant="success" onClick={handleClaim}>
                                CLAIM
                            </Button>
                        </div>
                    </Col>
                </Row>
                :null}
        </Container>

    );
}

export default DApp;
