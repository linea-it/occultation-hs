import React, { useState } from "react";
import './confirm-modal.css';
import DOMPurify from 'dompurify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';


export default function ConfirmModal(props) {

  const [show, setShow] = useState(true);
  const [title, setTitle] = useState(props.title);
  const [text, setText] = useState(props.text);
  const [btnYes, setBtnYes] = useState(props.yes);

  

  function handleClose() {
    setShow(!show);    
    props.cancel();
  }

  function handleYes() {
    props.confirm();
    handleClose();
  }

  return (
    <>
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {text}
        </Modal.Body>
        <Modal.Footer>
                <Button variant="primary" onClick={handleYes}>
                    <i className="bi bi-check-lg"></i> {btnYes}
                </Button>
            <Button variant="secondary" onClick={handleClose}>
                <i className="bi bi-x"></i> Cancel
            </Button>
        </Modal.Footer>
    </Modal>

    </>
    );
}