import UserService from '../../services/userService';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const userService = new UserService();

export default function ForgotPasswordPage () {
  const history = useHistory();
  const [hasCode, setHasCode] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  function handleForgotPassword(){
      if(!hasCode){
        userService.passwordReset(email).then((result)=>{
          setHasCode(true);
          toast.success("The code was send by email!");
        }).catch(()=>{
          toast.error('There was an error! Please re-check your form.');
        });
      }
      else{
        if(newPassword == confirmNewPassword){
          userService.passwordResetConfirm(codigo, newPassword).then((result)=>{
            setHasCode(true);
            toast.success("Password sucessfully changed!");
            history.push('/login')
          }).catch(()=>{
            toast.error('There was an error! Please re-check your form.');
          });
        }
        else{
          toast.error("Password and confirmation doesn't match!");
        }
      }
    }

    return (
          <form className='dialog' >
            <fieldset>
                <legend>Remember Password</legend>  
                {(hasCode &&
                  <div>
                      <label>Code:</label>
                      <input className="form-control" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                      
                      <label>New Password:</label>
                      <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>

                      <label>Confirm New Password:</label>
                      <input className="form-control" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}/>
                  </div>                     
                )}
                {!hasCode && (
                  <div>
                    <label>Email:</label>
                    <input className="form-control" type="text" value={email} onChange={(e) => setEmail(e.target.value)}/>
                  </div>
                )}         
                <button className="btn btn-primary" type="button" onClick={handleForgotPassword} >Submit</button>
          </fieldset>  
          </form>
    );
}

