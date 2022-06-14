import React from 'react';
import {Container, Row, Col} from "react-bootstrap";
import "./css/bootstrap-4.5.3-dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

function Main() {

    return (
        
        <Container style={{marginTop:'50px', width: "640px"}} fluid>
            <Row>
                <Col>
                    <div style={{fontSize: "24px"}}>
                        <Link to="/Dapp/1">Rinkeby App</Link>
                    </div>
                </Col>
                <Col>
                    <div style={{fontSize: "24px"}}>
                        ArbRinkeby App
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Main;
