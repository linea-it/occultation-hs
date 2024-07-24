/* eslint-disable no-unused-vars */

import { useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import PageLoader from '../../../../component/page-loader';
import LightCurveService from '../../../../services/lightCurveService';
import { toast } from 'react-toastify';
import Form from 'react-bootstrap/Form';

export default function StarModal(props) {
  const lightCurveService = new LightCurveService();
  const [loader, showLoader, hideLoader] = PageLoader();
  const [code] = useState(props.star.code);
  const [catalog] = useState(props.star.catalog);
  const [epoch] = useState(props.star.epoch);
  const [radVel, setRadVel] = useState(props.star.radVel || 0);
  const [bjones, setBjones] = useState(props.star.bjones || true);
  const [cgaudin, setCgaudin] = useState(props.star.cgaudin || true);
  const [da_cosdec, setCosDec] = useState(props.star.da_cosdec || 0);
  const [ddec, setDdec] = useState(props.star.ddec || 0);
  const [varV, setVarV] = useState(props.star.varV || 0);
  const [varB, setVarB] = useState(props.star.varB || 0);
  const [varK, setVarK] = useState(props.star.varK || 0);
  const [varG, setVarG] = useState(props.star.varG || 0);
  const [calculationType, setCalculationType] = useState(props.star.calculationType || 'kervella');
  const [starType, setStarType] = useState(props.star.starType || 'sg');
  const [diameter, setDiameter] = useState(props.star.diameter || 0);
  const [refMag, setRefMag] = useState(props.star.referenceMag || 'V');
  const [error, setError] = useState({});

  const starTypes = [
    { name: "Super Giant", value: "sg" },
    { name: "Main Sequence", value: "ms" },
    { name: "Variable Star", value: "vs" }
  ]

  useEffect(() => {
    loadMagnitudes(false);
  }, [])

  function loadMagnitudes(override) {
    showLoader();
    lightCurveService.starMagnitudes(
      { code, catalog, nomad: true, bjones, cgaudin }
    ).then(data => {
      hideLoader();
      if (override || !varK || varK === 0)
        setVarK(data.K.toFixed(4))
      if (override || !varB || varB === 0)
        setVarB(data.B.toFixed(4))
      if (override || !varV || varV === 0)
        setVarV(data.V.toFixed(4))
      if (override || !varG || varG === 0)
        setVarG(data.G.toFixed(4))
    }).catch(() => {
      hideLoader();
      toast.error("Star magnitudes couldn't be downloaded");
    })
  }

  function close() {
    if (props.close) {
      props.close(!!diameter);
    }
  }

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function validate() {
    //TODO: implementar as outras validações
    const err = {};
    switch (calculationType) {
      case 'user':
        if (!diameter && diameter !== 0) {
          err.diameter = 'Required field';
        } else if (diameter <= 0) {
          err.diameter = "Diameter can't be zero neither negative";
        }
        break;
      case 'gaia':
        break;
      case 'kervella':
        break;
      case 'van_belle':
        break;
      default:
        break;
    }
    setError(err);
    return Object.entries(err).length === 0;
  }

  function calculateDiameter() {
    if (refMag || calculationType === "gaia") {
      if (validate()) {
        const star = {
          id: props.star.id,
          code: code,
          catalogue: catalog,
          epoch: epoch,
          nomad: true,
          bjones: bjones,
          cgaudin: cgaudin,
          radVel: radVel === '' ? undefined : radVel,
          da_cosdec: da_cosdec === '' ? undefined : da_cosdec,
          ddec: ddec === '' ? undefined : ddec,
          mode: calculationType,
          starType: calculationType === 'van_belle' ? starType : undefined,
          band: refMag,
          V: varV === '' ? undefined : varV,
          B: varB === '' ? undefined : varB,
          K: varK === '' ? undefined : varK,
          G: varG === '' ? undefined : varG,
        };
        if (calculationType === 'user') {
          star.diameter = diameter;
        }
        showLoader();
        lightCurveService.starCalculateDiameter(star).then(response => {
          hideLoader();
          if (!response.diameter)
            throw { soraError: response };
          setDiameter(response.diameter);
        }).catch(err => {
          hideLoader();
          if (err.soraError) {
            toast.error(err.soraError);
          } else if (err.response.status == 400) {
            if (typeof err.response.data === 'string') {
              toast.error(err.response.data)
            } else if (err.response.data.non_field_errors) {
              toast.error(err.response.data.non_field_errors.join(' | '));
            } else {
              var msg = Object.entries(err.response.data).map(field => field.join(': ')).join('\n');
              toast.error(msg)
            }
          } else {
            toast.error('Internal server error, call support for help');
          }
        });
      }
    } else {
      toast.error("Reference Magnitude is required!");
    }
  }

  function handleChangeBjones() {
    if (!bjones)
      setBjones(true);
    else
      setBjones(false);
  };

  function handleChangeCgaudin() {
    if (!cgaudin)
      setCgaudin(true);
    else
      setCgaudin(false);
  };


  function handleChangeStarType(e) {
    let type = starTypes.find(p => p.name === e.target.value).value
    setStarType(type);
  }

  function handleChangeRefMag(e) {
    setRefMag(e.target.value)
  }

  return (
    <>
      <Modal show={true} onHide={close} size="lg" backdrop={'static'} keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Star</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">Star ID</label>
              <input className="form-control" type="text" value={code} readOnly={true} />
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">Catalog</label>
              <input className="form-control" type="text" value={catalog} readOnly={true} />
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">Epoch</label>
              <input className="form-control" type="text" value={epoch} readOnly={true} />
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12 mb-2'>
              <label className="form-label">Radial Velocity</label>
              <input className="form-control" type="number" value={display(radVel)} onChange={(e) => setRadVel(parseFloat(e.target.value))} />
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12 col-md-6 mb-2'>
              <label className="form-label">Offset - &Delta;&alpha; cos&delta; (mas)</label>
              <input className="form-control" type="number" value={display(da_cosdec)} onChange={(e) => setCosDec(parseFloat(e.target.value))} />
            </div>
            <div className='col-xs-12 col-md-6 mb-2'>
              <label className="form-label">Offset - &Delta;&delta; (mas)</label>
              <input className="form-control" type="number" value={display(ddec)} onChange={(e) => setDdec(parseFloat(e.target.value))} />
            </div>
          </div>
          <div className='row'>
            <div className='col-12 mb-2'>
              <Form.Check
                type="switch"
                label="Star Distance (Bayley-Jones)"
                checked={bjones} onChange={handleChangeBjones}
              />
            </div>
            <div className='col-12'>
              <Form.Check
                type="switch"
                label="Proper Motion Correction (Cantat, Gaudin & Brandt)"
                checked={cgaudin} onChange={handleChangeCgaudin}
              />
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12'>
              <div className="input-group mt-3 mb-3">
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="CalculationType" checked={calculationType === "kervella"} value="kervella" onChange={(e) => setCalculationType(e.target.value)} />
                  <label className="form-check-label mt-0">
                    Kervella
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="CalculationType" checked={calculationType === "van_belle"} value="van_belle" onChange={(e) => setCalculationType(e.target.value)} />
                  <label className="form-check-label mt-0">
                    Van Belle
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="CalculationType" checked={calculationType === "gaia"} value="gaia" onChange={(e) => setCalculationType(e.target.value)} />
                  <label className="form-check-label mt-0">
                    Catalog
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="CalculationType" checked={calculationType === "user"} value="user" onChange={(e) => setCalculationType(e.target.value)} />
                  <label className="form-check-label mt-0">
                    Manual
                  </label>
                </div>
              </div>
            </div>
          </div>
          {(calculationType === "kervella" || calculationType === "van_belle") &&
            <div className='row'>
              <div className='col-12'>
                <label className="form-label">
                  Magnitudes
                  <Button className='ms-1' variant="primary" size='sm' onClick={() => loadMagnitudes(true)}>
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>
                </label>
                <Card className='mb-2'>
                  <Card.Body className='py-2'>
                    <div className='row'>
                      <div className='col-12 col-md-3 mb-2 px-2'>
                        <label className="form-label">V</label>
                        <input className="form-control" type="number" value={display(varV)} onChange={(e) => setVarV(parseFloat(e.target.value))} />
                      </div>
                      <div className='col-12 col-md-3 mb-2 px-2'>
                        <label className="form-label">B</label>
                        <input className="form-control" type="number" value={display(varB)} onChange={(e) => setVarB(parseFloat(e.target.value))} />
                      </div>
                      <div className='col-12 col-md-3 mb-2 px-2'>
                        <label className="form-label">K</label>
                        <input className="form-control" type="number" value={display(varK)} onChange={(e) => setVarK(parseFloat(e.target.value))} />
                      </div>
                      <div className='col-12 col-md-3 mb-2 px-2'>
                        <label className="form-label">G</label>
                        <input className="form-control" type="number" value={display(varG)} onChange={(e) => setVarG(parseFloat(e.target.value))} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
                <div className='col-12'>
                        <label className="form-label" htmlFor="tbxType">Reference Magnitude</label>
                        <Form.Select value={refMag}
                          className="form-control" id="tbxType" name="starType" autoFocus aria-label="Default select example" onChange={handleChangeRefMag}>
                          <option key="0"></option>
                          <option key="1">B</option>
                          <option key="2">V</option>
                        </Form.Select>
                      </div>
              </div>
            </div>
          }
          {calculationType === 'van_belle' &&
            <div className='row'>
              <div className='col-xs-12 col-mb-2'>
                <label className="form-label" htmlFor="tbxType">Star Type</label>
                <Form.Select value={starType ? starTypes.find(x => x.value === starType).name : ""}
                  className="form-control mb-4" id="tbxType" name="starType" autoFocus aria-label="Default select example" onChange={handleChangeStarType}>
                  {starTypes.map((element, index) => <option key={index}>{element.name}</option>)}
                </Form.Select>
              </div>
            </div>
          }
          <div className='row'>
            <div className='col-xs-12'>
              <label className="form-label">Apparent Diameter</label>
              <input className="form-control" type="number" value={display(diameter)} readOnly={calculationType !== 'user'} onChange={(e) => setDiameter(parseFloat(e.target.value))} />
              {error.diameter && <span className='error'>{error.diameter}</span>}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={calculateDiameter}>
            <i className="bi bi-calculator"></i> Update
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