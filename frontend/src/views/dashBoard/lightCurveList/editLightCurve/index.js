/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import PageLoader from '../../../../component/page-loader';
import LightCurveService from '../../../../services/lightCurveService';
import { toast } from 'react-toastify';

export default function EditLightCurveModal(props) {
  const lightCurveService = new LightCurveService();

  const [loader, showLoader, hideLoader] = PageLoader();

  const [nameOld, setNameOld] = useState(props.info.name);
  const [name, setName] = useState(props.info.name);
  const [errorName, setErrorName] = useState(false);

  const [velocity, setVelocity] = useState(props.info.velocity);
  const [errorVelocity, setErrorVelocity] = useState(false);

  const [distance, setDistance] = useState(props.info.distance);
  const [errorDistance, setErrorDistance] = useState(false);

  const [diameter, setDiameter] = useState(props.info.diameter);
  const [errorDiameter, setErrorDiameter] = useState(false);

  function close(result) {
    if (props.close) {
      props.close(result);
    }
  }

  function handleYes() {
    if (!verifyLightCurveExist()) {
      let curva = {
        ...props.info,
        ...{
          id: props.info.id,
          name: name,
          velocity: velocity,
          distance: distance,
          diameter: diameter,
        }
      };
      lightCurveService.editLightCurve(curva).then(response => {
        toast.success("Light Curve was successfully updated");
        close(curva);
      }).catch(() => close(false));
    }
  }

  function verifyLightCurveExist() {
    let exist = false;
    if (props.lightCurveList.find(lc => lc.prediction_id === props.info.prediction_id && lc.name === name)) {
      exist = true;
      toast.error('Light Curve name already exists. Please enter another name.');
    }
    return exist;
  }

  return (
    <>
      <Modal show={true} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Light Curve</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className='row'>
            <div className='col-12  mb-2'>
              <label className="form-label">Name<span className='require'>*</span></label>
              <input className="form-control" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              {errorName ? (<span className="error">Required field</span>) : ''}
            </div>
          </div>
          <div className='row'>
            <div className='col-12  mb-2'>
              <label className="form-label">Velocity (km/s)<span className='require'>*</span></label>
              <input className="form-control" type="number" value={velocity} onChange={(e) => setVelocity(parseFloat(e.target.value))} />
              {errorVelocity ? (<span className="error">Required field</span>) : ''}
            </div>
          </div>
          <div className='row'>
            <div className='col-12 mb-2'>
              <label className="form-label">Distance (AU)<span className='require'>*</span></label>
              <input className="form-control" type="number" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} />
              {errorDistance ? (<span className="error">Required field</span>) : ''}
            </div>
          </div>
          <div className='row'>
            <div className='col-12 mb-2'>
              <label className="form-label">Diameter (km)<span className='require'>*</span></label>
              <input className="form-control" type="number" value={diameter} onChange={(e) => setDiameter(parseFloat(e.target.value))} />
              {errorDiameter ? (<span className="error">Required field</span>) : ''}
            </div>
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