
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
import DashBoardPage from '../views/dashBoard';
import AboutPage from '../views/about'


export default function Routes(){
    return(
        <Switch>
            <Route exact path="/" component={SplashPage} />
            <Route exact path="/splash" component={SplashPage} />
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/signin" component={SignInPage} />
            <Route exact path="/signup" component={SignUpPage} />
            <Route exact path="/forgot-password" component={ForgotPasswordPage} />
            <Route exact path="/select-project" component={SelectProjectPage} isPrivate />
            <Route exact path="/project" component={UserListPage} isPrivate/>
            <Route exact path="/aread" component={SelectProjectPage} isPrivate/>
            <Route exact path="/user" component={UserListPage} isPrivate/>
            <Route exact path="/user/:id" component={SignUpPage} isPrivate/>
            <Route exact path="/new-project" component={NewProjectPage} isPrivate/>
            <Route exact path="/jobs" component={JobsPage} isPrivate/>           
            <Route exact path="/verify-email" component={EmailValidationPage} isPrivate/>
            <Route exact path="/dashboard/:id" component={DashBoardPage} isPrivate/>
        </Switch>
    )
}