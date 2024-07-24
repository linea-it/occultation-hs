/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import PageLoader from '../../../../component/page-loader';
import LightCurveService from '../../../../services/lightCurveService';
import { toast } from 'react-toastify';
import './results.css'
import JobsService from '../../../../services/jobsService';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

export default function ResultsModal(props) {

    const lightCurveService = new LightCurveService();
    const jobService = new JobsService();

    const [loader, showLoader, hideLoader] = PageLoader();

    const [txtResult, setTxtResult] = useState(props.item.txtResult);

    useState(() => {
        showLoader();
        lightCurveService.getLightCurveResults(props.item.id).then(response => {
            if(response.txtResult){
                setTxtResult(response.txtResult);
                hideLoader();
            }
            else{
                lightCurveService.ligthCurveResults(props.item).then(response => {
                    consolidaJob();
                });
                
            }
        });
    });

    function consolidaJob() {
        showLoader();
        if(props.projectId) {
            jobService.consolidaJob(props.projectId).then(response => {
                if (response.status !== 204) {
                    setTimeout(() => consolidaJob(), 5000);
                }
                else{
                    lightCurveService.getLightCurveResults(props.item.id).then(response => {
                        setTxtResult(response.txtResult);
                        hideLoader();
                    });
                }
            });
        }
    }

    function download() {
        showLoader();
        lightCurveService.getLightCurveResults(props.item.id).then(response => {
            const zip = new JSZip();
                zip.file(`log_${props.item.name}.txt`, response.txtResult);
                zip.file(`model_ ${props.item.name}_result.dat`, response.file1Result, {base64: true});
                zip.file(`model_ ${props.item.name}_result.dat.label`, response.file2Result, {base64: true});
                zip.file(`${props.item.name}_result.dat`, response.file3Result, {base64: true});
                zip.file(`${props.item.name}_result.dat.label`, response.file4Result, {base64: true});
                zip.generateAsync({ type: 'blob' }).then(function (content) {
                    FileSaver.saveAs(content, `${props.item.name}_results.zip`,);
                });
            hideLoader();
        });
    }


    
    function handleClose() {
        props.close();
    }

    function downloadTextFile(text, fileName){
        const linkSource = `data:text/plain;charset=utf-8, ${encodeURIComponent(text)}`;
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);

        downloadLink.href = linkSource;
        downloadLink.target = '_self';
        downloadLink.download = fileName;
        downloadLink.click(); 
    }

    function downloadBase64File(contentBase64, fileName) {
        const linkSource = `data:application/pdf;base64,${contentBase64}`;
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);

        downloadLink.href = linkSource;
        downloadLink.target = '_self';
        downloadLink.download = fileName;
        downloadLink.click(); 
    }

    return (
        <>
        <Modal show={true} onHide={handleClose} size="lg" backdrop={'static'} keyboard={false}>
            <Modal.Header closeButton>
            <Modal.Title>Results {props.item.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
            <div className='row'>
                <div className='col-xs-12 mb-2'>
                <label className="form-label">Light Curve Results</label>
                <textarea className="form-control resultView" disabled={true} type="text" value={txtResult} />
                </div>
            </div>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="primary" onClick={download}>
                <i className="bi bi-download"></i> Download
            </Button>
            <Button variant="secondary" onClick={handleClose}>
                <i className="bi bi-x"></i> Close
            </Button>
            </Modal.Footer>
        </Modal>
        {loader}
        </>
    );
}