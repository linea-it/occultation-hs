import React, { Component } from 'react';
import './project.css';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import InputMask from 'react-input-mask';

class NewProjectComponet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step1: true,
      step1Css: 'stepper-item active',
      step2: false,
      step2Css: 'stepper-item',
      step3: false,
      step3Css: 'stepper-item',
      step4: false,
      step4Css: 'stepper-item',

      ephemerisFile: '',
      fileList: [],
      labelEphemeris: 'File',

      form: {
        bodyName: '',
        initialDate: '',
        finalDate: '',
        limiting: '',
        search: '',
        segment: ''
      }
    };

    this.navigate = this.navigate.bind(this);
    this.dataForm = this.dataForm.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.addEphemeris = this.addEphemeris.bind(this);
    this.optionsEphemeris = this.optionsEphemeris.bind(this);
    this.dataFormEphemerisFile = this.dataFormEphemerisFile.bind(this);
  }

  componentDidMount() {
    this.setState({ fileList: [] });
    let listFile = this.state.fileList;
    listFile.push('oi');
  }

  dataFormEphemerisFile(e) {
    this.setState({ ephemerisFile: e.target.value });
  }

  optionsEphemeris(e) {
    this.setState({ labelEphemeris: e.target.value });
  }

  addEphemeris(event) {
    event.preventDefault();
    let listFile = this.state.fileList;
    listFile.push(this.state.ephemerisFile);
    this.setState({ ephemerisFile: '' });
    this.setState({ fileList: listFile });
    //event.preventDefault();
    //this.forceUpdate();
  }

  deleteItem(e) {
    let listFile = this.state.fileList;
    let indice = listFile.indexOf(e);
    listFile.splice(indice, 1);
    this.setState({ listFile: listFile });
    e.preventDefault();
  }

  dataForm(e) {
    let form = this.state.form;
    form[e.target.name] = e.target.value;
    this.setState({ form: form });
  }

  navigate(step) {
    switch (step) {
      case '1':
        this.setState({
          step1: true,
          step1Css: 'stepper-item active',
          step2: false,
          step2Css: 'stepper-item',
          step3: false,
          step3Css: 'stepper-item',
          step4: false,
          step4Css: 'stepper-item'
        });
        break;
      case '2':
        this.setState({
          step1: false,
          step1Css: 'stepper-item completed',
          step2: true,
          step2Css: 'stepper-item active',
          step3: false,
          step3Css: 'stepper-item',
          step4: false,
          step4Css: 'stepper-item'
        });
        break;
      case '3':
        this.setState({
          step1: false,
          step1Css: 'stepper-item completed',
          step2: false,
          step2Css: 'stepper-item completed',
          step3: true,
          step3Css: 'stepper-item active',
          step4: false,
          step4Css: 'stepper-item'
        });
        break;
      case '4':
        this.setState({
          step1: false,
          step1Css: 'stepper-item completed',
          step2: false,
          step2Css: 'stepper-item completed',
          step3: false,
          step3Css: 'stepper-item completed',
          step4: true,
          step4Css: 'stepper-item active'
        });
        break;
      default:
        break;
    }
  }

  // componentDidMount() {
  //   setTimeout(this.carregamento, 0, this);
  // }

  carregamento(self) {
    // let delay = document.getElementById("delay");
    // const valor = delay.value;
    // if (valor === 100)
    //   self.proximo();
    // else {
    //   delay.value = valor + 1;
    //   setTimeout(self.carregamento, 5 * 10, self);
    // }
  }

  render() {
    return (
      <div className='container'>
        {/* menu stepper */}
        <div className='row'>
          <div className='col-12'>
            <div className="stepper-wrapper">
              <div className={this.state.step1Css} onClick={() => this.navigate('1')}>
                <div className="step-counter">1</div>
                <div className="step-name">First</div>
              </div>
              <div className={this.state.step2Css} onClick={() => this.navigate('2')}>
                <div className="step-counter">2</div>
                <div className="step-name">Second</div>
              </div>
              <div className={this.state.step3Css} onClick={() => this.navigate('3')}>
                <div className="step-counter">3</div>
                <div className="step-name">Third</div>
              </div>
              <div className={this.state.step4Css} onClick={() => this.navigate('4')}>
                <div className="step-counter">4</div>
                <div className="step-name">Forth</div>
              </div>
            </div>
          </div>
        </div>
        {/* step 1 */}
        {this.state.step1 &&
          <div className='row'>
            <div className='col-12 text-center mb-3'>
              <span className='titulo'>Project Creation - Prediction (step 1 of 4)</span>
            </div>
            <div className='col-12 mb-3'>
              <span className='subtitulo'>Select The Stellar Body</span>
            </div>
            <div className='row'>
              <div className='col-12 line'>
                <div className='label-body'>
                  <label className="col-form-label label">Body Name:</label></div>
                <div className='input-body'><input className="form-control" type="text" name="bodyName" value={this.state.form.bodyName} onChange={this.dataForm}></input></div>
              </div>
            </div>
            <div className='row'>
              <div className='col-12 mt-3'>
                <span className="mb-3">Ephemeris</span>
                <Card className="mt-2">
                  <Card.Body>
                    <div className='row'>
                      <div className='col-12'>
                        <div className="row mb-3">
                          <label className="col-sm-2 col-form-label">Ephemeris</label>
                          <div className="col-sm-10 mt-2">
                            <div className="form-check form-check-inline">
                              <input className="form-check-input" type="radio" name="Ephemeris" value="Name" id="Name" onChange={this.optionsEphemeris}></input>
                              <label className="form-check-label">
                                Name
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input className="form-check-input" type="radio" name="Ephemeris" value="File" id="File" onChange={this.optionsEphemeris}></input>
                              <label className="form-check-label">
                                File
                              </label>
                            </div>
                          </div></div></div>
                      <div className='col-12'>
                        <div className="mb-3 row">
                          <label className="col-sm-2 col-form-label">Ephemeris {this.state.labelEphemeris}</label>
                          <div className="col-sm-10">
                            {this.state.labelEphemeris === "File" ? (
                              <input className="form-control" type="file" onChange={this.dataFormEphemerisFile} value={this.state.ephemerisFile}></input>) : (
                              <input className="form-control" type="text" onChange={this.dataFormEphemerisFile} value={this.state.ephemerisFile}></input>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div></div>
            <div className='row'>
              <div className='col-12 text-center mt-4'>
                <button type="button" className="btn btn-primary" onClick={(event) => this.addEphemeris(event)}><i className="bi bi-check2"></i> Validade and Insert</button>
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Body Name</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!this.state.listFile ? (<tr><td>xxxx</td></tr>) : this.state.listFile.map((item) => {
                      return (<tr>
                        <td valign='middle'>{item}</td>
                        <td className='celula'><button type="button" className="btn btn-light border-btn" onClick={() => this.deleteItem(item)}><i className="bi bi-trash3"></i> Remove</button></td>
                      </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
            <div className='row mt-4'>
              <div className='col-6 text-center'>
                <button type="button" className="btn btn-primary" onClick={() => this.navigate('2')}> <i className="bi bi-arrow-right"></i> Next</button>
              </div>
              <div className='col-6 text-center'>
                <button type="button" className="btn btn-primary"> <i className="bi bi-x-lg"></i> Cancel</button>
              </div>
            </div>
          </div>
        }
        {/* step 2 */}
        {this.state.step2 &&
          <div className='row'>
            <div className='col-12 text-center mb-3'>
              <span className='titulo'>Project Creation - Prediction (step 2 of 4)</span>
            </div>
            <div className='col-12 mb-3'>
              <span className='subtitulo'>Select Time Range</span>
            </div>
            <div className='row'>
              <div className='col-12'>
                <span className="mb-3">Time Range</span>
                <Card className="mt-2">
                  <Card.Body>
                    <div className='row'>
                      <div className='col-12'>
                        <div className="mb-3 row">
                          <label className="col-sm-2 col-form-label">Initial Date and Time</label>
                          <div className="col-sm-10">
                            <InputMask className="form-control" type="text" mask='99/99/9999 99:99:99' name="initialDate" onChange={this.dataForm} value={this.state.form.initialDate}></InputMask>
                          </div></div>
                      </div>
                      <div className='col-12'>
                        <div className="mb-3 row">
                          <label className="col-sm-2 col-form-label">Final Date and Time</label>
                          <div className="col-sm-10">
                            <InputMask className="form-control" type="text" mask='99/99/9999 99:99:99' name="finalDate" onChange={this.dataForm} value={this.state.form.finalDate}></InputMask>
                          </div></div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <span className="mb-3">Performance / Precision</span>
                <Card className="mt-2">
                  <Card.Body>
                    <div className='row'>
                      <div className='col-12'>
                        <div className="mb-3 row">
                          <label className="col-sm-2 col-form-label">Limiting Magnitude</label>
                          <div className="col-sm-10">
                            <input className="form-control" type="number" name="limiting" onChange={this.dataForm} value={this.state.form.limiting}></input>
                          </div></div>
                      </div>
                      <div className='col-12'>
                        <div className="mb-3 row">
                          <label className="col-sm-2 col-form-label">Search Step (sec.)</label>
                          <div className="col-sm-10">
                            <input className="form-control" type="number" name="search" onChange={this.dataForm} value={this.state.form.search}></input>
                          </div></div>
                      </div>
                      <div className='col-12'>
                        <div className="mb-3 row">
                          <label className="col-sm-2 col-form-label">Segment (divs)</label>
                          <div className="col-sm-10">
                            <input className="form-control" type="number" name="segment" onChange={this.dataForm} value={this.state.form.segment}></input>
                          </div></div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
            <div className='row mt-4'>
              <div className='col-4 text-center'>
                <button type="button" className="btn btn-primary" onClick={() => this.navigate('1')}> <i className="bi bi-arrow-left"></i> Back</button>
              </div>
              <div className='col-4 text-center'>
                <button type="button" className="btn btn-primary" onClick={() => this.navigate('3')}> <i className="bi bi-arrow-right"></i> Next</button>
              </div>
              <div className='col-4 text-center'>
                <button type="button" className="btn btn-primary"> <i className="bi bi-x-lg"></i> Cancel</button>
              </div>
            </div>
          </div>
        }
        {/* step 3*/}

        {/* step 4 */}
      </div>
    );
  }
}

export default NewProjectComponet;