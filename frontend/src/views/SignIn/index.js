import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
//import UserService from '../../services/userService';
import { AuthContext } from '../../contexts/auth'

// const WithRouterAction = (Children) => {
//     return (props) => {
//         return <Children {...props} />
//     }
// }

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, loadingAuth } = useContext(AuthContext);

    function handleSubmit(event) {
        if (email !== '' && password !== '') {
            signIn(email, password);
        }
        else {
            alert('There was an error! Please re-check your form.');
        }
        event.preventDefault();
    }

    return (
        <form className='dialog' onSubmit={handleSubmit}>
            <fieldset>
                <legend>Login</legend>
                <label htmlFor="tbxLogin">Login:</label>
                <input className="form-control" type="email" id="tbxLogin" name="tbxLogin" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                <label htmlFor="tbxSenha">Password:</label>
                <input className="form-control" type="password" id="tbxSenha" name="tbxSenha" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Link to="/forgot-password"><label>Forgot Password</label></Link>
                <button className="btn btn-primary mx-1" id="Logar" name="Logar" type='submit'>{loadingAuth ? 'Please...' : 'Logar'}</button>
                <Link to="/registrar"><button className="btn btn-secondary mx-1">Registrar</button></Link>
            </fieldset>
        </form>
    );
}
