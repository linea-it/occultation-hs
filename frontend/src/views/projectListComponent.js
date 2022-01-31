import  React, { Component } from  'react';
import  ProjectService  from  '../services/projectService';

const  projectService  =  new  ProjectService();
class  ProjectListComponent  extends  Component {

    constructor(props) {
        super(props);
        this.state  = {
            projects: [],
            nextPageURL:  ''
        };
        this.nextPage  =  this.nextPage.bind(this);
        this.handleDelete  =  this.handleDelete.bind(this);
    }

    componentDidMount() {
        var  self  =  this;
        projectService.list().then(function (result) {
            self.setState({ projects:  result.data, nextPageURL:  result.nextlink})
        });
    }

    handleDelete(e,id){
        var  self  =  this;
        projectService.delete({id :  id}).then(()=>{
            var  newArr  =  self.state.projects.filter(function(obj) {
                return  obj.id  !==  id;
            });
            self.setState({projects:  newArr})
        });
    }

    nextPage(){
        var  self  =  this;
        projectService.getByURL(this.state.nextPageURL).then((result) => {
            self.setState({ projects:  result.data, nextPageURL:  result.nextlink})
        });
    }
    render() {
        return (
        <div  className="project--list">
            <table  className="table">
                <thead  key="thead">
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Range Date</th>
                    <th>catalog</th>
                    <th>Body´s</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                    {this.state.projects.map( c  =>
                    <tr  key={c.id}>
                        <td>{c.id}  </td>
                        <td>{c.name}</td>
                        <td>{c.initialDateTime} - {c.finalDateTime}</td>
                        <td>{c.catalog}</td>
                        <td>{c.body}</td>
                        <td>{c.description}</td>
                        <td>
                        <button  onClick={(e)=>  this.handleDelete(e,c.id) }> Delete</button>
                        <a  href={"/project/" + c.id}> Update</a>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            <button  className="btn btn-primary"  onClick=  {  this.nextPage  }>Next</button>
        </div>
        );
    }
}
export  default  ProjectListComponent;