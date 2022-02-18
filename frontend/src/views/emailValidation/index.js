
import React, { Component, createRef } from 'react';
import UserService from '../../services/userService';
import { useParams } from "react-router-dom";

const userService = new UserService();

function withRouter(Children){
    return(props)=>{

       const match  = {params: useParams()};
       return <Children {...props}  match = {match}/>
   }
 }

class EmailValidationPage extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.codigo = createRef('');
        this.alertMsg = createRef('');
        this.showFriendlyMsg = false;

      }

      componentDidMount(){

      }

      showAlert(msg){
        this.alertMsg = msg;
          this.showMsg = true;
          this.forceUpdate();
          setTimeout(() =>{
            this.showMsg = false;
            this.forceUpdate();
          }, 5000);
      }

      handleSubmit(event) {
        userService.validateEmail(
            this.codigo.current.value
            ).then((result)=>{
            this.showAlert("email successfully validated!");
            }).catch(()=>{
            alert('There was an error! Please re-check your form.');
            });
        event.preventDefault();
      }

      render() {
        return (
          <form className='dialog' onSubmit={this.handleSubmit}>
            <fieldset>
                <legend>Email validation</legend>  
                {(
                  <div>
                      <label>This email has not yet been validated</label>
                      <label>To proceed, is necessary insert the code sent by email.</label>
                      <label>Code:</label>
                      <input className="form-control" type="text" ref={this.codigo}/>
                  </div>                     
                )}
                {this.showMsg && (
                    <label className='friendlyMsg' >{this.alertMsg}"</label>
                )}
                <input className="btn btn-primary" type="submit" value="Submit" />
          </fieldset>  
          </form>
        );
      }
}

export default withRouter(EmailValidationPage)