/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './new-project.css';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import SoraTitleComponent from '../../../component/sora-title';
import { toast } from 'react-toastify';
import ProjectService from '../../../services/projectService';
import PageLoader from '../../../component/page-loader';
import DateInput from '../../../component/date-piker-input';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { OverlayTrigger, Tooltip, Form } from 'react-bootstrap';

const projectService = new ProjectService();
const _HORIZONS_ = 'Horizons/JPL';
const _HOUR_MILISECONDS_ = 36e5;

export default function NewProjectPage() {
  const history = useHistory();
  const [loader, showLoader, hideLoader] = PageLoader();

  const [currentStep, setStep] = useState(1);
  const [showSave, setShowSave] = useState(false);
  const [error, setError] = useState({});
  const [warning, setWarning] = useState({});

  function display(value) {
    return value || value === 0 ? value : ''
  }

  function navigate(step) {
    setStep(step);
    if (step === 5) {
      fillOutSummary();
    }
  }

  function nextStep() {
    if (validate(currentStep)) {
      navigate(currentStep + 1);
    }
  }

  function previusStep() {
    navigate(currentStep - 1);
  }

  function goTo(step) {
    if (step > currentStep) {
      let to = currentStep;
      while (validate(to) && to < step) {
        to++;
      }
      step = to;
    }
    if (step !== currentStep) {
      navigate(step);
    }
  }

  function validate(step) {
    const err = {};
    switch (step) {
      case 5:
      case 4:
        if (!search && search !== 0) {
          err.searchStep = 'Required field';
        } else if (search < 1) {
          err.searchStep = "Can't be lower than 1";
        }
        if (!segment && segment !== 0) {
          err.segment = 'Required field';
        } else if (segment < 1) {
          err.segment = "Can't be lower than 1";
        }
        if (!offEarth && offEarth !== 0) {
          err.offEarth = 'Required field';
        } else if (offEarth < 0) {
          err.offEarth = "Can't be lower than 0";
        }
      case 3:
        if (!initialDate) {
          err.initialDate = 'Required field';
        }
        if (!finalDate) {
          err.finalDate = 'Required field';
        }
        if (finalDate < initialDate) {
          err.dateRange = 'The end date must be greater than the start date';
        } else if ((finalDate - initialDate) / _HOUR_MILISECONDS_ < 1) {
          err.dateRange = 'End time must be after start time (minimum 1 hour)';
        }
        if (!catalogue) {
          err.catalogue = 'Required field';
        }
        if (!limiting && limiting !== 0) {
          err.limiting = 'Required field';
        }
      case 2:
        if (fileList.length === 0) {
          err.bodyList = 'It is necessary to inform at least one solar system object';
        }
      case 1:
        if (!projectName) {
          err.projectName = 'Required field';
        } else {
          var listProject = JSON.parse(sessionStorage.getItem('listProject'));
          if (listProject.some(project => project.name.toLowerCase() === projectName.toLowerCase())) {
            err.projectName = 'The project name already exists in the register. Please enter another name.';
          }
        }
        break;
      default:
        break;
    }
    setError(err);
    return Object.entries(err).length === 0;
  }

  function save() {
    if (validate(5)) {
      showLoader();
      const bodies = fileList.map(b => {
        b.radius = b.editedRadius || b.radius;
        b.editedRadius = undefined;
        return b;
      });

      let infoProject = {
        "name": projectName,
        "description": description,
        "bodys": bodies,
        "initialDateTime": initialDate,
        "finalDateTime": finalDate,
        "limitingMagnitude": limiting,
        "searchStep": search,
        "segments": segment,
        "catalogue": catalogue,
        "offEarthSigma": offEarth,
        "referenceCenter": reference,
        "referenceCenterBSPFile": ""
      };
      projectService.create(infoProject).then((result) => {
        hideLoader();
        toast.success('Project created successfully');
        history.push('/dashboard/' + result.data.id);
      }).catch((err) => {
        hideLoader();
        setError({ save: err });
        setShowSave(false);
        toast.error(err);
      });
    }
  }

  // Step 1
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  //--//

  // Step 2
  const [bodyName, setBodyName] = useState('');
  const [labelEphemeris, setLabelEphemeris] = useState('Name');
  const [ephemerisSource, setEphemerisSource] = useState(_HORIZONS_);
  const [bodyError, setBodyError] = useState({});
  const [fileList, setFileList] = useState([]);
  //Edit body
  const [selectedBody, setSelectedBody] = useState();
  const [selectedBodyRadius, setSelectedBodyRadius] = useState(0);
  const [showEditBody, setShowEditBody] = useState(false);
  const [radiusError, setRadiusError] = useState('');

  function changeEphemerisSource(source) {
    setLabelEphemeris(source);
    if (source === 'File') {
      setEphemerisSource('');
    } else {
      setBodyError({ ...bodyError, ephemerisSource: '' });
      setEphemerisSource(_HORIZONS_);
    }
  }

  function readBase64From(file) {
    return new Promise((resolve, reject) => {
      let baseURL = "";
      let reader = new FileReader();
      reader.onload = () => {
        baseURL = reader.result.substr(reader.result.indexOf(',') + 1);
        resolve(baseURL);
      };
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file);
    });
  };

  function ephemerisFileChange(file) {
    let err = { ...bodyError, ephemerisFile: '' };
    let ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (ext.toLowerCase() === '.zip') {
      readBase64From(file)
        .then(data => {
          setEphemerisSource(data);
        })
        .catch(e => {
          console.error(e);
          setBodyError({ ...bodyError, ephemerisFile: 'Fail to read file' });
        });
    } else {
      err.ephemerisFile = 'Must be a zip file';
    }
    setBodyError(err);
    setEphemerisSource('');
  };

  function bodyIncluded(name) {
    return fileList.some(i => i.bodyName.toLowerCase() === name.toLowerCase())
  }

  function validateBody() {
    const err = {};

    if (!bodyName) {
      err.name = 'Required field';
    } else if (bodyIncluded(bodyName)) {
      err.name = 'This body is already included';
    }

    if (!ephemerisSource) {
      err.ephemerisSource = 'Required field';
    }

    setBodyError(err);
    return Object.entries(err).length === 0;
  }

  function addBody() {
    if (validateBody()) {
      showLoader();
      projectService.validateBody(bodyName, ephemerisSource, labelEphemeris).then((result) => {
        const err = { ...error };
        if (bodyIncluded(result.data.bodyName)) {
          setBodyError({ name: 'This body is already included' });
        } else {
          let list = [...fileList];
          list.push({
            bodyName: result.data.bodyName,
            radius: parseFloat(result.data.radius),
            elementContent: ephemerisSource,
            elementType: labelEphemeris.toLowerCase(),
          });
          setError({ ...error, bodyList: '' });
          setBodyName('');
          setLabelEphemeris('Name');
          setEphemerisSource(_HORIZONS_);
          setFileList(list);
          toast.success('Solar system body successfully included');
        }
        hideLoader();
      }).catch((err) => {
        hideLoader();
        if (err.response.data.error) {
          setBodyError({ includeBody: err.response.data.error[0] })
        } else {
          setBodyError({ includeBody: 'Invalid information' })
        }
        toast.error('Invalid information');
      });
    }
  }

  function editBody(item) {
    setSelectedBody(item);
    setSelectedBodyRadius(item.radius);
    setShowEditBody(true);
  }

  function saveBodyEdition() {
    if (!selectedBodyRadius && selectedBodyRadius !== 0) {
      setRadiusError('Required field');
    } else if (selectedBodyRadius < 0) {
      setRadiusError("Radius can't be negative");
    } else {
      selectedBody.editedRadius = selectedBodyRadius;
      setRadiusError('');
      setShowEditBody(false);
    }
  }

  function resetBody(item) {
    item.editedRadius = undefined;
    setFileList([...fileList]);
  }

  function deleteBody(obj) {
    let list = fileList.filter(value => value !== obj);
    setFileList(list);
    toast.success('Solar system body successfully removed');
  }
  //--//

  // Step 3
  let todayUtc = new Date(new Date().toDateString());
  todayUtc.setMinutes(todayUtc.getMinutes() - todayUtc.getTimezoneOffset());
  const [initialDate, setInitialDate] = useState(new Date(todayUtc));
  const [finalDate, setFinalDate] = useState(new Date(todayUtc.setHours(todayUtc.getHours() + 1)));
  const [catalogue, setCatalogue] = useState('gaiaedr3');
  const [limiting, setLimiting] = useState(10);
  const catalogues = [{
    name: 'GAIA DR2',
    value: 'gaiadr2'
  }, {
    name: 'GAIA eDR3',
    value: 'gaiaedr3'
  }]

  useEffect(() => {
    const warn = { ...warning, limiting: '' };
    if (limiting > 20) {
      warn.limiting = 'Star magnitude is bigger than 20 and it may take longer to search for occultations';
    } else if (limiting < -26) {
      warn.limiting = 'Star is brighter than the Sun! You will not find any occultations';
    }
    setWarning(warn);
  }, [limiting])
  //--//

  //Step 4
  const [search, setSearch] = useState(60);
  const [segment, setSegment] = useState(1);
  const [offEarth, setOffEarth] = useState(1);
  const [reference] = useState('geocenter');

  useEffect(() => {
    const warn = { ...warning, offEarth: '' };
    if (offEarth > 10) {
      warn.offEarth = 'Check this out, value could be wrong';
    }
    setWarning(warn);
  }, [offEarth]);
  //--//

  //Step 5
  const [summary, setSummary] = useState('');

  function fillOutSummary() {
    let text = '';
    text += '1. PROJECT INFORMATION\n\n';
    text += 'Name: ' + projectName + '\n';
    text += 'Description: ' + description + '\n';

    text += '\n\n2. SELECTED OBJECTS\n\n';

    if (fileList.length === 0) {
      text += 'Uninformed\n';
    } else {
      fileList.forEach(element => {
        text += `${element.bodyName} - radius: ${element.radius} Km - Ephem: ${element.elementContent === _HORIZONS_ ? _HORIZONS_ : 'user BSP'}\n`;
      });
    }

    text += '\n\n3. PREDICTION PARAMETERS\n\n';
    text += 'Start Time: ' + initialDate.toUTCString() + '\n';
    text += 'End Time: ' + finalDate.toUTCString() + '\n';
    text += 'Star Magnitude Limit: ' + limiting + '\n';
    text += 'Catalogue: ' + catalogues.find(c => c.value === catalogue).name + '\n';


    text += '\n\n4. OTHER INFORMATION\n\n';
    text += 'Search Step (s): ' + search + '\n';
    text += 'Segment (divs): ' + segment + '\n';
    text += 'Off-Earth Sigma: ' + offEarth + '\n';
    text += 'Reference Center: ' + reference;
    setSummary(text);
  }
  //--//

  return (
    <>
      <div className='row comprimento py-3'>
        <Card>
          <Card.Body>
            <SoraTitleComponent />
            <div className='row'>
              <div className='col-12 mb-3'>
                <div className="fullscreen col-12">
                  <div className="stepper-wrapper">
                    <div className={`stepper-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`} onClick={() => goTo(1)}>
                      <div className="step-counter">1</div>
                      <div className="text-center">Project Name</div>
                    </div>
                    <div className={`stepper-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`} onClick={() => goTo(2)}>
                      <div className="step-counter">2</div>
                      <div className="text-center">Solar System Object</div>
                    </div>
                    <div className={`stepper-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`} onClick={() => goTo(3)}>
                      <div className="step-counter">3</div>
                      <div className="text-center">Prediction Parameters</div>
                    </div>
                    <div className={`stepper-item ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`} onClick={() => goTo(4)}>
                      <div className="step-counter">4</div>
                      <div className="text-center">Other Information</div>
                    </div>
                    <div className={`stepper-item ${currentStep === 5 ? 'active' : currentStep > 5 ? 'completed' : ''}`} onClick={() => goTo(5)}>
                      <div className="step-counter">5</div>
                      <div className="text-center">Summary</div>
                    </div>
                  </div>
                  <Card>
                    <Card.Body>
                      <div className='col-12 mb-2'>
                        <label className='title'><b>Prediction (step {currentStep} of 5)</b></label>
                      </div>
                      {currentStep === 1 &&
                        <div className='row'>
                          <div className='col-12'>
                            <label className="form-label">
                              Project Name <span className='require'>*</span>
                              <OverlayTrigger placement="top" overlay={<Tooltip>The name of the project</Tooltip>}>
                                <i className="bi bi-question-circle mx-1"></i>
                              </OverlayTrigger>
                            </label>
                            <input className="form-control" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                            {error.projectName && <span className="error">{error.projectName}</span>}
                          </div>
                          <div className='col-12'>
                            <label className="col-form-label">
                              Description
                              <OverlayTrigger placement="top" overlay={<Tooltip>General description of the project</Tooltip>}>
                                <i className="bi bi-question-circle mx-1"></i>
                              </OverlayTrigger>
                            </label>
                            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" cols="33"></textarea>
                          </div>
                        </div>
                      }
                      {currentStep === 2 &&
                        <div className='row'>
                          <div className='col-12'>
                            <label className='form-label'>General Information</label>
                            <Card>
                              <Card.Body>
                                <div className='row'>
                                  <div className='col-12'>
                                    <label className="form-label">
                                      Object Name: <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>The name of the object. It can be the used spkid or designation number to query the SBDB (Small-Body DataBase). In this case, the name is case insensitive.</Tooltip>}>
                                        <i className="bi bi-question-circle mx-1"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <input className="form-control" type="text" value={bodyName} onChange={(e) => setBodyName(e.target.value)} />
                                    {bodyError.name && <span className="error">{bodyError.name}</span>}
                                  </div>
                                  <div className='col-12'>
                                    <label className="col-form-label">
                                      Ephemeris
                                      <OverlayTrigger placement="top" overlay={<Tooltip>Select the bsp file with the object ephemeris.</Tooltip>}>
                                        <i className="bi bi-question-circle mx-1"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <Card>
                                      <Card.Body>
                                        <div className='row'>
                                          <div className='col-12 col-md-4'>
                                            <div className='form-group'>
                                              <label className="form-label">Ephemeris Source</label>
                                              <div>
                                                <div className="form-check form-check-inline">
                                                  <input className="form-check-input" type="radio" id="ephem-online" name="ephemeris" value="Name" onChange={(e) => changeEphemerisSource(e.target.value)} checked={labelEphemeris === 'Name'} />
                                                  <label className="form-check-label" htmlFor='ephem-online'>Online Query</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                  <input className="form-check-input" type="radio" id="ephem-file" name="ephemeris" value="File" onChange={(e) => changeEphemerisSource(e.target.value)} checked={labelEphemeris !== 'Name'} />
                                                  <label className="form-check-label" htmlFor='ephem-file'>File</label>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className='col-xs-12 col-md-8'>
                                            <label className="form-label">Ephemeris {labelEphemeris} <span className='require'>*</span>
                                              {labelEphemeris === "File" &&
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Selec bsp file to use with planetary ephemerid DE440.</Tooltip>}>
                                                  <i className="bi bi-question-circle mx-1"></i>
                                                </OverlayTrigger>
                                              }
                                            </label>
                                            {labelEphemeris === "Name" &&
                                              <input className="form-control" type="text" readOnly value={ephemerisSource} />
                                            }
                                            {labelEphemeris === "File" &&
                                              <input className="form-control" type="file" name="file" accept="application/zip, .zip" onChange={(e) => ephemerisFileChange(e.target.files[0])} />
                                            }
                                            {bodyError.ephemerisFile && <div className="error">{bodyError.ephemerisFile}</div>}
                                            {bodyError.ephemerisSource && <div className="error">{bodyError.ephemerisSource}</div>}
                                          </div>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </div>
                                  {bodyError.includeBody && <div className="col-12 mt-2 error">{bodyError.includeBody}</div>}
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                          <div className='col-12 text-center my-4'>
                            <button type="button" className="btn btn-primary" onClick={addBody}><i className="bi bi-check2"></i> Include Object</button>
                          </div>
                          <div className='col-12'>
                            <Table responsive striped hover>
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Solar System Object</th>
                                  <th>Radius (Km)</th>
                                  <th></th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {fileList.map((item, index) =>
                                  <tr key={index}>
                                    <td valign='middle'>{index + 1}</td>
                                    <td valign='middle'>{item.bodyName}</td>
                                    <td valign='middle'> {item.editedRadius || item.radius}</td>
                                    <td width="95px"><button type="button" className="btn btn-light border-btn" onClick={() => editBody(item)}><i className="bi bi-pencil"></i> Edit</button></td>
                                    <td width="110px"><button type="button" className="btn btn-light border-btn" onClick={() => resetBody(item)}><i className="bi bi-backspace"></i> Reset</button></td>
                                    <td width="130px"><button type="button" className="btn btn-light border-btn" onClick={() => deleteBody(item)}><i className="bi bi-trash3"></i> Remove</button></td>
                                  </tr>
                                )}
                                {fileList.length === 0 &&
                                  <tr>
                                    <td valign='middle' align='center' colSpan="5">No object included</td>
                                  </tr>
                                }
                              </tbody>
                            </Table>
                            {error.bodyList && <span className="error">{error.bodyList}</span>}
                          </div>
                        </div>
                      }
                      {currentStep === 3 &&
                        <div className='row'>
                          <div className='col-12'>
                            <label className='form-label'>
                              Date and Time Interval
                              <OverlayTrigger placement="top" overlay={<Tooltip>Occultation dates to perform prediction (UTC).</Tooltip>}>
                                <i className="bi bi-question-circle mx-1"></i>
                              </OverlayTrigger>
                            </label>
                            <Card>
                              <Card.Body>
                                <div className='row'>
                                  <div className='col-12 col-md-6'>
                                    <label className="form-label">
                                      Start time <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>UTC date and time</Tooltip>}>
                                        <i className="bi bi-question-circle mx-2"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <DateInput
                                      id="initialDate"
                                      name="initialDate"
                                      type="date"
                                      className="form-control"
                                      value={initialDate}
                                      onChange={(date) => setInitialDate(date)}
                                    />
                                    {error.initialDate && <span className='error'>{error.initialDate}</span>}
                                  </div>
                                  <div className='col-12 col-md-6'>
                                    <label className="form-label">
                                      End time <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>UTC date and time</Tooltip>}>
                                        <i className="bi bi-question-circle mx-2"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <DateInput
                                      id="finalDate"
                                      name="finalDate"
                                      type="date"
                                      className="form-control"
                                      value={finalDate}
                                      onChange={(date) => setFinalDate(date)}
                                    />
                                    {error.finalDate && <span className='error'>{error.finalDate}</span>}
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                          {error.dateRange && <div className='col-12 error'>{error.dateRange}</div>}
                          <div className='col-12'>
                            <label className='col-form-label'>Prediction Parameters</label>
                            <Card>
                              <Card.Body>
                                <div className='row'>
                                  <div className='col-12 col-md-6'>
                                    <label className="form-label">
                                      Star Magnitude Limit <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>Maximum star magnitude for prediction.</Tooltip>}>
                                        <i className="bi bi-question-circle mx-1"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <input className="form-control" type="number" value={display(limiting)} onChange={(e) => setLimiting(parseInt(e.target.value))} />
                                    {error.limiting && <span className="error">{error.limiting}</span>}
                                    {warning.limiting && <span className="text-warning" style={{ fontSize: '12px' }}>{warning.limiting}</span>}
                                  </div>
                                  <div className='col-12 col-md-6'>
                                    <label className="form-label">
                                      Catalogue <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>Stellar catalogue used to perform prediction.</Tooltip>}>
                                        <i className="bi bi-question-circle mx-1"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <Form.Select value={catalogue} className="form-control" onChange={(e) => setCatalogue(catalogues[e.target.selectedIndex].value)}>
                                      {catalogues.map((element, index) => <option key={index} value={element.value}>{element.name}</option>)}
                                    </Form.Select>
                                    {error.catalogue && <span className="error">{error.catalogue}</span>}
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        </div>
                      }
                      {currentStep === 4 &&
                        <div className='row'>
                          <div className='col-12'>
                            <Card>
                              <Card.Body>
                                <div className='row'>
                                  <div className='col-12 col-md-6'>
                                    <label className="form-label">
                                      Search Step (s) <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>Step in time to calculate predictions.</Tooltip>}>
                                        <i className="bi bi-question-circle mx-1"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <input className="form-control" type="number" value={display(search)} onChange={(e) => setSearch(parseInt(e.target.value))} />
                                    {error.searchStep && <span className="error">{error.searchStep}</span>}
                                  </div>
                                  <div className='col-7 col-md-6'>
                                    <label className="form-label">
                                      Segment (divs) <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>Number of divisions on the stellar catalogue to perform search. Recommended bigger number if object has the gallactic center as background.</Tooltip>}>
                                        <i className="bi bi-question-circle mx-1"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <input className="form-control" type="number" value={display(segment)} onChange={(e) => setSegment(parseInt(e.target.value))} />
                                    {error.segment && <span className="error">{error.segment}</span>}
                                  </div>
                                  <div className='col-12 col-md-5'>
                                    <label className="col-form-label">
                                      Off-Earth Sigma <span className='require'>*</span>
                                      <OverlayTrigger placement="top" overlay={<Tooltip>Use (Earth radius + ephemeride uncertainty*sigma) to perform search.</Tooltip>}>
                                        <i className="bi bi-question-circle mx-1"></i>
                                      </OverlayTrigger>
                                    </label>
                                    <input className="form-control" type="number" value={display(offEarth)} onChange={(e) => setOffEarth(parseInt(e.target.value))} />
                                    {error.offEarth && <span className="error">{error.offEarth}</span>}
                                    {warning.offEarth && <span className="text-warning" style={{ fontSize: '12px' }}>{warning.offEarth}</span>}
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        </div>
                      }
                      {currentStep === 5 &&
                        <div className='row'>
                          <div className='col-12'>
                            <textarea className="form-control conf-textarea summary" rows="25" defaultValue={summary} />
                          </div>
                          {error.save &&
                            <div className='col-12 mt-2'>
                              <span className='text-danger'>{error.save}</span>
                            </div>
                          }
                        </div>
                      }
                    </Card.Body>
                    <Card.Footer className='text-center'>
                      {currentStep > 1 && <button type="button" className="btn btn-primary me-2" onClick={previusStep}> <i className="bi bi-arrow-left"></i> Back</button>}
                      <Link to="/select-project" className='me-2'><button type="button" className="btn btn-secondary"><i className="bi bi-x-lg"></i> Cancel</button></Link>
                      {currentStep < 5 && <button type="button" className="btn btn-primary me-2" onClick={nextStep}>Next <i className="bi bi-arrow-right"></i></button>}
                      {currentStep === 5 && <button type="button" className="btn btn-success" onClick={() => setShowSave(true)}> <i className="bi bi-check-lg"></i> Save</button>}
                    </Card.Footer>
                  </Card>
                </div >
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Modal show={showEditBody} onHide={() => setShowEditBody(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Radius</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input className="form-control" type="number" name="radius" value={display(selectedBodyRadius)} onChange={(e) => setSelectedBodyRadius(parseFloat(e.target.value))} />
          {radiusError && <span className='error'>{radiusError}</span>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={saveBodyEdition}>
            <i className="bi bi-check-lg"></i> Save
          </Button>
          <Button variant="secondary" onClick={() => setShowEditBody(false)}>
            <i className="bi bi-x"></i> Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSave} onHide={() => setShowSave(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>After clicking on save it will not be possible to change parameters for this prediction.</label>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={save}>
            <i className="bi bi-check-lg"></i> Save
          </Button>
          <Button variant="secondary" onClick={() => setShowSave(false)}>
            <i className="bi bi-x"></i> Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      {loader}
    </>
  );
}