import React, { Component, createRef } from 'react';
import UserService from '../services/userService';

const userService = new UserService();

const WithRouterAction = (Children) => {
    return(props)=>{
        return <Children {...props}/>
    }
}

class LoginComponent extends Component {
    constructor(props) {
        super(props);

        this.handleLogar = this.handleLogar.bind(this);
        this.handleRegistrar = this.handleRegistrar.bind(this);

        this.login = createRef('');
        this.password = createRef('');
      }

      componentDidMount(){
      }

      handleLogar(event) {
        var self = this;
        userService.login(this.login.current.value,this.password.current.value
          ).then(()=>{
            self.props.history.push('/selectProject');
          }).catch(()=>{
            alert('There was an error! Please re-check your form.');
          });
        event.preventDefault();
      }

      handleRegistrar(event)
      {
        let url = window.location.href;
        let pos = url.lastIndexOf('/');
        url = url.substr(0,pos)+'/registrar';
        console.log(url);
        document.location.assign(url);
        event.preventDefault();
      }

      render() {
        return (
          <form>
            <fieldset>
                <legend>Login</legend>
                <label htmlFor="tbxLogin">Login:</label>
                <input className="form-control" type="email" id="tbxLogin" name="tbxLogin" ref={this.login} autoFocus/>
                <label htmlFor="tbxSenha">Senha:</label>
                <input className="form-control" type="password" id="tbxSenha" name="tbxSenha" ref={this.password}/>
                <a href="./esqueciSenha"><label>Esqueci Senha</label></a>
                <button className="btn btn-primary mx-1" id="Logar" name="Logar" onClick={ this.handleLogar }>Logar</button>
                <button className="btn btn-secondary mx-1" id="Registrar" name="Registrar" onClick={ this.handleRegistrar }>Registrar</button>
            </fieldset>              
          </form>
        );
      }
}

export default WithRouterAction(LoginComponent)
