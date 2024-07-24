/* eslint-disable no-unused-vars */

import { useEffect, useState } from 'react';
import { Button, Card, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import DateInput from '../../../../component/date-piker-input';
import PageLoader from '../../../../component/page-loader';
import LightCurveService from '../../../../services/lightCurveService';

export default function RegisterLightCurveModal(props) {
  const lightCurveService = new LightCurveService();

  const [loader, showLoader, hideLoader] = PageLoader();

  const [name, setName] = useState('');
  const [dataFile, setDataFile] = useState('');
  const [exposureTime, setExposureTime] = useState(0.1);
  const [timeColumnIndex, setTimeColumnIndex] = useState(1);
  const [fluxColumnIndex, setFluxColumnIndex] = useState(2);
  const [timeFormat, setTimeFormat] = useState('Julian');
  let todayUtc = new Date(new Date().toDateString());
  todayUtc.setMinutes(todayUtc.getMinutes() - todayUtc.getTimezoneOffset());
  const [referenceDate, setReferenceDate] = useState(todayUtc);
  const [fluxError, setFluxError] = useState(false);
  const [fluxErrorColumnIndex, setFluxErrorColumnIndex] = useState(-1);
  const [error, setError] = useState({});

  useEffect(() => {
    if (!fluxError) {
      setFluxErrorColumnIndex(-1);
    } else {
      setFluxErrorColumnIndex(3)
    }
  }, [fluxError]);

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function validate() {
    const err = {};
    if (!name) {
      err.name = 'Required field';
    } else if (props.lightCurveList.find(lc => lc.prediction_id === props.predictionId && lc.name === name)) {
      err.name = 'Light Curve name already exists';
    }
    if (!dataFile) {
      err.dataFile = 'Required field';
    }
    if (!exposureTime && exposureTime != 0) {
      err.exposureTime = 'Required field';
    } else if (exposureTime <= 0) {
      err.exposureTime = "Can't be zero neither negative";
    }
    if (!timeColumnIndex && timeColumnIndex != 0) {
      err.timeColumnIndex = 'Required field';
    } else if (timeColumnIndex <= 0) {
      err.timeColumnIndex = "Can't be zero neither negative";
    }
    if (!fluxColumnIndex && fluxColumnIndex != 0) {
      err.fluxColumnIndex = 'Required field';
    } else if (fluxColumnIndex <= 0) {
      err.fluxColumnIndex = "Can't be zero neither negative";
    }
    if (timeFormat === 'Seconds') {
      if (!referenceDate) {
        err.referenceDate = 'Required field';
      }
    }
    if (fluxError) {
      if (!fluxErrorColumnIndex && fluxErrorColumnIndex != 0) {
        err.fluxErrorColumnIndex = 'Required field';
      } else if (fluxErrorColumnIndex <= 0) {
        err.fluxErrorColumnIndex = "Can't be zero neither negative";
      }
    }
    setError(err);
    return Object.entries(err).length === 0;
  }

  function handleYes() {
    if (validate()) {
      let curva = {
        predictionId: props.predictionId,
        name: name,
        dataFile: dataFile,
        exposureTime: exposureTime,
        timeColumnIndex: timeColumnIndex - 1,
        fluxColumnIndex: fluxColumnIndex - 1,
        fluxErrorColumnIndex: fluxErrorColumnIndex - 1,
        timeFormat: timeFormat,
        referenceDate: timeFormat === 'Seconds' ? referenceDate : null,
      }
      lightCurveService.insertLightCurve(curva).then(result => {
        toast.success("Light Curve was inserted successfully!");
        close(true);
      }).catch(() => close(false));
    }
  }

  function close(result) {
    if (props.close) {
      props.close(result);
    }
  }

  function handleFileInputChange(e) {
    let file = e.target.files[0];
    if (file) {
      showLoader();
      getBase64(file)
        .then(result => {
          setDataFile(result);
          hideLoader();
        })
        .catch(err => {
          hideLoader();
          console.error(err);
          toast.error('Invalid file.');
        });
    }
  };

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      let baseURL = "";
      let reader = new FileReader();
      reader.onload = () => {
        baseURL = reader.result.substr(reader.result.indexOf(',') + 1);
        resolve(baseURL);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };


  return (
    <>
      <Modal show={true} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Include New Light Curve</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">Light curve name <span className='require'>*</span></label>
              <input className="form-control" type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              {error.name && <span className="error">{error.name}</span>}
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">
                Data File <span className='require'>*</span>
                <OverlayTrigger placement="top" overlay={<Tooltip>Data extension must be .dat</Tooltip>}>
                  <i className="bi bi-question-circle mx-2"></i>
                </OverlayTrigger>
              </label>
              <input className="form-control" type="file" accept='.dat' name="file" onChange={(e) => handleFileInputChange(e)} />
              {error.dataFile && <span className="error">{error.dataFile}</span>}
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">Exposure time (s) <span className='require'>*</span></label>
              <input className="form-control" type="number" name="expTime" value={display(exposureTime)} onChange={(e) => setExposureTime(parseFloat(e.target.value))} />
              {error.exposureTime && <span className="error">{error.exposureTime}</span>}
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12 col-md-6 mb-2'>
              <label className="form-label">Time Column <span className='require'>*</span></label>
              <input className="form-control" type="number" value={display(timeColumnIndex)} onChange={(e) => setTimeColumnIndex(parseInt(e.target.value))} />
              {error.timeColumnIndex && <span className="error">{error.timeColumnIndex}</span>}
            </div>
            <div className='col-12 col-md-6 mb-2'>
              <label className="form-label">Flux Column <span className='require'>*</span></label>
              <input className="form-control" type="number" value={display(fluxColumnIndex)} onChange={(e) => setFluxColumnIndex(parseInt(e.target.value))} />
              {error.fluxColumnIndex && <span className="error">{error.fluxColumnIndex}</span>}
            </div>
          </div>
          <div className='row'>
            <div className='col-12'>
              <span className="mb-3">Time Format</span>
              <Card className="mt-2">
                <Card.Body>
                  <div className='row'>
                    <div className='col-xs-12 col-md-6'>
                      <Form.Check
                        id="rJulian"
                        type="radio"
                        label="Julian Date"
                        value="Julian"
                        checked={timeFormat === "Julian"} onChange={(e) => setTimeFormat(e.target.value)}
                      />
                      <Form.Check
                        id="rSeconds"
                        type="radio"
                        label="Seconds"
                        value="Seconds"
                        checked={timeFormat === "Seconds"} onChange={(e) => setTimeFormat(e.target.value)}
                      />
                    </div>
                    {timeFormat === 'Seconds' && <div className='col-xs-12 col-md-6'>
                      <label className="form-label">
                        Reference Date <span className='require'>*</span>
                        <OverlayTrigger placement="top" overlay={<Tooltip>UTC date and time</Tooltip>}>
                          <i className="bi bi-question-circle mx-2"></i>
                        </OverlayTrigger>
                      </label>
                      <DateInput
                        className="form-control"
                        value={referenceDate}
                        onChange={(e) => setReferenceDate(e)}
                        id="referenceDate"
                        name="referenceDate"
                        type="date"
                      />
                      {error.referenceDate && <span className="error">{error.referenceDate}</span>}
                    </div>}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
          <div className='row'>
            <div className='col-12 col-md-6'>
              <div className="form-check mt-5">
                <input className="form-check-input" type="checkbox" checked={fluxError} onChange={(e) => setFluxError(e.target.checked)} />
                <label className="form-check-label">
                  Flux-Error
                </label>
              </div>
            </div>
            {fluxError && <div className='col-xs-12 col-md-6 mb-2 mt-2'>
              <label className="form-label">Flux-Error Column <span className='require'>*</span></label>
              <input className="form-control" type="number" value={display(fluxErrorColumnIndex)} onChange={(e) => setFluxErrorColumnIndex(parseInt(e.target.value))} />
              {error.fluxErrorColumnIndex && <span className="error">{error.fluxErrorColumnIndex}</span>}
            </div>}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleYes}>
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