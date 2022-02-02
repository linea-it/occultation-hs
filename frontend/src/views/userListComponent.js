import  React, { Component } from  'react';
import  UserService  from  '../services/userService';


const  userService  =  new  UserService();
export default class UserListComponent  extends  Component {

    constructor(props) {
        super(props);
        this.state  = {
            users: [],
            nextPageURL:  '',
            prevPageURL:  ''
        };
        this.nextPage  =  this.nextPage.bind(this);
        this.prevPage  =  this.prevPage.bind(this);
        this.handleDelete  =  this.handleDelete.bind(this);
    }

    setStateFromResult(result){
        var newState = { users:  result.data, 
            nextPageURL:  result.nextlink, 
            prevPageURL: result.prevlink,
            currentPage: result.page,
            countPages: result.numpages,
            isFirst: result.page==1,
            isLast: result.page==result.numpages,
        };
        this.setState(newState);
    }

    componentDidMount() {
        var self = this;
        userService.list().then((result) => self.setStateFromResult(result));
    }

    handleDelete(e,id){
        var self = this;
        userService.delete(id).then(()=>{
            var  newArr  =  self.state.users.filter(function(obj) {
                return  obj.id  !==  id;
            });
            self.setState({users:  newArr})
        });
    }

    nextPage(){
        var self = this;
        userService.getByURL(this.state.nextPageURL).then((result) => self.setStateFromResult(result));
    }

    prevPage(){
        var self = this;
        userService.getByURL(this.state.prevPageURL).then((result) => self.setStateFromResult(result));
    }

    render() {
        return (
        <div className="screen user--list">
            <table  className="table">
                <thead  key="thead">
                <tr>
                    <th>#</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                    {this.state.users.map( c  =>
                    <tr  key={c.id}>
                        <td>{c.id}  </td>
                        <td>{c.username}</td>
                        <td>{c.email}</td>
                        <td>
                        <button  className="btn btn-danger mx-2" onClick={(e)=>  this.handleDelete(e,c.id) }> Delete</button>
                        <a  className="btn btn-secondary mx-2" role="button" href={"/user/" + c.id}> Update</a>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            <button  className="btn btn-primary mx-0"  onClick={ this.prevPage } disabled={this.state.isFirst}>Prev</button>
            <button  className="btn btn-primary mx-1"  onClick={ this.nextPage } disabled={this.state.isLast}>Next</button>
        </div>
        );
    }
}
