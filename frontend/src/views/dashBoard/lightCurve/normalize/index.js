/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Button, Card, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import PageLoader from '../../../../component/page-loader';
import LightCurveService from '../../../../services/lightCurveService';
import { toast } from 'react-toastify';

export default function NormalizeModal(props) {

  const lightCurveService = new LightCurveService();

  const [loader, showLoader, hideLoader] = PageLoader();

  const [polyDeg, setPolyDeg] = useState(props.item.polyDeg || 1);
  const [minMask, setMinMask] = useState(props.item.initialTime || undefined);
  const [maxMask, setMaxMask] = useState(props.item.endTime || undefined);
  const [fluxMin, setFluxMin] = useState(props.item.fluxMin || 0);
  const [fluxMax, setFluxMax] = useState(props.item.fluxMax || 1);
  const [showFlux, setShowFlux] = useState(fluxMin !== 0 || fluxMax !== 1);
  const [errorMinMask, setErrorMinMask] = useState(false);
  const [errorMaxMask, setErrorMaxMask] = useState(false);

  function validate() {
    let valid = true;
    setErrorMinMask(false);
    setErrorMaxMask(false);
    if (!minMask) {
      valid = false
      setErrorMinMask(true);
    }
    if (!maxMask) {
      valid = false;
      setErrorMaxMask(true);
    }
    return valid;
  }

  function normalize() {
    if (validate()) {
      showLoader();
      let data = {
        poly_deg: parseInt(polyDeg),
        mask_min: parseFloat(minMask),
        mask_max: parseFloat(maxMask),
        flux_min: showFlux ? parseFloat(fluxMin) : undefined,
        flux_max: showFlux ? parseFloat(fluxMax) : undefined
      }
      lightCurveService.normalize(props.item, data)
        .then(resp => {
          toast.success("The normalize job was sucessfully created");
          props.save();
          props.close();
        })
        .finally(() => hideLoader())
    }
  }


  function handleShowFlux(value) {
    setShowFlux(value);
  };

  function handleClose() {
    props.close();
  }

  return (
    <>
      <Modal show={true} onHide={handleClose} size="lg" backdrop={'static'} keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Normalize {props.item.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className='row'>
            <div className='col-12 mb-2'>
              <label className="form-label">Degree of the polynomial</label>
              <input className="form-control" type="number" value={polyDeg} min="0" max="10" onChange={(e) => setPolyDeg(e.target.value)} />
            </div>
            <div className='col-12 mb-2'>
            <span className="mb-3">Mask Interval </span>
            <OverlayTrigger placement="top" overlay={<Tooltip>Select occultation interval to be removed from fit</Tooltip>}>
              <i className="bi bi-question-circle"></i>
            </OverlayTrigger>
            <Card className="mt-2">
                <Card.Body>
                  <div className='row'>
                  <div className='col-xs-12 col-md-6 mb-2'>
                    <label className="form-label">Start<span className='require'>*</span></label>
                    <input className="form-control" type="number" value={minMask} onChange={(e) => setMinMask(e.target.value)} />
                    {errorMinMask && <span className="error">Required field</span>}
                  </div>
                  <div className='col-xs-12 col-md-6 mb-2'>
                    <label className="form-label">End<span className='require'>*</span></label>
                    <input className="form-control" type="number" value={maxMask} onChange={(e) => setMaxMask(e.target.value)} />
                    {errorMaxMask && <span className="error">Required field</span>}
                  </div>
                  </div>
                </Card.Body>
            </Card>
            </div>
            <div className='col-12 my-2'>
              <Form.Check 
                type="switch"
                label="Flux Scale"
                checked={showFlux} onChange={e => handleShowFlux(e.target.checked)}
              />
            </div>
            {showFlux && <>
              <div className='col-xs-12 col-md-6 mb-2'>
                <label className="form-label">Flux Min</label>
                <input className="form-control" type="number" value={fluxMin} onChange={(e) => setFluxMin(e.target.value)} />
              </div>
              <div className='col-xs-12 col-md-6 mb-2'>
                <label className="form-label">Flux Max</label>
                <input className="form-control" type="number" value={fluxMax} onChange={(e) => setFluxMax(e.target.value)} />
              </div>
            </>
            }
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={normalize}>
            <i className="bi bi-arrow-clockwise"></i> Normalize
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            <i className="bi bi-x"></i> Close
          </Button>
        </Modal.Footer>
      </Modal>
      {loader}
    </>
  );
}