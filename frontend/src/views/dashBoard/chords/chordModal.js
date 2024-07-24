import './chordModal.css';
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ChordService from '../../../services/chordService';
import PageLoader from '../../../component/page-loader';
import { SketchPicker } from 'react-color';

export default function ChordModal({predictionId, value, lightCurveList, observerList, onClose}) {
  const chordService = new ChordService();
  const [loader, showLoader, hideLoader] = PageLoader();

  const [chord, setChord] = useState(value || { color: '#000' });
  const [lightCurve, setLightCurve] = useState(() => findIn(lightCurveList, 'lightCurve_id'));
  const [observer, setObserver] = useState(() => findIn(observerList, 'observer_id'));
  const [error, setError] = useState({});

  function findIn(list, key) {
    if (!value) {
      return list[0];
    }
    const id = value[key];
    const item = list.find(i => i.id == id);
    return item || list[0];
  }

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function setValue(value) {
    setChord({
      ...chord,
      ...value
    });
  }

  function close(chord) {
    if (onClose) {
      onClose(chord);
    }
  }

  function validate() {
    let error = {};
    if (!chord.name) {
      error.name = 'Required field';
    }
    setError(error);
    return Object.entries(error).length == 0;
  }

  function save() {
    if (validate()) {
      showLoader();
      chord.lightCurveId = lightCurve.id;
      chord.observerId = observer.id;
      chordService.save(chord, predictionId).then(saved => {
        hideLoader();
        toast.success("Chord was saved successfully!");
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
        Register Chord
      </Modal.Header>
      <Modal.Body>
        <div className='row'>
          <div className='col-12 mb-2'>
            <label className="form-label">Name <span className='require'>*</span></label>
            <input className="form-control" type="text" value={display(chord.name)} onChange={(e) => setValue({ name: e.target.value })} />
            {error.name && <span className="error">{error.name}</span>}
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label" htmlFor="tbxType">Light Curve</label>
            <Form.Select value={lightCurve.name} className="form-control" onChange={(e) => setLightCurve(lightCurveList[e.target.selectedIndex])}>
              {lightCurveList.map((element, index) => <option key={index}>{element.name}</option>)}
            </Form.Select>
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label" htmlFor="tbxType">Observer</label>
            <Form.Select value={observer.name} className="form-control" onChange={(e) => setObserver(observerList[e.target.selectedIndex])}>
              {observerList.map((element, index) => <option key={index}>{element.name}</option>)}
            </Form.Select>
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label">&Delta; Time</label>
            <input className="form-control" type="number" value={display(chord.timeShift)} onChange={(e) => setValue({ timeShift: e.target.value })} />
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label">Color</label>
            <SketchPicker
              width="95%"
              color={chord.color}
              onChangeComplete={(c) => setValue({ color: c.hex })}
            />
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