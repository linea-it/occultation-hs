import React, { Component, createRef } from 'react';
import UserService from '../services/userService';
import { useParams } from "react-router-dom";

const userService = new UserService();

function withRouter(Children){
    return(props)=>{

       const match  = {params: useParams()};
       return <Children {...props}  match = {match}/>
   }
 }

class UserComponent extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.userName = createRef('');
        this.email = createRef('');
        this.password = createRef('');
        this.confirmPassword = createRef('');
        this.newPassword = createRef('');
        this.oldPassword = createRef('');
        this.confirmNewPassword = createRef('');
      }

      componentDidMount(){
        if (this.isUpdate()){
            const params= this.props.match?.params;
            userService.get(params.id).then((c)=>{
                this.userName.current.value = c.username;
                this.email.current.value = c.email;
          })
        }
      }

      handleCreate(){
        userService.create(
          {
            "username": this.userName.current.value,
            "email": this.email.current.value,
            "password": this.password.current.value,
            "confirm_password": this.confirmPassword.current.value
        }
        ).then((result)=>{
          alert("User created!");
        }).catch(()=>{
          alert('There was an error! Please re-check your form.');
        });
      }
      handleUpdate(id){
        userService.update(
          {
            "id": id,
            "username": this.userName.current.value,
            "email": this.email.current.value,
        }
        ).then((result)=>{
          console.log(result);
          alert("user updated!");
        }).catch(()=>{
          alert('There was an error! Please re-check your form.');
        });
      }

      handleUpdatePassword(id){
        userService.changePassword(
            this.oldPassword.current.value,this.newPassword.current.value, this.confirmNewpassword.current.value
        ).then((result)=>{
          console.log(result);
          alert("Password updated!");
        }).catch(()=>{
          alert('There was an error! Please re-check your form.');
        });
      }

      isUpdate() { 
        const params= this.props.match?.params;
        return params && params.id && parseInt(params.id);
      }
      isChangePassword() { 
        const params= this.props.match?.params;
        return params && params.id && params.id==='change-password';
      }
      isCreate(){
        const params= this.props.match?.params;
        return params && params.id && params.id==='new';
      }

      handleSubmit(event) {
        if(this.isUpdate())
        {
            const { match: { params } } = this.props;
            this.handleUpdate(params.id);
        }
        else if (this.isChangePassword())
          this.handleUpdatePassword();
        else
          this.handleCreate();

        event.preventDefault();
      }

      render() {
        return (
          <form className='dialog' onSubmit={this.handleSubmit}>
            <fieldset>
                <legend>Login</legend>
            {!this.isChangePassword() && (
              <div>
                <label>User Name:</label>
                <input className="form-control" type="text" ref={this.userName} />
                <label>E-Mail:</label>
                <input className="form-control" type="email" ref={this.email}/>
                {!this.isUpdate() && (
                  <div>
                    <label>Password:</label>
                    <input className="form-control" type="password" ref={this.password} />

                    <label>Confirm Password:</label>
                    <input className="form-control" type="password" ref={this.confirmPassword} />
                  </div>)}
              </div>)}
              {this.isChangePassword()&&(
                <div>
                    <label>Password:</label>
                    <input className="form-control" type="password" ref={this.oldPassword} />
                    
                    <label>New Password:</label>
                    <input className="form-control" type="password" ref={this.newPassword} />

                    <label>Confirm New Password:</label>
                    <input className="form-control" type="password" ref={this.confirmNewPassword}/>
                </div>                     
              )}         
              <input className="btn btn-primary" type="submit" value="Submit" />
          </fieldset>  
          </form>
        );
      }
}

export default withRouter(UserComponent)


/*
<div visibility={this.isChangePassword()?"hidden":"visible"}>
                    <label>User Name:</label>
                    <input className="form-control" type="text" ref='username' />
                    <label>E-Mail:</label>
                    <input className="form-control" type="email" ref='email'/>

                    <div visibility={this.isUpdate()?"hidden":"visible"}>
                        <label>Password:</label>
                        <input className="form-control" type="password" ref='password' />

                        <label>Confirm Password:</label>
                        <input className="form-control" type="password" ref='confirmPassword' />
                    </div>
                </div>
                <div visibility={this.isChangePassword()?"visible":"hidden"}>
                    <label>Password:</label>
                    <input className="form-control" type="password" ref='oldPassword' />
                    
                    <label>New Password:</label>
                    <input className="form-control" type="password" ref='newPassword' />

                    <label>Confirm New Password:</label>
                    <input className="form-control" type="password" ref='confirmNewPassword'/>
                </div>
*/