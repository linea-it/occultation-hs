
import { Switch } from 'react-router-dom';
import Route from './Route';

import UserListPage from "../views/User/User-List";
import SelectProjectPage from "../views/Project/Select-Project";
import SplashPage from "../views/Splash";
import NewProjectPage from "../views/Project/New-project";
import SignInPage from "../views/SignIn";
import SignUpPage from "../views/SignUp";
import ForgotPasswordPage from "../views/forgotPassword";
import JobsPage from '../views/Jobs';
import EmailValidationPage from "../views/emailValidation"


export default function Routes(){
    return(
        <Switch>
            <Route exact path="/" component={SplashPage} />
            <Route exact path="/splash" component={SplashPage} />
            <Route exact path="/login" component={SignInPage} />
            <Route exact path="/registrar" component={SignUpPage} />
            <Route exact path="/forgot-password" component={ForgotPasswordPage} />
            <Route exact path="/select-project" component={SelectProjectPage} isPrivate />
            <Route exact path="/project" component={UserListPage} isPrivate/>
            <Route exact path="/aread" component={SelectProjectPage} isPrivate/>
            <Route exact path="/user" component={UserListPage} isPrivate/>
            <Route exact path="/user/:id" component={SignUpPage} isPrivate/>
            <Route exact path="/new-project" component={NewProjectPage} isPrivate/>
            <Route exact path="/jobs" component={JobsPage} isPrivate/>           
            <Route exact path="/email-validation" component={EmailValidationPage} isPrivate/>
        </Switch>
    )
}