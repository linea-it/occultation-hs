import  React, { Component, createRef } from  'react';
import  ProjectService  from  '../services/projectService';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const  projectService  =  new  ProjectService();
class  ProjectSelectComponent  extends  Component {

    constructor(props) {
        super(props);
        this.state  = {
            projects: []
        };
        this.handleAbrir  =  this.handleAbrir.bind(this);
        this.handleNovoProjeto  =  this.handleNovoProjeto.bind(this);

        this.project = createRef('');
    }

    componentDidMount() {
        var  self  =  this;
        projectService.list().then(function (result) {
            self.setState({ projects:  result.data })
        });
    }

    handleAbrir(event){
        var id = this.project.current.value
        this.navegarPara('/workspace/'+id)
        event.preventDefault();
    }

    navegarPara(caminho){
        let url = window.location.href;
        let pos = url.lastIndexOf('/');
        url = url.substr(0,pos)+caminho;
        console.log(url);
        document.location.assign(url);
    }

    handleNovoProjeto(event){
        this.navegarPara('/project')
        event.preventDefault();
    }
    render() {
        return (
            <form className='dialog'>
            <fieldset>
                <legend>Project Select</legend>
                <label htmlFor="tbxProjeto">Project:</label>
                <Form.Select className="form-control mb-4" id="tbxProjeto" name="tbxProjeto" ref={this.project} autoFocus aria-label="Default select example">
                    { this.state.projects.map((element, index) => <option key={index}>{element.name}</option>) }
                </Form.Select>
                <button className="btn btn-primary mx-1" id="AbrirProjeto" name="AbrirProjeto" onClick={ this.handleAbrir }>Abrir</button>
                <button className="btn btn-secondary mx-1" id="NovoProjeto" name="NovoProjeto" onClick={ this.handleNovoProjeto }>Novo</button>
            </fieldset>              
          </form>
        );
    }
}
export  default  ProjectSelectComponent;