import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './new-project.css';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import InputMask from 'react-input-mask';
import SoraTitleCompoment from '../../../compoment/sora-title/sora-title';
import { toast } from 'react-toastify';
import ProjectService from '../../../services/projectService';
import PageLoader from '../../../compoment/page-loader';

const projectService = new ProjectService();

export default function NewProjectPage() {
  const history = useHistory(); 
  // Step
  const [step1, setStep1] = useState(true);
  const [step1Css, setStep1Css] = useState('');
  const [step2, setStep2] = useState(false);
  const [step2Css, setStep2Css] = useState('');
  const [step3, setStep3] = useState(false);
  const [step3Css, setStep3Css] = useState('');
  const [step4, setStep4] = useState(false);
  const [step4Css, setStep4Css] = useState('');
  const [step5, setStep5] = useState(false);
  const [step5Css, setStep5Css] = useState('');
  const [currentStep, setStep] = useState(1);
  //--//

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [errorProjectName, setErrorProjectName] = useState(false);
  const [errorDescription, setErrorDescription] = useState(false);

  const [bodyName, setBodyName] = useState('');
  const [ephemerisFile, setEphemerisFile] = useState('Horizons');
  const [fileList, setFileList] = useState([]);
  const [labelEphemeris, setLabelEphemeris] = useState('Name');
  const [errorValidade, setErrorValidade] = useState(false);
  const [errorBody, setErroBody] = useState(false);
  const [errorEphemerisFile, setErrorEphemerisFile] = useState(false);
  const [errorListFiles, setErrorListFiles] = useState(false);

  const [initialDate, setInitialDate] = useState('');
  const [finalDate, setFinalDate] = useState('');
  const [limiting, setLimiting] = useState('10');
  const [search, setSearch] = useState('60');
  const [segment, setSegment] = useState('1');
  const [automatic, setAutomatic] = useState(false);
  const [errorLimiting, setErrorLimiting] = useState(false);
  const [errorSearch, setErrorSearch] = useState(false);
  const [errorSegment, setErrorSegment] = useState(false);
  const [errorInitialDate, setErrorInitialDate] = useState(false);
  const [errorFinalDate, setErrorFinalDate] = useState(false);

  const [catalogue, setCatalogue] = useState('gaiaedr3');
  const [offEarth, setOffEarth] = useState('1');
  const [radius, setRadius] = useState('12');
  const [reference, setReference] = useState('geocenter');
  const [errorCatalogue, setErrorCatalogue] = useState(false);
  const [errorOffEarth, setErrorOffEarth] = useState(false);
  const [errorRadius, setErrorRadius] = useState(false);

  const [bSPFile, setBSPFile] = useState('');
  const [errorBSPFile, setErrorBSPFile] = useState(false);

  const [summary, setSummary] = useState('');

  const [erroSaveMessage, setErrorSaveMessage] = useState('');
  const [errorSave, setErrorSave] = useState(false);

  const [loader, showLoader, hideLoader] = PageLoader();

  function addEphemeris() {
    setErrorListFiles(false);
    setErroBody(false);
    setErrorEphemerisFile(false);
    setErrorValidade(false);

    if (bodyName === '' || ephemerisFile === '') {
      toast.error('All information must be completed.');
      setErroBody(true);
      setErrorEphemerisFile(true);
      return;
    }
    showLoader();
    projectService.validateBody(bodyName, ephemerisFile, labelEphemeris).then((result) => {      
      let listEphemeris = fileList.length === 0 ? [] : fileList;

      const verifyList = listEphemeris.some((item) => item.bodyName === bodyName);

      if (verifyList) {
        toast.error('Stellar Body already selected.');
        hideLoader();
        return;
      }

      listEphemeris.push({
        bodyName: bodyName,
        elementContent: ephemerisFile,
        elementType: labelEphemeris.toLowerCase(),
      });     

      setFileList(listEphemeris);
      setBodyName('');
      setEphemerisFile('Horizons');
      setLabelEphemeris('Name');
      hideLoader();
    }).catch((error) => {
      hideLoader();
      setErrorValidade(true);
      toast.error('Invalid information.');
    });
  }

  function deleteItem(indice) {
    let listEphemeris = fileList.filter( (valorAtual, pos) => pos!=indice?valorAtual : null );
    setFileList(listEphemeris);
    toast.success('Stellar Body successfully removed');
  }

  function navigate(step) {
    switch (step) {
      case '1':
        setStep1(true);
        setStep1Css('active');
        setStep2(false);
        setStep2Css('');
        setStep3(false);
        setStep3Css('');
        setStep4(false);
        setStep4Css('');
        setStep5(false);
        setStep5Css('');
        break;
      case '2':
        setStep1(false);
        setStep1Css('completed');
        setStep2(true);
        setStep2Css('active');
        setStep3(false);
        setStep3Css('');
        setStep4(false);
        setStep4Css('');
        setStep5(false);
        setStep5Css('');
        break;
      case '3':
        setStep1(false);
        setStep1Css('completed');
        setStep2(false);
        setStep2Css('completed');
        setStep3(true);
        setStep3Css('active');
        setStep4(false);
        setStep4Css('');
        setStep5(false);
        setStep5Css('');
        break;
      case '4':
        setStep1(false);
        setStep1Css('completed');
        setStep2(false);
        setStep2Css('completed');
        setStep3(false);
        setStep3Css('completed');
        setStep4(true);
        setStep4Css('active');
        setStep5(false);
        setStep5Css('');
        break;
      case '5':
        fillOutSummary();
        setStep1(false);
        setStep1Css('completed');
        setStep2(false);
        setStep2Css('completed');
        setStep3(false);
        setStep3Css('completed');
        setStep4(false);
        setStep4Css('completed');
        setStep5(true);
        setStep5Css('active');
        break;
      default:
        break;
    }
    setStep(step);
  }

  function strToDateTime(strDate)
  {
      const v = strDate.split(/-| |:/);
      return new Date(v[0],v[1],v[2],v[3],v[4],v[5]);
  }

  function save() {
    showLoader();
    setErrorSave(false);
    setErrorSaveMessage('');
    setErrorDescription(false);
    setErrorProjectName(false);
    setErrorListFiles(false);
    setErrorInitialDate(false);
    setErrorFinalDate(false);
    setErrorLimiting(false);
    setErrorSearch(false);
    setErrorSegment(false);
    setErrorCatalogue(false);
    setErrorOffEarth(false);
    setErrorRadius(false);
    setErrorBSPFile(false);

    if (!verifyErros()) {
      let infoProject = {
        "name": projectName,
        "description": description,
        "bodys": fileList,
        "initialDateTime": strToDateTime(initialDate),
        "finalDateTime": strToDateTime(finalDate),
        "limitingMagnitude": parseInt(limiting),
        "searchStep": parseInt(search),
        "segments": parseInt(segment),
        "automaticSegments": automatic,
        "catalogue": catalogue,
        "offEarthSigma":  parseInt(offEarth),
        "radius": parseInt(radius),
        "referenceCenter": reference,
        "referenceCenterBSPFile": bSPFile
      }

      projectService.create(infoProject).then((result) => {
        hideLoader();
        toast.success('Project created successfully');
        history.push('/select-project');
      }).catch((error) => {
        hideLoader();
        setErrorSave(true);
        toast.error(error);
        setErrorSaveMessage(error);
      });
    }
    else { hideLoader(); }
  }

  function verifyErros() {
    let error = false;
    if (projectName === '') {
      setErrorDescription(true);
      error = true;
    }

    if (description === '') {
      setErrorProjectName(true);
      error = true;
    }

    if (fileList.length === 0) {
      setErrorListFiles(true);
      error = true;
    }

    if (initialDate === '') {
      setErrorInitialDate(true);
      error = true;
    }

    if (finalDate === '') {
      setErrorFinalDate(true);
      error = true;
    }

    if (limiting === '') {
      setErrorLimiting(true);
      error = true;
    }

    if (search === '') {
      setErrorSearch(true);
      error = true;
    }

    if (!automatic) {
      if (segment === '') {
        setErrorSegment(true);
        error = true;
      }
    }

    if (catalogue === '') {
      setErrorCatalogue(true);
      error = true;
    }

    if (offEarth === '') {
      setErrorOffEarth(true);
      error = true;
    }

    if (radius === '') {
      setErrorRadius(true);
      error = true;
    }

    if (reference !== 'geocenter') {
      if (bSPFile === '') {
        setErrorBSPFile(true);
        error = true;
      }
    }

    if (error)
      toast.error('All information must be completed.');

    return error;
  }

  function getBase64(file) {
    return new Promise(resolve => {
      let baseURL = "";
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        baseURL = reader.result.substr(reader.result.indexOf(',') + 1);
        resolve(baseURL);
      };
    });
  };

  function handleFileInputChange(e) {
    showLoader();
    let file = e.target.files[0];
    getBase64(file)
      .then(result => {
        setEphemerisFile(result);
        hideLoader();
      })
      .catch(err => {
        hideLoader();
        setErrorValidade(true);
        toast.error('Invalid file.');
      });
  };

  function handleFileBSPInputChange(e) {
    showLoader();
    let file = e.target.files[0];
    getBase64(file)
      .then(result => {
        setBSPFile(result);
        hideLoader();
      })
      .catch(err => {
        hideLoader();
        setErrorBSPFile(true);
        toast.error('Invalid file.');
      });
  }

  function handleChangeAutomatica() {
    if (!automatic)
      setAutomatic(true);
    else
      setAutomatic(false);

    if (!automatic) {
      setSegment('');
    }
  };

  const handleChangeReference = (e) => {
    setReference(e);
    setErrorBSPFile(false);
    if (e === 'geocenter') {
      setBSPFile('');
    }
  };

  function fillOutSummary() {
    let text = '';
    text += '\n1. PROJECT NAME\n\n';
    text += 'Name: ' + projectName + '\n';
    text += 'Description: ' + description;

    text += '\n\n2. STELLAR BODY\n\n';

    if (fileList.length === 0) {
      text += 'Uninformed';
    } else {
      fileList.forEach(element => {
        text += '- ' + element.bodyName;
      });
    }

    text += '\n\n3. TIME RANGE\n\n';
    text += 'Initial Date and Time: ' + initialDate + '\n';
    text += 'Final Date and Time: ' + finalDate + '\n';
    text += 'Limiting Magnitude: ' + limiting + '\n';
    text += 'Search Step (sec.): ' + search + '\n';
    text += 'Segment (divs): ' + segment;

    text += '\n\n4. EXTRA/ADVANCED INFORMATION\n\n';
    text += 'Catalogue: ' + catalogue + '\n';
    text += 'Off-Earth Sigma: ' + offEarth + '\n';
    text += 'Radius: ' + radius + '\n';
    text += 'Reference Center: ' + reference + '\n';
    setSummary(text);
  }

  return (
    <>
      <div className="fullscreen col-12">
        <div className="stepper-wrapper">
          <div className={"stepper-item " + step1Css} onClick={() => navigate('1')}>
            <div className="step-counter">1</div>
            <div className="step-name">Project Name</div>
          </div>
          <div className={"stepper-item " + step2Css} onClick={() => navigate('2')}>
            <div className="step-counter">2</div>
            <div className="step-name">Stellar Body</div>
          </div>
          <div className={"stepper-item " + step3Css} onClick={() => navigate('3')}>
            <div className="step-counter">3</div>
            <div className="step-name">Time Range</div>
          </div>
          <div className={"stepper-item " + step4Css} onClick={() => navigate('4')}>
            <div className="step-counter">4</div>
            <div className="step-name">Extra Information</div>
          </div>
          <div className={"stepper-item " + step5Css} onClick={() => navigate('5')}>
            <div className="step-counter">5</div>
            <div className="step-name">Summary</div>
          </div>
        </div>
        <fieldset>
          <div className="row">
            <div className="col-12">
              {/*<Card className='main-card'>*/}
              {/*<Card.Body>*/}
              {/*<SoraTitleCompoment />*/}
              {/* menu stepper */}
              {/* step 1 */}
              {step1 &&
                <div className='row'>
                  <div className='col-12'>
                    <label className='title'><b>Project Name - Prediction (step {currentStep} of 5)</b></label>
                  </div>
                  <div className='col-12'>
                    <label className="col-form-label label mt-0">Project Name <span className="error">*</span></label>
                    <input className="form-control" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    {errorProjectName ? (<span className="error">Required field</span>) : ''}
                  </div>
                  <div className='col-12'>
                    <label className="col-form-label label mt-0">Description <span className="error">*</span></label>
                    <textarea className="form-control" type="text" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" cols="33"></textarea>
                    {errorDescription ? (<span className="error">Required field</span>) : ''}
                  </div>
                  <div className='row mt-4'>
                    <div className='col-6 text-right'>
                      <button type="button" className="btn btn-primary" onClick={() => navigate('2')}> <i className="bi bi-arrow-right"></i> Next</button>
                    </div>
                    <div className='col-6' align="right">
                      <button type="button" className="btn btn-primary"> <i className="bi bi-x-lg"></i> Cancel</button>
                    </div>
                  </div>
                </div>
              }
              {/* step 2 */}
              {step2 &&
                <div className='row'>
                  <div className='col-12'>
                    <label className='title'><b>Stellar Body - Prediction (step {currentStep} of 5)</b></label>
                  </div>
                  <div className='col-12 mt-3'>
                    <span>Information Stellar Body</span>
                    <Card className="mt-2">
                      <Card.Body className='bodyname'>
                        <div className='row'>
                          <div className='col-12'>
                            <label className="col-form-label label">Body Name: <span className="error">*</span></label>
                            <input className="form-control" type="text" value={bodyName} onChange={(e) => setBodyName(e.target.value)} />
                            {errorBody ? (<span className="error">Required field</span>) : ''}
                          </div>
                          <div className='col-12'>
                            <span className="mb-3">Ephemeris</span>
                            <Card className="mt-2">
                              <Card.Body>
                                <div className='row'>
                                  <div className='col-xs-12 col-md-2'>
                                    <label className="form-label">Ephemeris Type</label>
                                    <div className="input-group mt-3 mb-3">
                                      <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="Ephemeris" value="Name" onChange={(e) => setLabelEphemeris(e.target.value)} checked={labelEphemeris === 'Name'} />
                                        <label className="form-check-label mt-0">
                                          Name
                                        </label>
                                      </div>
                                      <div className="form-check form-check-inline">
                                        <input className="form-check-input" type="radio" name="Ephemeris" value="File" onChange={(e) => setLabelEphemeris(e.target.value)} checked={labelEphemeris !== 'Name'} />
                                        <label className="form-check-label mt-0">
                                          File
                                        </label>
                                      </div>
                                    </div>  </div>
                                  <div className='col-xs-12 col-md-10'>
                                    <label className="form-label">Ephemeris {labelEphemeris} <span className="error">*</span></label>
                                    {labelEphemeris === "File" ? (
                                      <input className="form-control" type="file" name="file" onChange={(e) => handleFileInputChange(e)} />) : (
                                      <input className="form-control" type="text" value={ephemerisFile} onChange={(e) => setEphemerisFile(e.target.value)} />)}
                                    {errorEphemerisFile ? (<span className="error">Required field</span>) : ''}
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className='row'>
                    <div className='col-12 text-center mt-4'>
                      <button type="button" className="btn btn-primary" onClick={() => addEphemeris()}><i className="bi bi-check2"></i> Validade and Insert</button>
                      {errorValidade ? (<span className="error"><br></br><br></br>Invalid information.</span>) : ''}
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-12'>
                      {fileList.length !== 0 ?
                        (<Table responsive striped hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Stellar Body</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {fileList.map((item, index) => {
                              return (<tr key={index}>
                                <td width="80px">{index+1}</td>
                                <td valign='middle'>{item.bodyName}</td>
                                <td width="130px"><button type="button" className="btn btn-light border-btn" onClick={() => deleteItem(item)}><i className="bi bi-trash3"></i> Remove</button></td>
                              </tr>
                              )})}
                          </tbody>
                        </Table>) : (<Card className="mt-4"><Card.Body><span>No Stellar Body was selected</span></Card.Body></Card>)}
                      {errorListFiles ? (<span className="error"> It is necessary to inform the Stellar Body.</span>) : ''}
                    </div>
                  </div>
                  <div className='row mt-4'>
                    <div className='col-9'>
                      <button type="button" className="btn btn-primary" onClick={() => navigate('1')}> <i className="bi bi-arrow-left"></i> Back</button>
                      <button type="button" className="btn btn-primary dist" onClick={() => navigate('3')}> <i className="bi bi-arrow-right"></i> Next</button>
                    </div>
                    <div className='col-3' align="right">
                      <button type="button" align="right" className="btn btn-primary tamanho"><i className="bi bi-x-lg"></i> Cancel</button>
                    </div>
                  </div>
                </div>
              }
              {/* step 3 */}
              {step3 &&
                <div className='row'>
                  <div className='col-12'>
                    <label className='title'><b>Time Range - Prediction (step {currentStep} of 5)</b></label>
                  </div>
                  <div className='row'>
                    <div className='col-12'>
                      <span className="mb-3">Time Range</span>
                      <Card className="mt-2">
                        <Card.Body>
                          <div className='row'>
                            <div className='col-xs-12 col-md-6 mb-2'>
                              <label className="form-label">Initial Date and Time <span className="error">*</span></label>
                              <InputMask className="form-control" type="text" mask='9999-99-99 99:99:99' value={initialDate} onChange={(e) => setInitialDate(e.target.value)} />
                              {errorInitialDate ? (<span className="error">Required field</span>) : ''}
                            </div>
                            <div className='col-xs-12 col-md-6'>
                              <label className="form-label">Final Date and Time <span className="error">*</span></label>
                              <InputMask className="form-control" type="text" mask='9999-99-99 99:99:99' value={finalDate} onChange={(e) => setFinalDate(e.target.value)} />
                              {errorFinalDate ? (<span className="error">Required field</span>) : ''}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                  <div className='row mt-2'>
                    <div className='col-12'>
                      <span className="mb-3">Performance / Precision</span>
                      <Card className="mt-2">
                        <Card.Body>
                          <div className='row'>
                            <div className='col-xs-12 col-md-3 mb-2'>
                              <label className="form-label">Limiting Magnitude <span className="error">*</span></label>
                              <input className="form-control" type="number" value={limiting} onChange={(e) => setLimiting(e.target.value)} />
                              {errorLimiting ? (<span className="error">Required field</span>) : ''}
                            </div>
                            <div className='col-xs-12 col-md-3 mb-2'>
                              <label className="form-label">Search Step (sec.) <span className="error">*</span></label>
                              <input className="form-control" type="number" value={search} onChange={(e) => setSearch(e.target.value)} />
                              {errorSearch ? (<span className="error">Required field</span>) : ''}
                            </div>
                            <div className='col-7 col-md-3 mb-2'>
                              <label className="form-label">Segment (divs) <span className="error">*</span></label>
                              <input className="form-control" type="number" value={segment} onChange={(e) => setSegment(e.target.value)} readOnly={automatic} />
                              {errorSegment ? (<span className="error">Required field</span>) : ''}
                            </div>
                            <div className='col-5 col-md-3 mb-2'>
                              <div className="form-check mt-5">
                                <input className="form-check-input" type="checkbox" checked={automatic} onChange={handleChangeAutomatica} />
                                <label className="form-check-label">
                                  Automatic
                                </label>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                  <div className='row mt-4'>
                    <div className='col-9'>
                      <button type="button" className="btn btn-primary" onClick={() => navigate('2')}> <i className="bi bi-arrow-left"></i> Back</button>
                      <button type="button" className="btn btn-primary dist" onClick={() => navigate('4')}> <i className="bi bi-arrow-right"></i> Next</button>
                    </div>
                    <div className='col-3' align="right">
                      <button type="button" align="right" className="btn btn-primary tamanho"><i className="bi bi-x-lg"></i> Cancel</button>
                    </div>
                  </div>
                </div>
              }
              {/* step 3 */}
              {/* {step3 &&
                  <div className='row'>
                    <div className='col-12 text-center mb-3'>
                      <h3>Project Creation - Prediction (step 3 of 4)</h3>
                    </div>
                    <div className='col-12 mb-3'>
                      <span className='title'><b>Extra/Advanced Information</b></span>
                    </div>
                  </div>
              </div>
            } */}
              {/* step 4 */}
              {step4 &&
                <div className='row'>
                  <div className='col-12'>
                    <label className='title'><b>Extra/Advanced Information - Prediction (step {currentStep} of 5)</b></label>
                  </div>
                  <div className='row'>
                    <div className='col-12'>
                      <Card className="mt-2">
                        <Card.Body>
                          <div className='row'>
                            <div className='col-xs-12 col-md-4'>
                              <label className="form-label">Catalogue <span className="error">*</span></label>
                              <input className="form-control" type="text" value={catalogue} onChange={(e) => setCatalogue(e.target.value)} />
                              {errorCatalogue ? (<span className="error">Required field</span>) : ''}
                            </div>
                            <div className='col-xs-12 col-md-4'>
                              <label className="form-label">Off-Earth Sigma <span className="error">*</span></label>
                              <input className="form-control" type="text" value={offEarth} onChange={(e) => setOffEarth(e.target.value)} />
                              {errorOffEarth ? (<span className="error">Required field</span>) : ''}
                            </div>
                            <div className='col-xs-12 col-md-4'>
                              <label className="form-label">Radius <span className="error">*</span></label>
                              <input className="form-control" type="text" value={radius} onChange={(e) => setRadius(e.target.value)} />
                              {errorRadius ? (<span className="error">Required field</span>) : ''}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-12'>
                      <label>Reference Center <span className="error">*</span></label>
                    </div>
                    <div className='col-12'>
                      <Card>
                        <Card.Body>
                          <div className='row'>
                            <div className='col-12'>
                              <div className="form-check">
                                <input className="form-check-input" type="radio" name="referenceCenter" value="geocenter" onChange={(e) => handleChangeReference(e.target.value)} checked={reference === 'geocenter'} />
                                <label className="form-check-label">
                                  Geocenter
                                </label>
                              </div>
                              <div className="form-check">
                                <input className="form-check-input" type="radio" name="referenceCenter" value="space Craft" onChange={(e) => handleChangeReference(e.target.value)} checked={reference !== 'geocenter'} />
                                <label className="form-check-label">
                                  Space Craft
                                </label>
                              </div>
                              {reference !== 'geocenter' &&
                                <div className='col-12'>
                                  <label className="form-label">Path BSP File<span className="error">*</span></label>
                                  <input className="form-control" type="file" name="fileBSP" onChange={(e) => handleFileBSPInputChange(e)} />
                                  {errorBSPFile ? (<span className="error">Required field</span>) : ''}
                                </div>}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='row mt-4'>
                      <div className='col-9'>
                        <button type="button" className="btn btn-primary" onClick={() => navigate('3')}> <i className="bi bi-arrow-left"></i> Back</button>
                        <button type="button" className="btn btn-primary dist" onClick={() => navigate('5')}> <i className="bi bi-arrow-right"></i> Next</button>
                      </div>
                      <div className='col-3' align="right">
                        <button type="button" align="right" className="btn btn-primary tamanho"><i className="bi bi-x-lg"></i> Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              }
              {/* step 4 */}
              {/* {step4 &&
              <div className='row'>
                <div className='col-12 mt-2 mb-1'>
                  <span className='title'><b>Abstract</b></span>
                </div>
                } */}
              {/* step 5 */}
              {step5 &&
                <div className='row'>
                  <div className='col-12'>
                    <label className='title'><b>Summary - Prediction (step {currentStep} of 5)</b></label>
                  </div>
                  <div className='row mt-2'>
                    <div className='col-12'>
                      <textarea className="form-control conf-textarea summary" rows="20" defaultValue={summary}/>
                                          </div>
                  </div>
                  <div className='row mt-4'>
                    <div className='col-9'>
                      <button type="button" className="btn btn-primary" onClick={() => navigate('4')}> <i className="bi bi-arrow-left"></i> Back</button>
                      <button type="button" className="btn btn-success dist" onClick={save}> <i className="bi bi-check-lg"></i> Save</button>
                    </div>
                    <div className='col-3' align="right">
                      <button type="button" align="right" className="btn btn-primary tamanho"><i className="bi bi-x-lg"></i> Cancel</button>
                    </div>
                  </div>
                  {errorSave &&
                    <div className='col-12 text-center'>
                      {erroSaveMessage}
                    </div>}
                </div>
                // </div>
              }
              {/*</Card.Body>*/}
              {/*</Card>*/}
            </div>
          </div>
        </fieldset>
      </div >
      {loader}
    </>
  );
}