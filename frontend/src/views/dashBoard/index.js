/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import { useContext, useEffect, useState } from 'react';
import SoraVersionComponent from '../../component/sora-version';
import { useHistory, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import './dashBoard.css';
import JobsPage from '../Jobs';
import Tree from '../../component/tree';
import JobsService from '../../services/jobsService';
import ProjectService from '../../services/projectService';
import LightCurveService from '../../services/lightCurveService';
import LightCurveListPage from './lightCurveList';
import ObserverPage from './observer';
import LightCurvePage from './lightCurve';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import ConfirmModal from '../../component/confirm-modal';
import ProjectDetail from './projectDetail';
import BodyDetail from './bodyDetail';
import ObserverList from './observers/observerList';
import ObserverService from '../../services/observerService';
import ChordsPage from './chords/chords';
import logo from '../../assets/logo_occultation_interface.svg';
import { Table, Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';


export default function DashBoardPage() {
    const { id } = useParams();
    const history = useHistory();
    const { signOut } = useContext(AuthContext);
    const [data, setShowData] = useState([]);
    const jobService = new JobsService();
    const projectService = new ProjectService();
    const lightCurveService = new LightCurveService();
    const observerService = new ObserverService();
    const [selectedProject, setSelectedProject] = useState();
    const [bodyList, setBodyList] = useState();
    const [predctionList, setPredictionList] = useState();
    const [lightCurveList, setLightCurveList] = useState();
    const [lightCurveListSelection, setLightCurveListSelection] = useState([]);
    const [selectedPrediction, setSelectedPrediction] = useState();
    const [selectedBody, setSelectedBody] = useState();
    const [selectedBodyEvents, setSelectedBodyEvents] = useState();
    const [deletablePrediction, setDeletablePrediction] = useState();
    const [selectedLightCurve, setSelectedLightCurve] = useState();
    const [selectedObserver, setSelectedObserver] = useState();
    const [observers, setObservers] = useState();
    const [observersSelection, setObserversSelection] = useState([]);

    const [showJob, setShowJob] = useState(false);
    const [showBody, setShowBody] = useState(false);
    const [showEvent, setShowEvent] = useState(false);
    const [showProject, setShowProject] = useState(false);
    const [showLightCurveList, setShowLightCurveList] = useState(false);
    const [showLightCurve, setShowLightCurve] = useState(false);
    const [showObserver, setShowObserver] = useState(false);
    const [showObserverList, setShowObserverList] = useState(false);
    const [showChords, setShowChords] = useState(false);

    const [modalTitle, setModalTitle] = useState('Attention');
    const [modalText, setModalText] = useState('');
    const [modalTextDefault, setModalTextDefault] = useState('');
    const [show, setShow] = useState(false);
    const [showChangeEventName, setShowChangeEventName] = useState(false);
    const [eventName, setEventName] = useState('')
    const [showDeletePredictionModal, setShowDeletePredictionModal] = useState(false);
    const [jobAlive, setJobAlive] = useState(false);

    const [selectedNode, setSelectedNode] = useState({});
    const handleClose = () => setShow(false);
    const handleChangeEventNameClose = () => {
        setEventName(selectedPrediction.name);
        setShowChangeEventName(false);
    }
    const handleJobsClose = () => setShowJob(false);

    //construtor
    useEffect(() => {
        projectService.get(id).then(projeto => {
            setSelectedProject(projeto);
        });
    }, [id]);

    useEffect(() => {
        if (selectedProject) {
            consolidaJob();
            projectService.getBodies(id).then(bodies => {
                setBodyList(bodies);
                setShowData(readTree(selectedProject, bodies, [], [], [], null));
            })
        }
    }, [selectedProject])

    useEffect(() => {
        if (selectedNode.id)
            selecionou(selectedNode.id, selectedNode.text);
    }, [observers]);

    function reloadTree() {
        projectService.getBodies(id).then(bodies => {
            setBodyList(bodies);
            projectService.getPredictions(id).then(preds => {
                if (preds.length === 0) {
                    setShowData(readTree(selectedProject, bodies, [], [], [], null));
                    showNoPredictionModal();
                } else {
                    setPredictionList(preds);
                    if (selectedBody) {
                        setSelectedBodyEvents(preds.filter(x => x.body_id === selectedBody.id));
                    }
                    lightCurveService.getLightCurvesByProject(id).then(lcs => {
                        setLightCurveList(lcs);
                        observerService.listBy(id).then(obss => {
                            setObservers(obss);
                            setShowData(readTree(selectedProject, bodies, preds, lcs, obss, selectedNode.id));
                        })
                    })
                }
            })
        });
    }

    useEffect(() => {
        if (selectedProject) {
            setShowData(readTree(selectedProject, bodyList, predctionList, lightCurveList, observers, selectedNode.id));
        }
    }, [selectedNode]);

    function consolidaJob() {
        setJobAlive(true);
        jobService.consolidaJob(id).then(response => {
            const { data } = response;
            if (data) {
                if (data.some(j => j.status === 'error')) {
                    showJobWithError(data.filter(j => j.status === 'error'));
                }
                if (data.some(j => j.status === 'running' || j.status === 'waiting')) {
                    setTimeout(() => { consolidaJob() }, 5000);
                }
                if (data.length === 0 || data.some(j => j.status === 'finished')) {
                    reloadTree();
                }
                if (data.length === 0 || data.every(j => j.status === 'finished' || j.status === 'error')) {
                    setJobAlive(false);
                }
            }
        }).catch(() => setTimeout(() => { consolidaJob() }, 5000));
    }

    function showNoPredictionModal() {
        setShow(true);
        setModalTitle('Result');
        setModalText('No occultations found!');
        setModalTextDefault('');
    }

    function showJobWithError(errors) {
        setShow(true);
        setModalTitle('Error');
        setModalText(`${errors.length} job${errors.length > 0 ? 's' : ''} end with error`);
        setModalTextDefault(errors.map((err, index) => <div key={index}>{err.name}: {err.message}</div>));
    }

    function readTree(projeto, bodies, preds, lcs, observers, selected) {
        const treeData = [
            {
                key: "0",
                label: projeto.name,
                title: "",
                selecionada: selected,
                children: readBodies(bodies, preds, lcs, observers, selected)
            }
        ]
        return treeData;
    }

    function readBodies(bodies, preds, lcs, observers, selected) {
        let bodyList = [];
        for (let i = 0; i < bodies.length; i++) {
            let body = {
                key: ("0-" + i),
                label: bodies[i].bodyName,
                title: bodies[i].bodyName,
                selecionada: selected,
                children: readPredictions(bodies[i].id, preds, i, lcs, observers, selected)
            }
            bodyList.push(body);
        }
        return bodyList;
    }

    function readPredictions(bodyId, preds, indiceBody, lcs, observers, selected) {
        let predList = [];
        if (preds) {
            for (let i = 0; i < preds.length; i++) {
                let curvs = readLightCurves(preds[i].id, lcs, indiceBody, i, selected)
                let obs = readObservers(preds[i].id, observers, indiceBody, i, selected)

                if (preds[i].body_id === bodyId) {
                    let pred = {
                        key: ("0-" + indiceBody + "-" + i),
                        label: preds[i].name,
                        title: "",
                        selecionada: selected,
                        children: curvs.concat(obs).concat(
                            {
                                key: "0-" + indiceBody + "-" + i + "-2",
                                label: "Chords",
                                title: "",
                                selecionada: selected
                            })
                    }
                    predList.push(pred);
                }
            }
        }
        return predList;
    }

    function readLightCurves(predictionId, lcs, indiceBody, indicePred, selected) {
        let lcRoot = [];
        let lcList = [];
        for (let i = 0; i < lcs.length; i++) {
            if (lcs[i].prediction_id === predictionId) {
                let lc = {
                    key: ("0-" + indiceBody + "-" + indicePred + "-0-" + i),
                    label: lcs[i].name ? lcs[i].name : "no name",
                    title: "",
                    selecionada: selected
                }
                lcList.push(lc);
            }
        }
        let root = {
            key: ("0-" + indiceBody + "-" + indicePred + "-0"),
            label: "Light Curves",
            title: "",
            selecionada: selected,
            children: lcList
        }
        lcRoot.push(root);
        return lcRoot;
    }

    function readObservers(predictionId, observers, indiceBody, indicePred, selected) {
        let oRoot = [];
        let oList = [];
        for (let i = 0; i < observers.length; i++) {
            if (observers[i].prediction_id === predictionId) {
                let o = {
                    key: ("0-" + indiceBody + "-" + indicePred + "-1-" + i),
                    label: observers[i].name ? observers[i].name : "no name",
                    title: "",
                    selecionada: selected
                }
                oList.push(o);
            }
        }
        let root = {
            key: ("0-" + indiceBody + "-" + indicePred + "-1"),
            label: "Observers",
            title: "",
            selecionada: selected,
            children: oList
        }
        oRoot.push(root);
        return oRoot;
    }

    function about() {
        history.push('/about/')
    }

    function back() {
        history.push('/select-project')
    }

    function sair() {
        signOut();
    }

    function toggleJob() {
        setShowJob(true);
    }

    function getNodeType(key) {
        if (key) {
            let node = key.split('-');
            let nodeType = node.length - 1
            if (nodeType === 3) {
                if (node[3] === "1") {
                    //lista observador
                    nodeType = 5;
                }
                else if (node[3] === "2") {
                    //cordas
                    nodeType = 6;
                }
            }
            else if (nodeType === 4) {
                if (node[3] > 0) {
                    //observador
                    nodeType = 7;
                }
            }
            return nodeType;
        }
        else {
            return -1;
        }
    }

    function selecionou(nodeId, nodeText) {
        const eventIndex = nodeId.trim().split('-')[2];
        setSelectedNode({ id: nodeId.trim(), text: nodeText });
        const nodeType = getNodeType(nodeId.trim());
        if (nodeType === 0) {//selecionou projeto
            abrirProjeto();
        }
        else if (nodeType === 1) {//selecionou corpo
            const i = nodeId.trim().split('-')[1]
            abrirCorpo(bodyList[i]);
        }
        else if (nodeType === 2) {//selecionou evento (ocultação)
            const i = nodeId.trim().split('-')[2]
            abrirPredicao(predctionList[i]);
        }
        else if (nodeType === 3) {//selecionou lista de curva de luz
            if (eventIndex >= 0) {
                abrirListaCurvaDeLuz(predctionList[eventIndex]);
            }
        }
        else if (nodeType === 4) {//selecionou curva de luz
            const i = nodeId.trim().split('-')[4]
            abrirCurvaDeLuz(lightCurveList[i], eventIndex)
        }
        else if (nodeType === 5) {//selecionou lista Observador
            if (eventIndex >= 0) {
                abrirListaObservadores(predctionList[eventIndex]);
            }
        }
        else if (nodeType === 6) {//selecionou cordas
            abrirCordas(predctionList[eventIndex]);
        }
        else if (nodeType === 7) {//selecionou observador
            let obsIndex = nodeId.trim().split('-')[4];
            abrirObservador(predctionList[eventIndex], observers[obsIndex]);
        }
    }

    function getNodeKeyEvento(evento) {
        let key = "0-";
        for (let i = 0; i < bodyList.length; i++) {
            if (evento.body_id === bodyList[i].id) {
                key += i + "-";
                break;
            }
        }
        for (let i = 0; i < predctionList.length; i++) {
            if (evento.name === predctionList[i].name) {
                key += i;
                break;
            }
        }
        return key;
    }

    function getNodeKeyCurva(curva, eventIndex) {
        let key = "0-";
        let evento;
        let predictonIndex;

        for (let i = 0; i < predctionList.length; i++) {
            if (curva.prediction_id === predctionList[i].id) {
                evento = predctionList[i];
                predictonIndex = i;
                break;
            }
        }
        for (let i = 0; i < bodyList.length; i++) {
            if (evento.body_id === bodyList[i].id) {
                key += i + "-" + predictonIndex + "-0-";
                break;
            }
        }
        for (let i = 0; i < lightCurveList.length; i++) {
            const evt = predctionList.find(p => lightCurveList[i].prediction_id === p.id)
            if (curva.prediction_id === evt.id && lightCurveList[i].name === curva.name) {
                key += i;
                break;
            }
        }
        return key;
    }

    function abrirProjeto() {
        setShowProject(true);
        setShowBody(false);
        setSelectedBody(null);
        setShowEvent(false);
        setShowLightCurve(false);
        setShowLightCurveList(false);
        setShowObserver(false);
        setShowObserverList(false);
        setShowChords(false);
    }

    function abrirCorpo(corpo) {
        setSelectedBody(corpo);
        setSelectedBodyEvents(predctionList.filter(x => x.body_id === corpo.id))
        setShowBody(true);
        setShowEvent(false);
        setShowLightCurve(false);
        setShowProject(false);
        setShowLightCurveList(false);
        setShowObserver(false);
        setShowObserverList(false);
        setShowChords(false);
    }

    function abrirPredicao(item) {
        setSelectedNode({ id: getNodeKeyEvento(item), text: item.name });
        setLightCurveListSelection(lightCurveList.filter(n => n.prediction_id === item.id));
        setObserversSelection(observers.filter(o => o.prediction_id === item.id))
        setEventName(item.name);
        setSelectedPrediction(item);
        setShowBody(false);
        setSelectedBody(null);
        setShowEvent(true);
        setShowProject(false);
        setShowLightCurveList(false);
        setShowObserver(false);
        setShowObserverList(false);
        setShowChords(false);
    }

    function abrirCurvaDeLuz(item, eventIndex) {
        setSelectedNode({ id: getNodeKeyCurva(item, eventIndex), text: item.name });
        setSelectedLightCurve(item);
        setShowBody(false);
        setSelectedBody(null);
        setShowEvent(false);
        setShowProject(false);
        setShowLightCurve(true);
        setShowLightCurveList(false);
        setShowObserver(false);
        setShowObserverList(false);
        setShowChords(false);
    }

    function abrirListaCurvaDeLuz(predicao) {
        setSelectedPrediction(predicao);
        setLightCurveListSelection(lightCurveList.filter(n => n.prediction_id === predicao.id));
        setShowBody(false);
        setSelectedBody(null);
        setShowEvent(false);
        setShowProject(false);
        setShowLightCurve(false);
        setShowLightCurveList(true);
        setShowObserver(false);
        setShowObserverList(false);
        setShowChords(false);
    }

    function abrirListaObservadores(predicao) {
        setSelectedPrediction(predicao);
        setObserversSelection(observers.filter(o => o.prediction_id === predicao.id))
        setShowBody(false);
        setSelectedBody(null);
        setShowEvent(false);
        setShowProject(false);
        setShowLightCurve(false);
        setShowLightCurveList(false);
        setShowObserver(false);
        setShowObserverList(true);
        setShowChords(false);
    }

    function abrirObservador(predicao, observador) {
        setSelectedPrediction(predicao);
        setSelectedObserver(observador);
        setShowBody(false);
        setSelectedBody(null);
        setShowEvent(false);
        setShowProject(false);
        setShowLightCurve(false);
        setShowLightCurveList(false);
        setShowObserver(true);
        setShowObserverList(false);
        setShowChords(false);
    }

    function abrirCordas(predicao) {
        setSelectedPrediction(predicao);
        setLightCurveListSelection(lightCurveList.filter(n => n.prediction_id === predicao.id));
        setObserversSelection(observers.filter(o => o.prediction_id === predicao.id))
        setShowBody(false);
        setSelectedBody(null);
        setShowEvent(false);
        setShowProject(false);
        setShowLightCurve(false);
        setShowLightCurveList(false);
        setShowObserver(false);
        setShowObserverList(false);
        setShowChords(true);
    }

    function deletePredicao(item) {
        setDeletablePrediction(item)
        setShowDeletePredictionModal(!showDeletePredictionModal);
    }

    function cancelDelete() {
        setShowDeletePredictionModal(!showDeletePredictionModal);
    }

    function confirmDelete() {
        projectService.deletePrediction(deletablePrediction).then(response => {
            toast.success("Event was successfully deleted");
            reloadTree();
        });
    }

    function showChangeEventModal() {
        setShowChangeEventName(true);
    }

    function handleChangeEventName() {
        let event = { id: selectedPrediction.id, name: eventName }
        projectService.putPredictionName(event).then(response => {
            toast.success("Event name was successfully updated");
            selectedPrediction.name = eventName;
            reloadTree();
            setShowChangeEventName(false);
        });
    }

    function download(event) {
        const imgSrc = `data:image/jpeg;base64,${event.graficalContent}`;
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);
    
        downloadLink.href = imgSrc;
        downloadLink.target = '_self';
        downloadLink.download = `${event.name}.jpg`;
        downloadLink.click();
      }

    return (
        <>
            <div className='comprimento-top'>
                <div className='row'>
                    <div className='col-12'>
                        <nav className="navbar navbar-light bg-light navbar-expand-lg border">
                            <div className="container-fluid">
                                <div className="navbar-brand">
                                    {/* 106px é o máximo que da sem alterar a altura da navbar */}
                                    <img width="106px" alt="logo" src={logo} />
                                    <span style={{ fontSize: 'small' }}>
                                        <SoraVersionComponent />
                                    </span>
                                </div>
                                <div className="d-flex">
                                    <label className='cursor espacamento-icon' onClick={back} ><i className="bi bi-arrow-left"></i> Projects</label>
                                    <label className='cursor espacamento-icon' onClick={toggleJob} >{!jobAlive && <i className="bi bi-tools"></i>} {jobAlive && <i className="spinner-border spinner-border-sm"></i>} Jobs</label>
                                    <label className='cursor espacamento-icon' onClick={about}><i className="bi bi-info-square-fill"></i> About</label>
                                    <label className='cursor espacamento-icon' onClick={sair}><i className="bi bi-box-arrow-left"></i> Sign Out</label>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
                <div className="container-fluid">
                    <div className="row flex-nowrap">
                        <div className="raiz col-5 col-sm-5 col-md-3 px-0 menu-color">
                            <div className="arvore d-flex flex-column align-items-sm-start pt-2 min-vh-100">
                                <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-sm-start">
                                    <li onClick={(e) => selecionou(e.target.id, e.target.outerText)}>
                                        <Tree data={data} />
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {showProject &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <div className='row'>
                                    <ProjectDetail project={selectedProject} bodies={bodyList} />
                                </div>
                            </div>
                        }
                        {showBody &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <div className='row'>
                                    <BodyDetail body={selectedBody} eventList={selectedBodyEvents} abrirPredicao={abrirPredicao} deletePredicao={deletePredicao}></BodyDetail>
                                </div>
                            </div>
                        }
                        {showEvent && selectedPrediction &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <div className='row'>
                                    <div className='col-12 text-center'>
                                        <h3>Event {selectedPrediction.name}
                                            &nbsp;<Button variant="primary" onClick={showChangeEventModal}>
                                                <i className="bi bi-pencil"></i> Edit
                                            </Button></h3>
                                        <hr />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-12'>
                                        <h5><b>Map View</b></h5>
                                    </div>
                                </div>
                                <div className='row m-0'>
                                    <div className='col-12 bg-white my-2 p-3'>
                                        <Table responsive striped hover>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Occ. Date</th>
                                                    <th>Shadow velocity (km/s)</th>
                                                    <th>Object Dist. (au)</th>
                                                    <th>Star G Magnitude</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr key="0">
                                                    <td valign='middle'>{selectedPrediction.name}</td>
                                                    <td valign='middle'>{selectedPrediction.epoch}</td>
                                                    <td valign='middle'>{selectedPrediction.vel}</td>
                                                    <td valign='middle'>{selectedPrediction.dist}</td>
                                                    <td valign='middle'>{selectedPrediction.g}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    <div className='col-12 bg-white my-2 p-3 position-relative'>
                                        <OverlayTrigger overlay={<Tooltip>Download image</Tooltip>}>
                                            <Button className='position-absolute top-0 end-0 btn-download' variant='outline-secondary' size='sm' onClick={()=> download(selectedPrediction)}>
                                                <i className="bi bi-download"></i>
                                            </Button>
                                        </OverlayTrigger>
                                        <img alt="" src={`data:image/jpeg;base64,${selectedPrediction.graficalContent}`} style={{ width: '100%' }} />
                                    </div>
                                </div>
                            </div>
                        }
                        {showLightCurveList &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <div className='row'>
                                    <div className='col-12'>
                                        <LightCurveListPage projectId={selectedProject ? selectedProject.id : null} prediction={selectedPrediction} list={lightCurveListSelection} onChange={consolidaJob} openLightCurve={abrirCurvaDeLuz} />
                                    </div>
                                </div>
                            </div>
                        }
                        {showObserverList &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <div className='row'>
                                    <div className='col-12'>
                                        <ObserverList observers={observersSelection} predictionId={selectedPrediction.id} onChange={reloadTree}></ObserverList>
                                    </div>
                                </div>
                            </div>
                        }
                        {showLightCurve &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <LightCurvePage value={selectedLightCurve} projectId={selectedProject ? selectedProject.id : null} onChange={consolidaJob} lightCurveList={lightCurveList} />
                            </div>
                        }
                        {showObserver &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <ObserverPage item={selectedObserver} />
                            </div>
                        }
                        {showChords &&
                            <div className="col-7 col-sm-7 col-md-9 py-3">
                                <ChordsPage
                                    projectId={selectedProject ? selectedProject.id : null}
                                    prediction={selectedPrediction}
                                    observerList={observersSelection}
                                    lightCurveList={lightCurveListSelection}
                                    onChange={reloadTree}
                                    onCosolidate={consolidaJob}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>

            <Modal show={showJob} onHide={handleJobsClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Jobs</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <JobsPage id={id} onRestart={consolidaJob} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleJobsClose}>
                        <i className="bi bi-x"></i> Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(modalText) }}></span>
                    <br></br>
                    {modalTextDefault}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        <i className="bi bi-x"></i> Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showChangeEventName} onHide={handleChangeEventNameClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Event Name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input className="form-control" type="text" name="name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleChangeEventName}>
                        <i className="bi bi-check-lg"></i> Save
                    </Button>
                    <Button variant="secondary" onClick={handleChangeEventNameClose}>
                        <i className="bi bi-x"></i> Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {showDeletePredictionModal && (
                <ConfirmModal title="Remove Event" text={"Do you really want to delete the event " + deletablePrediction.name + "?"} yes="yes" confirm={confirmDelete} cancel={cancelDelete} ></ConfirmModal>
            )}
        </>
    );
}
