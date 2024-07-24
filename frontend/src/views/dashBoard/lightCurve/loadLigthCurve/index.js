/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Button, Form, Modal, Accordion } from 'react-bootstrap';
import PageLoader from '../../../../component/page-loader';
import LightCurveService from '../../../../services/lightCurveService';

export default function LoadLigthCurveModal(props) {

  const lightCurveService = new LightCurveService();

  const [loader, showLoader, hideLoader] = PageLoader();

  const [tmin, setTmin] = useState(props.item.initialTime);
  const [tmax, setTmax] = useState(props.item.endTime);
  const [immersionTime, setImmersionTime] = useState(props.item.immersionTime);
  const [emersionTime, setEmersionTime] = useState(props.item.emersionTime);
  const [graficalFlux, setGraficalFlux] = useState(props.item.graficalFlux);
  const [rankSelected, setRankSelected] = useState(undefined);
  const [detection, setDetection] = useState(undefined);
  const [params, setParams] = useState({
    maxDuration: props.item.maxDuration,
    stepSize: props.item.stepSize,
    snrLimit: props.item.snrLimit,
    numDetections: props.item.numDetections
  });
  const [openAdvanced] = useState((params.maxDuration || params.stepSize || params.snrLimit || params.numDetections) ? '0' : '1');
  const [canSave, setCanSave] = useState(false);
  const [error, setError] = useState({});

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function validate() {
    const err = {};
    for (let key of Object.keys(params)) {
      const val = params[key];
      if (val == 0 || val < 0) { // Por algum motivo obscuro null <= 0 é verdadeiro
        err[key] = "Can't be zero neither negative";
      }
    }
    setError(err);
    return Object.entries(err).length === 0;
  }

  function autodetect() {
    if (validate()) {
      showLoader();
      lightCurveService.detectSettings(props.item, params)
        .then(resp => {
          if (Array.isArray(resp.rank)) {
            setDetection({
              rank: resp.rank,
              initTime: resp.initial_time,
              endTime: resp.end_time,
              immersionTime: resp.immersion_time,
              emersionTime: resp.emersion_time
            });
          } else {
            setDetection(undefined);
            setTmin(resp.initial_time);
            setTmax(resp.end_time);
            setImmersionTime(resp.immersion_time);
            setEmersionTime(resp.emersion_time);
          }
          setCanSave(true);
          setGraficalFlux(resp.image);
        })
        .finally(() => hideLoader())
    }
  }

  function setParamValue(value) {
    setCanSave(false);
    setParams({
      ...params,
      ...value
    });
  }

  function close() {
    props.close();
  }

  function save() {
    let lc = {
      ...props.item,
      ...params,
      ...{
        initialTime: tmin,
        endTime: tmax,
        immersionTime: immersionTime,
        emersionTime: emersionTime,
        graficalFlux: graficalFlux
      }
    }
    props.save(lc);
  }

  function changeRank(rank) {
    const index = rank.selectedIndex
    setRankSelected(rank.value);
    setTmin(detection.initTime[index]);
    setTmax(detection.endTime[index]);
    setImmersionTime(detection.immersionTime[index]);
    setEmersionTime(detection.emersionTime[index]);
  }

  return (
    <>
      <Modal show={true} onHide={close} size="lg" backdrop={'static'} keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Auto Detect</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">

          <Accordion defaultActiveKey={openAdvanced}>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                Advanced Settings
              </Accordion.Header>
              <Accordion.Body>
                <div className='row'>
                  <div className='col-xs-12 col-sm-6 mb-2'>
                    <label className="form-label">Maximum Occ. Duration (s)</label>
                    <input className="form-control" type="number" value={display(params.maxDuration)}
                      onChange={(e) => setParamValue({ maxDuration: parseFloat(e.target.value) })} />
                    {error.maxDuration && <span className='error'>{error.maxDuration}</span>}
                  </div>

                  <div className='col-xs-12 col-sm-6 mb-2'>
                    <label className="form-label">Step size</label>
                    <input className="form-control" type="number" value={display(params.stepSize)}
                      onChange={(e) => setParamValue({ stepSize: parseFloat(e.target.value) })} />
                      {error.stepSize && <span className='error'>{error.stepSize}</span>}
                  </div>
                </div>

                <div className='row'>
                  <div className='col-xs-12 col-sm-6 mb-2'>
                    <label className="form-label">Minimum Light Curve SNR</label>
                    <input className="form-control" type="number" value={display(params.snrLimit)}
                      onChange={(e) => setParamValue({ snrLimit: parseFloat(e.target.value) })} />
                      {error.snrLimit && <span className='error'>{error.snrLimit}</span>}
                  </div>

                  <div className='col-xs-12 col-sm-6 mb-2'>
                    <label className="form-label">Number of detections</label>
                    <input className="form-control" type="number" value={display(params.numDetections)}
                      onChange={(e) => setParamValue({ numDetections: parseFloat(e.target.value) })} />
                      {error.numDetections && <span className='error'>{error.numDetections}</span>}
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <hr></hr>

          {detection && <div className='row'>
            <div className='col-12 mb-2'>
              <label className="form-label" htmlFor="tbxType">Select Occultation Rank</label>
              <Form.Select value={rankSelected} className="form-control" onChange={(e) => changeRank(e.target)}>
                {detection.rank.map((element, index) => <option key={index}>{element}</option>)}
              </Form.Select>
            </div>
          </div>}

          <div className='row'>
            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Initial Time</label>
              <input className="form-control" type="number" readOnly value={tmin ? tmin : ""} onChange={(e) => setTmin(parseFloat(e.target.value))} />
            </div>

            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">End Time</label>
              <input className="form-control" type="number" readOnly value={tmax ? tmax : ""} onChange={(e) => setTmax(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className='row'>
            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Immersion Time</label>
              <input className="form-control" type="number" readOnly value={immersionTime ? immersionTime : ""} onChange={(e) => setImmersionTime(parseFloat(e.target.value))} />
            </div>

            <div className='col-xs-12 col-sm-6 mb-2'>
              <label className="form-label">Emersion Time</label>
              <input className="form-control" type="number" readOnly value={emersionTime ? emersionTime : ""} onChange={(e) => setEmersionTime(parseFloat(e.target.value))} />
            </div>
          </div>

          <hr></hr>

          <div className='row'>
            <div className='col-12'>
              {graficalFlux && <img alt='' src={`data:image/jpeg;base64,${graficalFlux}`} style={{ width: '100%' }} />}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={autodetect}>
            <i className="bi bi-arrow-clockwise"></i> Detect
          </Button>
          <Button variant="success" disabled={!canSave} onClick={save}>
            <i className="bi bi-check-lg"></i> Save
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