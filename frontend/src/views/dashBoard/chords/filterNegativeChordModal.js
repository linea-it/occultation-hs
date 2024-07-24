import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ChordService from '../../../services/chordService';
import PageLoader from '../../../component/page-loader';

export default function FilterNegativeChordModal({ predictionId, value, chordList, onClose }) {
  const chordService = new ChordService();
  const [loader, showLoader, hideLoader] = PageLoader();

  const negativeChords = chordList.filter(c => c.negative);

  const [ellipse, setEllipse] = useState(value || {});
  const [chord, setChord] = useState(() => findIn(negativeChords, 'name'));
  const [error, setError] = useState({});

  function findIn(list, key) {
    if (!value) {
      return list[0];
    }
    const item = list.find(i => i[key] === value.negativeChord);
    return item || list[0];
  }

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function setValue(value) {
    setEllipse({
      ...ellipse,
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
    if (!ellipse.step) {
      error.step = 'Required field';
    }
    setError(error);
    return Object.entries(error).length === 0;
  }

  function save() {
    if (validate()) {
      showLoader();
      ellipse.negativeChord = chord.name
      chordService.filterNegative(ellipse, predictionId).then(() => {
        hideLoader();
        toast.success("Filter negative chord task was successfully created");
        close(true);
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
            <label className="form-label" htmlFor="tbxType">Light Curve</label>
            <Form.Select value={chord.name} className="form-control" onChange={(e) => setChord(negativeChords[e.target.selectedIndex])}>
              {negativeChords.map((element, index) => <option key={index}>{element.name}</option>)}
            </Form.Select>
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label">Step <span className='require'>*</span></label>
            <input className="form-control" type="number" value={display(ellipse.step)} onChange={(e) => setValue({ step: parseFloat(e.target.value) })} />
            {error.step && <span className="error">{error.step}</span>}
          </div>
          <div className='col-12 mb-2'>
            <label className="form-label">(&Sigma;) Uncertainty of the ellipse</label>
            <input className="form-control" type="number" value={display(ellipse.sigma)} onChange={(e) => setValue({ sigma: parseFloat(e.target.value) })} />
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