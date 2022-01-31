//import logo from './logo.svg';
import  React, { Component } from  'react';
//import { BrowserRouter, Route } from  'react-router-dom'
//import { Route, Link } from  'react-router-dom'
import SoraRoutes from './routes';
import './App.css';


const  BaseLayout  = () => (
  <div  className="container-fluid">
      <div  className="page content">
        <header>
            <h1>Sora - 1.0</h1>
        </header>  
        <main>
            <SoraRoutes/>
        </main>
      </div>
  </div>
  )

  class  App  extends  Component {
    render() {
        return (
            <BaseLayout/>
        );
    }
  }

export default App;
/*
      <nav  className="navbar navbar-expand-lg navbar-light bg-light">
          <a  className="navbar-brand"  href="#">Django React Demo</a>
          <button  className="navbar-toggler"  type="button"  data-toggle="collapse"  data-target="#navbarNavAltMarkup"  aria-controls="navbarNavAltMarkup"  aria-expanded="false"  aria-label="Toggle navigation">
          <span  className="navbar-toggler-icon"></span>
      </button>
      <div  className="collapse navbar-collapse"  id="navbarNavAltMarkup">
          <div  className="navbar-nav">
              <a  className="nav-item nav-link"  href="/user">users</a>
              <a  className="nav-item nav-link"  href="/user/new">CREATE user</a>
          </div>
      </div>
      </nav>
*/