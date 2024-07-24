import { useState } from 'react';
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ObserverService from '../../../services/observerService';
import PageLoader from '../../../component/page-loader';

export default function ObserverModal(props) {
  const observerService = new ObserverService();
  const [loader, showLoader, hideLoader] = PageLoader();

  const [observer, setObserver] = useState(props.observer || {});
  const [error, setError] = useState({});

  function displayValue(value) {
    return value || value === 0 ? value : ''
  }

  function setValue(value) {
    setObserver({
      ...observer,
      ...value
    });
  }

  function close(observer) {
    if (props.onClose) {
      props.onClose(observer);
    }
  }

  function validate() {
    let error = {};
    if (!observer.name) {
      error.name = 'Required field';
    }
    if (!observer.latitude) {
      //todo validar formato
      error.lat = 'Required field';
    }
    if (!observer.longitude) {
      //todo validar formato
      error.long = 'Required field';
    }
    if (!observer.altitude && observer.altitude !== 0) {
      error.alt = 'Required field'
    }
    setError(error);
    return Object.entries(error).length === 0;
  }

  function save() {
    if (validate()) {
      showLoader();
      observerService.save(observer, props.predictionId)
      .then(saved => {
        hideLoader();
        toast.success("Observer was saved successfully!");
        close(saved);
      }).catch(err => {
        hideLoader();
        toast.error(err);
      });
    }
  }

  return (<>
    <Modal show={true} backdrop={'static'} keyboard={false} onHide={() => close()}>
      <Modal.Header closeButton>
        Include Observer
      </Modal.Header>
      <Modal.Body>
        <div className='row'>
          <div className='col-12 mb-2'>
            <label className="form-label">Observer/Site Name <span className='require'>*</span></label>
            <input className="form-control" type="text" value={observer.name||''} onChange={(e) => setValue({name: e.target.value})} />
            {error.name && <span className="error">{error.name}</span>}
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label">
              Latitude <span className='require'>*</span>
              <OverlayTrigger placement="top" overlay={<Tooltip>Positive to North</Tooltip>}>
                <i className="bi bi-question-circle mx-2"></i>
              </OverlayTrigger>
            </label>
            <input className="form-control" type="text" value={observer.latitude||''} onChange={(e) => setValue({latitude: e.target.value})} />
            {error.lat && <span className="error">{error.lat}</span>}
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label">
              Longitude <span className='require'>*</span>
              <OverlayTrigger placement="top" overlay={<Tooltip>Positive to East</Tooltip>}>
                <i className="bi bi-question-circle mx-2"></i>
              </OverlayTrigger>
            </label>
            <input className="form-control" type="text" value={observer.longitude||''} onChange={(e) => setValue({longitude: e.target.value})} />
            {error.long && <span className="error">{error.long}</span>}
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label">Altitude (m) <span className='require'>*</span></label>
            <input className="form-control" type="number" value={displayValue(observer.altitude)} onChange={(e) => setValue({altitude: parseFloat(e.target.value)})} />
            {error.alt && <span className="error">{error.alt}</span>}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
          <Button variant="success" onClick={save}>
            <i className="bi bi-check-lg"></i> Save
          </Button>
          <Button variant="secondary" onClick={() => close()}>
            <i className="bi bi-x"></i> Close
          </Button>
        </Modal.Footer>
    </Modal>
    {loader}
  </>)
}