import { useState, useContext, useEffect } from 'react';
import ProjectService from '../../../services/projectService';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../contexts/auth';
import { useHistory } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FloatCard from '../../../component/float-card';

export default function SelectProjectPage() {
  const projectService = new ProjectService();
  const history = useHistory();
  const { signOut } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState();
  const [showDelete, setShowDelete] = useState(false);
  const [nameProject, setNameProject] = useState('');

  useEffect(() => {
    getListProject();
  }, []);

  function getListProject() {
    projectService.list().then(function (result) {
      setProjects(result.data);
      sessionStorage.setItem('listProject', JSON.stringify(result.data));
      if (result.data.length > 0) {
        setSelectedProject(result.data[0]);
        setNameProject(result.data[0].name);
      }
    });
  }

  function handleAbrir() {
    var id = selectedProject.id;
    if (id !== '') {
      sessionStorage.setItem('project', JSON.stringify(selectedProject));
      history.push('/dashboard/' + id);
    }
  }

  function handleShowMessageDelete(event) {
    setShowDelete(true);
    event.preventDefault();
  }

  function handleCancelDelete() {
    setShowDelete(false);
  }

  function handleDelete() {
    var id = selectedProject.id;
    projectService.delete(id).then(function (result) {
      getListProject();
      toast.success('Project successfully removed');
      setShowDelete(false);
    });
  }

  function handleChange(e) {
    let projeto = projects.find(p => p.name === e.target.value)
    setSelectedProject(projeto);
    setNameProject(projeto.name);
  }

  return (
    <>
      <FloatCard title='Project Select'>
        <FloatCard.Body>
          <Form.Label htmlFor="tbxProjeto">Project</Form.Label>
          <Form.Select
            className="form-control mb-4" id="tbxProjeto" name="tbxProjeto" autoFocus aria-label="Default select example" onChange={handleChange}>
            {projects.map((element, index) => <option key={index}>{element.name}</option>)}
          </Form.Select>
        </FloatCard.Body>
        <FloatCard.Footer className="p-3">
          <button disabled={projects.length === 0} className="btn btn-primary me-2" id="AbrirProjeto" name="AbrirProjeto" onClick={handleAbrir}><i className="bi bi-folder2-open"></i> Open</button>
          <Link to="/new-project"><button className="btn btn-success me-2" id="NovoProjeto" name="NovoProjeto"><i className="bi bi-folder-plus"></i> New</button></Link>
          <button disabled={projects.length === 0} className="btn btn-secondary me-2" onClick={handleShowMessageDelete}><i className="bi bi-trash"></i> Delete</button>
          <hr></hr>
          <div>
            <label className='cursor' onClick={() => signOut()}><i className="bi bi-box-arrow-left"></i> Sign Out</label>
          </div>
        </FloatCard.Footer>
      </FloatCard>

      <Modal show={showDelete} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Do you want to delete the project: {nameProject}</label>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleDelete}>
            <i className="bi bi-trash"></i> Delete
          </Button>
          <Button variant="secondary" onClick={handleCancelDelete}>
            <i className="bi bi-x"></i> Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}