import './chordModal.css';
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ChordService from '../../../services/chordService';
import PageLoader from '../../../component/page-loader';

export default function EllipseModal(props) {
  const chordService = new ChordService();
  const [loader, showLoader, hideLoader] = PageLoader();

  const [ellipse, setEllipse] = useState(props.ellipse || {
    centerF: 0,
    centerG: 0,
    oblateness: 0,
    positionAngle: 0,
    loop: 10000000,
    numberChi: 10000
  });
  const [error, setError] = useState({});
  const [allEllipses, setAllEllipses] = useState(props.ellipse ? !!props.ellipse.allEllipses : true);

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function setValue(value) {
    setEllipse({
      ...ellipse,
      ...value
    });
  }

  function close(result) {
    if (props.onClose) {
      props.onClose(result);
    }
  }

  function validate() {
    let error = {};
    if (!ellipse.centerF && ellipse.centerF !== 0) {
      error.centerF = 'Required field';
    }
    if (!ellipse.centerG && ellipse.centerG !== 0) {
      error.centerG = 'Required field' ;
    }
    if (!ellipse.equatorialRadius && ellipse.equatorialRadius !== 0) {
      error.equatorialRadius = 'Required field';
    }
    if (!ellipse.oblateness && ellipse.oblateness !== 0) {
      error.oblateness = 'Required field';
    }
    if (!ellipse.positionAngle && ellipse.positionAngle !== 0) {
      error.positionAngle = 'Required field';
    }
    setError(error);
    return Object.entries(error).length === 0;
  }

  function startFit() {
    if (validate()) {
      showLoader();
      ellipse.allEllipses = allEllipses;
      chordService.fitEllipse(ellipse, props.predictionId).then(() => {
        hideLoader();
        toast.success("Fit ellipse task was successfully created");
        close(true);
      }).catch(err => {
        hideLoader();
        toast.error(err);
      });
    }
  }

  return (<>
    <Modal show={true} backdrop={'static'} keyboard={false} onHide={() => close(false)}>
      <Modal.Header closeButton>
        Fit Ellipse
      </Modal.Header>
      <Modal.Body>
        <div className='row'>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">Center F <span className='require'>*</span></label>
            <input className="form-control" type="number" value={display(ellipse.centerF)} onChange={(e) => setValue({ centerF: e.target.value })} />
            {error.centerF && <span className="error">{error.centerF}</span>}
          </div>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">&Delta; Center F</label>
            <input className="form-control" type="number" value={display(ellipse.dCenterF)} onChange={(e) => setValue({ dCenterF: e.target.value })} />
          </div>

          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">Center G <span className='require'>*</span></label>
            <input className="form-control" type="number" value={display(ellipse.centerG)} onChange={(e) => setValue({ centerG: e.target.value })} />
            {error.centerG && <span className="error">{error.centerG}</span>}
          </div>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">&Delta; Center G</label>
            <input className="form-control" type="number" value={display(ellipse.dCenterG)} onChange={(e) => setValue({ dCenterG: e.target.value })} />
          </div>

          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">Equatorial radius <span className='require'>*</span></label>
            <input className="form-control" type="number" value={display(ellipse.equatorialRadius)} onChange={(e) => setValue({ equatorialRadius: e.target.value })} />
            {error.equatorialRadius && <span className="error">{error.equatorialRadius}</span>}
          </div>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">&Delta; Equatorial radius</label>
            <input className="form-control" type="number" value={display(ellipse.dEquatorialRadius)} onChange={(e) => setValue({ dEquatorialRadius: e.target.value })} />
          </div>

          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">Oblateness <span className='require'>*</span></label>
            <input className="form-control" type="number" value={display(ellipse.oblateness)} onChange={(e) => setValue({ oblateness: e.target.value })} />
            {error.oblateness && <span className="error">{error.oblateness}</span>}
          </div>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">&Delta; Oblateness</label>
            <input className="form-control" type="number" value={display(ellipse.dOblateness)} onChange={(e) => setValue({ dOblateness: e.target.value })} />
          </div>

          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">Position angle <span className='require'>*</span></label>
            <input className="form-control" type="number" value={display(ellipse.positionAngle)} onChange={(e) => setValue({ positionAngle: e.target.value })} />
            {error.positionAngle && <span className="error">{error.positionAngle}</span>}
          </div>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">&Delta; Position angle</label>
            <input className="form-control" type="number" value={display(ellipse.dPositionAngle)} onChange={(e) => setValue({ dPositionAngle: e.target.value })} />
          </div>

          <div className='col-12 mb-2'>
            <label className="form-label">Loop</label>
            <input className="form-control" type="number" value={display(ellipse.loop)} onChange={(e) => setValue({ loop: e.target.value })} />
          </div>

          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">&Delta; Chi min</label>
            <input className="form-control" type="number" value={display(ellipse.dChiMin)} onChange={(e) => setValue({ dChiMin: e.target.value })} />
          </div>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">Number chi</label>
            <input className="form-control" type="number" value={display(ellipse.numberChi)} onChange={(e) => setValue({ numberChi: e.target.value })} />
          </div>

          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">Ellipse error</label>
            <input className="form-control" type="number" value={display(ellipse.error)} onChange={(e) => setValue({ error: e.target.value })} />
          </div>
          <div className='col-12 col-md-6 mb-2'>
            <label className="form-label">&sigma; result</label>
            <input className="form-control" type="number" value={display(ellipse.sigmaResult)} onChange={(e) => setValue({ sigmaResult: e.target.value })} />
          </div>

          <div className='col-12 mt-2'>
            <Form.Check
              id="allEllipses"
              type="switch"
              label="Plot all the ellipses within 3-sigma"
              checked={allEllipses} onChange={e => setAllEllipses(e.target.checked)}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={startFit}>
          <i className="bi bi-arrow-clockwise"></i> Start Fit
        </Button>
        <Button variant="secondary" onClick={() => close(false)}>
          <i className="bi bi-x"></i> Close
        </Button>
      </Modal.Footer>
    </Modal>
    {loader}
  </>)
}