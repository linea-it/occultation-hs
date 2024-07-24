/* eslint-disable no-unused-vars */

import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PageLoader from '../../../component/page-loader';
import ChordService from '../../../services/chordService';

export default function EllipseResultsModal({ predictionId, value, onClose }) {
  const chordService = new ChordService();

  const [loader, showLoader, hideLoader] = PageLoader();
  const [result, setResult] = useState(value || '');

  useEffect(() => {
    showLoader();
    chordService.getEllipseResults(predictionId).then(response => {
      setResult(response);
      hideLoader();
    }).catch(err => {
      hideLoader();
      toast.error(err);
    });
  }, []);

  function download() {
    if (result) {
      downloadTextFile(result, 'ellipse.log');
    }
  }

  function close() {
    if (onClose) {
      onClose();
    }
  }

  function downloadTextFile(text, fileName) {
    const linkSource = `data:text/plain;charset=utf-8, ${encodeURIComponent(text)}`;
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = '_self';
    downloadLink.download = fileName;
    downloadLink.click();
  }

  return (
    <>
      <Modal show={true} backdrop={'static'} keyboard={false} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row'>
            <div className='col-12'>
              <label className="form-label">Ellipse Results</label>
              <textarea className="form-control resultView" disabled={true} value={result} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={download}>
            <i className="bi bi-download"></i> Download
          </Button>
          <Button variant="secondary" onClick={close}>
            <i className="bi bi-x"></i> Close
          </Button>
        </Modal.Footer>
      </Modal>
      {loader}
    </>
  );
}