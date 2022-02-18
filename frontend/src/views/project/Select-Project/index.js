import { useState, useContext, useEffect } from 'react';
import ProjectService from '../../../services/projectService';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../contexts/auth';
import { useHistory } from 'react-router-dom';

const projectService = new ProjectService();


export default function SelectProjectPage() {
    const history = useHistory();
    const { signOut } = useContext(AuthContext);
    const [project, setProject] = useState('');
    const [projects, setProjects] = useState([]);

    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         projects: []
    //     };
    //     this.handleAbrir = this.handleAbrir.bind(this);
    //     this.handleNovoProjeto = this.handleNovoProjeto.bind(this);

    //     this.project = createRef('');
    // }

    useEffect(() => {
         projectService.list().then(function (result) {
             console.log(result.data);
             setProjects(result.data);
         });
         console.log("passei");
    });

    // componentDidMount() {
    //     var self = this;
    //     projectService.list().then(function (result) {
    //         self.setState({ projects: result.data })
    //     });
    // }

    function handleAbrir() {
        var id = project
        history.push('/workspace/' + id);
    }

    function sair() {
        signOut();
    }

    return (
        <form className='dialog'>
            <fieldset>
                <legend>Project Select</legend>
                <label htmlFor="tbxProjeto">Project:</label>
                {/* <Form.Select className="form-control mb-4" id="tbxProjeto" name="tbxProjeto" ref={project} autoFocus aria-label="Default select example">
                    {state.projects.map((element, index) => <option key={index}>{element.name}</option>)}
                </Form.Select> */}
                <Form.Select className="form-control mb-4" id="tbxProjeto" name="tbxProjeto" autoFocus aria-label="Default select example">
                    {projects.map((element, index) => <option key={index}>{element.name}</option>)}
                </Form.Select>
                <button className="btn btn-primary mx-1" id="AbrirProjeto" name="AbrirProjeto" onClick={handleAbrir}>Abrir</button>
                <Link to="/new-project"><button className="btn btn-secondary mx-1" id="NovoProjeto" name="NovoProjeto">Novo</button></Link>
            </fieldset>
            <br></br>
            <br></br>
            <hr></hr>
            <div>
                <ul>
                    <li>
                        <label onClick={sair}>Sair</label>
                    </li>
                </ul>
            </div>
        </form>
    )
}