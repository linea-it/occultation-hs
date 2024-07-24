/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Button, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LightCurveService from '../../../../services/lightCurveService';
import { toast } from 'react-toastify';

export default function FitLigthCurveModal(props) {

  const lightCurveService = new LightCurveService();

  const [initialTime, setInitialTime] = useState(props.item.initialTime);
  const [endTime, setEndTime] = useState(props.item.endTime);
  const [fluxMin, setFluxMin] = useState(props.item.fluxMin || 0);
  const [fluxMax, setFluxMax] = useState(props.item.fluxMax || 1);
  const [immersionTime, setImmersionTime] = useState(props.item.immersionTime);
  const [emersionTime, setEmersionTime] = useState(props.item.emersionTime);
  const [opacity, setOpacity] = useState(props.item.opacity || 1);
  const [dopacity, setDopacity] = useState(props.item.dopacity || 0);
  const [deltaT, setDeltaT] = useState(props.item.deltaT || 5 * props.item.exposureTime);
  const [sigma, setSigma] = useState(props.item.sigma);
  const [sigmaType, setSigmaType] = useState(defineSigmaType);
  const [loop, setLoop] = useState(props.item.loop || 2000);
  const [sigmaResult, setSigmaResult] = useState(props.item.sigmaResult || 1);
  const [startedFit, setStartedFit] = useState(false);
  const [error, setError] = useState({});


  function displayValue(value) {
    return value || value === 0 ? value : ''
  }

  function defineSigmaType() {
    const sigma = props.item.sigma;
    if (!sigma) {
      return 'error';
    } else if (sigma === 'auto') {
      return 'auto';
    } else {
      return 'manual';
    }
  }

  function onSigmaTypeChange(value) {
    setSigmaType(value);
    switch (value) {
      case 'auto':
        setSigma('auto');
        break;
      default:
        setSigma(undefined);
        break;
    }
  }

  function validate() {
    const err = {};
    if (sigmaType === 'manual' && !sigma) {
      err.sigma = 'Required field';
    }
    if (opacity < 0 || opacity > 1) {
      err.opacity = 'Must be between 0 and 1';
    }
    if (dopacity < 0 || dopacity > 1) {
      err.dopacity = 'Must be between 0 and 1';
    }
    if (sigmaResult < 0 || sigmaResult === 0) {
      err.sigmaResult = "Can't be zero neither negative";
    }
    setError(err);
    return Object.entries(err).length === 0;
  }

  function validateNegative() {
    const err = {};
    if (!initialTime) {
      err.initialTime = 'Required field';
    }
    if (!endTime) {
      err.endTime = 'Required field';
    }
    setError(err);
    return Object.entries(err).length === 0;
  }

  function fit() {
    if (validate()) {
      setStartedFit(true);
      let lc = {
        id: props.item.id,
        ...{
          initialTime, endTime,
          immersionTime, emersionTime,
          fluxMin, fluxMax,
          opacity, dopacity,
          deltaT,
          sigma,
          loop,
          sigmaResult
        }
      }
      lightCurveService.ligthCurveFit(lc).then(() => {
        toast.success("The fit job was sucessfully created");
        props.consolidaJob(lc.id);
        props.close();
      });
    }
  }

  function negate() {
    if (validateNegative()) {
      lightCurveService.negate(props.item).then(()=>{
        toast.success("This light curve is now negative");
        props.consolidaJob(props.item.id);
        props.close();
      })
    }
  }

  function handleClose() {
    props.close();
  }

  return (
    <>
      <Modal show={true} onHide={handleClose} size="lg" backdrop={'static'} keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Light Curve Fit</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className='row'>
            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">
                Initial Time
                <OverlayTrigger placement="top" overlay={<Tooltip>Required for negative detections</Tooltip>}>
                  <i className="bi bi-question-circle mx-1"></i>
                </OverlayTrigger>
              </label>
              <input className="form-control" type="number" value={displayValue(initialTime)} onChange={(e) => setInitialTime(parseFloat(e.target.value))} />
              {error.initialTime && <span className="error">{error.initialTime}</span>}
            </div>

            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">
                End Time
                <OverlayTrigger placement="top" overlay={<Tooltip>Required for negative detections</Tooltip>}>
                  <i className="bi bi-question-circle mx-1"></i>
                </OverlayTrigger>
              </label>
              <input className="form-control" type="number" value={displayValue(endTime)} onChange={(e) => setEndTime(parseFloat(e.target.value))} />
              {error.endTime && <span className="error">{error.endTime}</span>}
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Immersion Time</label>
              <input className="form-control" type="number" value={displayValue(immersionTime)} onChange={(e) => setImmersionTime(parseFloat(e.target.value))} />
            </div>

            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Emersion Time</label>
              <input className="form-control" type="number" value={displayValue(emersionTime)} onChange={(e) => setEmersionTime(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">Search Time Interval (s)</label>
              <input className="form-control" type="number" value={displayValue(deltaT)} onChange={(e) => setDeltaT(parseFloat(e.target.value))} />
            </div>
          </div>

          <hr></hr>

          <div className='row'>
            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Flux min</label>
              <input className="form-control" type="number" value={displayValue(fluxMin)} onChange={(e) => setFluxMin(parseFloat(e.target.value))} />
            </div>

            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Flux max</label>
              <input className="form-control" type="number" value={displayValue(fluxMax)} onChange={(e) => setFluxMax(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Flux Uncertainty</label>
              <Form.Select className='form-control' value={sigmaType} onChange={(e) => onSigmaTypeChange(e.target.value)}>
                <option value="error">Curve Error</option>
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </Form.Select>
            </div>

            {sigmaType === 'manual' && <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Value<span className='require'>*</span></label>
              <input className="form-control" type="number" value={displayValue(sigma)} onChange={(e) => setSigma(parseFloat(e.target.value))} />
              {error.sigma && <span className="error">{error.sigma}</span>}
            </div>}
          </div>

          <hr></hr>

          <div className='row'>
            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">
                Opacity
                <OverlayTrigger placement="top" overlay={<Tooltip>Use 0 for transparent and 1 for opaque object</Tooltip>}>
                  <i className="bi bi-question-circle mx-2"></i>
                </OverlayTrigger>
              </label>
              <input className="form-control" type="number" value={displayValue(opacity)} onChange={(e) => setOpacity(parseFloat(e.target.value))} />
              {error.opacity && <span className="error">{error.opacity}</span>}
            </div>

            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">&Delta; Opacity</label>
              <input className="form-control" type="number" value={displayValue(dopacity)} onChange={(e) => setDopacity(parseFloat(e.target.value))} />
              {error.dopacity && <span className="error">{error.dopacity}</span>}
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">
                Loop
                <OverlayTrigger placement="top" overlay={<Tooltip>Number of loops to fit parameters</Tooltip>}>
                  <i className="bi bi-question-circle mx-2"></i>
                </OverlayTrigger>
              </label>
              <input className="form-control" type="number" value={displayValue(loop)} onChange={(e) => setLoop(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">&sigma; Result</label>
              <input className="form-control" type="number" value={displayValue(sigmaResult)} onChange={(e) => setSigmaResult(parseFloat(e.target.value))} />
              {error.sigmaResult && <span className="error">{error.sigmaResult}</span>}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={startedFit} variant="primary" onClick={fit}>
            <i className="bi bi-arrow-clockwise"></i> Start Fit
          </Button>
          <Button variant="primary" onClick={negate}>
            <i className="bi bi-arrow-clockwise"></i> Set as Negative
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            <i className="bi bi-x"></i> Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}