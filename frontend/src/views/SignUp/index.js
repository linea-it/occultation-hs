
import { useState, useEffect } from 'react';
import UserService from '../../services/userService';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const userService = new UserService();

export default function SignUpPage() {
    const history = useHistory();
    const { id } = useParams();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useEffect( () => {
        if (isUpdate()){
            userService.get(id).then((c)=>{
                setUserName(c.username);
                setEmail(c.email);
          })
        }
    });

    function handleCreate(){
        userService.create(
          {
            "username": userName,
            "email": email,
            "password": password,
            "confirm_password": confirmPassword
        }
        ).then((result)=>{
          toast.success("The user was created!");
          history.push('/login');
        }).catch((error)=>{
          const resp = error.response.data;
          for (const x in resp)
            toast.error(resp[x].join(',').replace("This field",x));
        });
    }

    function handleUpdate(id){
        userService.update(
          {
            "id": id,
            "username": userName,
            "email": email,
          }
        ).then((result)=>{
          toast.success("The user was updated!");
        }).catch(()=>{
          toast.error('There was an error! Please re-check your form.');
        });
      }

      function handleUpdatePassword(id){
        userService.changePassword(
            oldPassword, newPassword, confirmNewPassword
        ).then((result)=>{
          toast.success("The Password was updated!");
        }).catch(()=>{
          toast.error('There was an error! Please re-check your form.');
        });
      }

      function isUpdate() { 
        return id && parseInt(id);
      }
      function isChangePassword() { 
        return id && id==='change-password';
      }
      function isCreate(){
        return id && id==='new';
      }
      function handleSubmit() {
        if(isUpdate())
        {
            handleUpdate(id);
        }
        else if (isChangePassword())
          handleUpdatePassword();
        else
          handleCreate();
      }

      return (
          <form className='dialog'>
            <fieldset>
                <legend>Login</legend>
            {!isChangePassword() && (
              <div>
                <label>User Name:</label>
                <input className="form-control" type="text" value={userName} onChange={(e) => setUserName(e.target.value)}/>
                <label>E-Mail:</label>
                <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                {!isUpdate() && (
                  <div>
                    <label>Password:</label>
                    <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>

                    <label>Confirm Password:</label>
                    <input className="form-control" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                  </div>)}
              </div>)}
              {isChangePassword()&&(
                <div>
                    <label>Password:</label>
                    <input className="form-control" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}/>
                    
                    <label>New Password:</label>
                    <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>

                    <label>Confirm New Password:</label>
                    <input className="form-control" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}/>
                </div>                     
              )}
              <button className="btn btn-primary" type="button" onClick={handleSubmit}>Submit</button>
          </fieldset>  
          </form>
        );
}


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