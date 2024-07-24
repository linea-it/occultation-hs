/* eslint-disable no-unused-vars */

import PageLoader from '../../../component/page-loader';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import './observer.css';

export default function ObserverPage(props) {
  const [loader, showLoader, hideLoader] = PageLoader();
  const [observer, setObserver] = useState();

  useEffect(() => {
    setObserver(props.item);
  }, [props.item]);

  return (
    <>
        <Row>
            <Card className="fillRow">
                <Card.Body>
                <Card.Title>Observer/Site {observer? observer.name: ""}</Card.Title>
                <Card.Text></Card.Text>
                <Card.Text>Latitude: {observer? observer.latitude: ""}</Card.Text>
                <Card.Text>Longitude: {observer? observer.longitude: ""}</Card.Text>
                <Card.Text>Altura: {observer? observer.altitude: ""}</Card.Text>
                </Card.Body>
            </Card>

        </Row>
    </>
  );
}