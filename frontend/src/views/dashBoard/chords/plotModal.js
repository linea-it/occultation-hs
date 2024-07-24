import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PageLoader from '../../../component/page-loader';
import ChordService from '../../../services/chordService';

export default function PlotModal({ predictionId, value, onClose }) {
  const chordService = new ChordService();

  const [loader, showLoader, hideLoader] = PageLoader();
  const [ellipse, setEllipse] = useState(value || {legendLocation: 'best'});

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function setValue(value) {
    setEllipse({
      ...ellipse,
      ...value
    });
  }

  function save() {
    showLoader();
    chordService.adjustePlot(ellipse, predictionId).then(() => {
      hideLoader();
      toast.success("Plot task was successfully created");
      close(true);
    }).catch(err => {
      hideLoader();
      toast.error(err);
    });
  }

  function close(result) {
    if (onClose) {
      onClose(result);
    }
  }

  return (
    <>
      <Modal show={true} backdrop={'static'} keyboard={false} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title>Plot tool</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row'>
            <div className='col-12 col-md-6 mb-2'>
              <label className="form-label">Min X</label>
              <input className="form-control" type="number" value={display(ellipse.minX)} onChange={(e) => setValue({ minX: parseFloat(e.target.value) })} />
            </div>
            <div className='col-12 col-md-6 mb-2'>
              <label className="form-label">Max X</label>
              <input className="form-control" type="number" value={display(ellipse.maxX)} onChange={(e) => setValue({ maxX: parseFloat(e.target.value) })} />
            </div>
            <div className='col-12 col-md-6 mb-2'>
              <label className="form-label">Min Y</label>
              <input className="form-control" type="number" value={display(ellipse.minY)} onChange={(e) => setValue({ minY: parseFloat(e.target.value) })} />
            </div>
            <div className='col-12 col-md-6 mb-2'>
              <label className="form-label">Max Y</label>
              <input className="form-control" type="number" value={display(ellipse.maxY)} onChange={(e) => setValue({ maxY: parseFloat(e.target.value) })} />
            </div>
            <div className="col-12">
              <label className="form-label">Legend position</label>
              <Form.Check type="switch" name="legend-loc"
                id="best" label="Best"
                value={'best'} checked={ellipse.legendLocation === 'best'}
                onChange={e => setValue({ legendLocation: e.target.value })}
              />
              <div className="position-relative legend-panel">
                <div className="position-absolute top-0 start-0 legend-position mt-1 ms-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="upper-left" label="Upper left"
                    value={'upper left'} checked={ellipse.legendLocation === 'upper left'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute top-0 start-50 translate-middle-x legend-position mt-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="upper-center" label="Upper center"
                    value={'upper center'} checked={ellipse.legendLocation === 'upper center'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute top-0 end-0 legend-position mt-1 me-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="upper-right" label="Upper right"
                    value={'upper right'} checked={ellipse.legendLocation === 'upper right'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute top-50 start-0 translate-middle-y legend-position ms-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="center-left" label="Center left"
                    value={'center left'} checked={ellipse.legendLocation === 'center left'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute top-50 start-50 translate-middle legend-position">
                  <Form.Check type="radio" name="legend-loc"
                    id="center" label="Center"
                    value={'center'} checked={ellipse.legendLocation === 'center'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute top-50 end-0 translate-middle-y legend-position me-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="center-right" label="Center right"
                    value={'center right'} checked={ellipse.legendLocation === 'center right'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute bottom-0 start-0 legend-position ms-1 mb-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="lower-left" label="Lower left"
                    value={'lower left'} checked={ellipse.legendLocation === 'lower left'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute bottom-0 start-50 translate-middle-x legend-position mb-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="lower-center" label="Lower center"
                    value={'lower center'} checked={ellipse.legendLocation === 'lower center'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
                <div className="position-absolute bottom-0 end-0 legend-position me-1 mb-1">
                  <Form.Check type="radio" name="legend-loc"
                    id="lower-right" label="Lower right"
                    value={'lower right'} checked={ellipse.legendLocation === 'lower right'}
                    onChange={e => setValue({ legendLocation: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={save}>
            <i className="bi bi-arrow-clockwise"></i> Update
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