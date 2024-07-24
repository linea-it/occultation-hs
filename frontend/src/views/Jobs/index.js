/* eslint-disable react-hooks/exhaustive-deps */
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import SplitButton from 'react-bootstrap/SplitButton';
import { useState, useEffect, useRef } from 'react';
import Table from 'react-bootstrap/Table';
import JobsService from '../../services/jobsService';
import './jobs.css';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';


export default function JobsPage({id, onRestart}) {
    const jobService = new JobsService();
    const dtFormat = Intl.DateTimeFormat('en-US', {dateStyle: 'short', timeStyle: 'medium', hour12: false})

    const [jobList, setJobList] = useState([]);
    const [showDelete, setShowDelete] = useState(false);

    //Modal Jobs Alert
    const [modalTitleAlertModal, setModalTitleAlertModal] = useState('Attention');
    const [modalTextAlertModal, setModalTextAlertModal] = useState('');
    const [modalTextDefaultAlertModal, setModalTextDefaultAlertModal] = useState('');
    const [btnLabelModalAlertModal, setBtnLabelModalAlertModal] = useState('Yes');
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [item, setItem] = useState();
    const handleClosesAlertModal = () => setShowAlertModal(false);
    //----//

    const mounted = useRef();
    useEffect(() => {
        mounted.current = true;
        getJobList();
        return () => mounted.current = false;
    }, [id])

    function getJobList() {
        jobService.list(id).then(function (result) {
            if (mounted.current) {
                setJobList(result);
            }
            const keepWatching = result.some(r => r.status === 'running' || r.status === 'waiting') && mounted.current;
            if (keepWatching) {
                setTimeout(() => getJobList(), 5000);
            }
        });
    }

    function objectToText(obj) {
        if (Array.isArray(obj)) {
            let resp = [
                `<h5>Total predictions: ${obj.length}</h5>`
            ];
            obj.forEach((x, i) => {
                resp.push('<h6>Result - ' + (i+1) + '</h6>');
                resp.push(`<p>${objectToText(x)}</p>`);
            });
            return resp.join('');
        }
        else {
            let resp = [];
            for (var key in obj)
                resp.push(display(key) + ": " + truncateString(obj[key], 30));
            return resp.join('<br>')
        }
    }

    function display(key) {
        const map = {
            'epoch':'Occ. Date',
            'vel':'Shadow velocity (km/s)',
            'dist':'Object Dist. (au)',
            'id':'Star ID',
        };
        if (map.hasOwnProperty(key))
            return map[key];
        return key;
    }

    function truncateString(str, num) {
        return !str ? 'null' : str.length > num ? str.substring(0, num) + "..." : str;
      }

    function verify(item) {
        setItem(item);
        if ((item.status === "waiting") || (item.status === "running")) {
            setShowAlertModal(true);
            setModalTitleAlertModal('Cancel');
            setBtnLabelModalAlertModal('Cancel');
            setModalTextAlertModal('Do you want to cancel the ' + item.name + ' prediction run?');
            setModalTextDefaultAlertModal('');
        } else if (item.status === "error") {
            jobService.viewJob(item.idJob).then(function (info) {
                setShowAlertModal(true);
                setModalTitleAlertModal('Error');
                setBtnLabelModalAlertModal('Restart');
                setModalTextAlertModal(info.data.result);
                setModalTextDefaultAlertModal('Do you want to restart the execution of the ' + item.name + ' prediction?');
            }).catch(err => {
                alert(err);
            });
        } else if (item.status === "finished") {
            jobService.viewJob(item.idJob).then(function (info) {
                setShowAlertModal(true);
                setModalTitleAlertModal('Success');
                setBtnLabelModalAlertModal('');
                var myObject = JSON.parse(info.data.result);
                setModalTextAlertModal(objectToText(myObject));
                setModalTextDefaultAlertModal('This is the result of ' + item.name);
            }).catch(err => {
                alert(err);
            });
        } else if (item.status === "canceled") {
            setShowAlertModal(true);
            setModalTitleAlertModal('Restart');
            setBtnLabelModalAlertModal('Restart');
            setModalTextAlertModal('Do you want to restart the execution of the ' + item.name + ' prediction?');
        }
    }

    function handleYesAlertModal() {
        setShowAlertModal(false);
        if ((item.status === "waiting") || (item.status === "running")) {
            jobService.cancelJob(item.idJob).then(() => {
                getJobList();
            }).catch(err => {
                alert(err);
            });
        } else if ((item.status === "error") || (item.status === "canceled") || (item.status === "finished")) {
            jobService.restartJob(item.idJob).then(() => {
                getJobList();
                if (onRestart) {
                    onRestart();
                }
            }).catch(err => {
                alert(err);
            });
        }
    }

    function handleShowMessageDelete(event) {
        setItem(event);
        setShowDelete(true);
    }

    function handleCancelDelete() {
        setShowDelete(false);
    }

    function handleDelete() {
        jobService.removeJob(item.idJob).then(() => {
            getJobList();
            toast.success('Job successfully removed');
            setShowDelete(false);
        }).catch(err => {
            alert(err);
        });
    }

    function clear(status) {
        jobService.deleteJob(id, status).then(() => {
            getJobList();
        }).catch(err => {
            alert(err);
        });
    }

    function displayText(text) {
        return text[0].toUpperCase() + text.substring(1);
    }

    return (
        <>
            <div className='col-12 mb-2 d-flex flex-row-reverse'>
                <SplitButton title="Clear All" align={'end'} disabled={jobList.length === 0} onClick={() => clear('all')} onSelect={(e) => clear(e)}>
                    <Dropdown.Item eventKey="finished">Finished</Dropdown.Item>
                    <Dropdown.Item eventKey="error">Error</Dropdown.Item>
                    <Dropdown.Item eventKey="canceled">Canceled</Dropdown.Item>
                </SplitButton>
            </div>
            <Table responsive striped hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Date Time</th>
                        <th>Job Description</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {jobList.map((item, index) => {
                        return (<tr key={index}>
                            <td valign='middle' width="80px">{index + 1}</td>
                            <td valign='middle'>{dtFormat.format(new Date(item.createdAt))+' GMT'}</td>
                            <td valign='middle'>{item.name}</td>
                            <td valign='middle'>{displayText(item.status)}</td>
                            <td width="120px" align="end">
                                <button type="button" className="btn btn-light border-btn" onClick={() => verify(item)}>
                                    {item.status === "error" && <i className='bi bi-eye-fill'> View</i>}
                                    {item.status === "waiting" && <i className='bi bi-x'> Cancel</i>}
                                    {item.status === "running" && <i className='bi bi-x'> Cancel</i>}
                                    {item.status === "finished" && <i className='bi bi-eye-fill'> View</i>}
                                    {item.status === "canceled" && <i className='bi bi-eye-fill'> Restart</i>}
                                </button>
                            </td>
                            <td width="130px">
                                <button type="button" className="btn btn-light border-btn" onClick={() => handleShowMessageDelete(item)}>
                                    <i className='bi bi-trash'> Remove</i>
                                </button>
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </Table>

            <Modal show={showAlertModal} onHide={handleClosesAlertModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitleAlertModal}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='mb-3' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(modalTextAlertModal) }}></div>
                    <span>{modalTextDefaultAlertModal}</span>
                </Modal.Body>
                <Modal.Footer>
                    {btnLabelModalAlertModal &&
                        <Button variant="primary" onClick={handleYesAlertModal}>
                            <i className="bi bi-check-lg"></i> {btnLabelModalAlertModal}
                        </Button>
                    }
                    <Button variant="secondary" onClick={handleClosesAlertModal}>
                        <i className="bi bi-x"></i> Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDelete} onHide={handleCancelDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label>Do you want to delete the job: {item ? item.name : ''}</label>
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
    );
}
