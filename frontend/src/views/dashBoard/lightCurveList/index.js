/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import EditLightCurveModal from './editLightCurve';
import RegisterLightCurveModal from './registerLightCurve';
import LightCurveService from '../../../services/lightCurveService';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../component/confirm-modal';
import StarModal from './star';

export default function LightCurveListPage({list, prediction, onChange, openLightCurve}) {

  const [showRegister, setShowRegister] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [item, setItem] = useState();
  const [lightCurveList, setLightCurveList] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStarModal, setShowStarModal] = useState(false);
  const [star, setStar] = useState();
  const [resetLc, setResetLc] = useState(null);

  const lightCurveService = new LightCurveService();

  useEffect(() => {
    if (list) {
      setLightCurveList(list);
    }
  }, [list]);

  useEffect(() => {
    lightCurveService.getStar(prediction.id).then(response => {
      setStar(response);
    });
  }, [prediction]);

  function change() {
    if (onChange) {
      onChange();
    }
  }

  function openStarModal() {
    setShowStarModal(true);
  }

  function closeStarModal(success) {
    setShowStarModal(false);
    if (success) {
      change();
    }
  }

  function toggleRegister() {
    if (showRegister) {
      change();
    }

    setShowRegister(!showRegister);
  }

  function toggleEdit(item) {
    if (item) {
      setItem(item);
    } else {
      change();
    }

    setShowEdit(!showEdit);
  }

  function toogleOpen(item){
    openLightCurve(item);
  }

  function deleteLigthCurve(lightCurve) {
    setItem(lightCurve)
    setShowConfirmModal(!showConfirmModal);
  }

  function cancelDelete() {
    setShowConfirmModal(false);
  }

  function confirmDelete() {    
    lightCurveService.deleteLightCurve(item).then(() => {
      toast.success("Light curve was successfully deleted");
      change();
    });
  }

  function displayAcquisition(time, format) {
    if (format === 'Julian') {
      return `${time} ${format}`
    } else if (format === 'Seconds') {
      return time.replace('T', ' ')
    }
  }

  function resetLightCurve() {
    lightCurveService.reset(resetLc).then(() => {
      change();
    })
  }

  return (
    <>
      <div className='row'>
        <div className='col-12 mt-2'>
          <h5><b>Light Curves</b></h5>
        </div>
      </div>
      <div className='row m-2'>
        <div className='col-12'>
          <Button variant="primary" className='float-sm-end mb-3' disabled={!star || !star.diameter} onClick={toggleRegister}>
            <i className="bi bi-plus-lg"></i> New Light Curve
          </Button>
          <Button variant="primary" className='float-sm-end mb-3 me-sm-3' onClick={() => openStarModal()}>
            <i className="bi bi-star"></i> Star
          </Button>
        </div>
        <div className='col-12 format-table-job'>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Exp. Time (s)</th>
                <th>Start Acquisition</th>
                <th>End Acquisition</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lightCurveList?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td valign='middle'>{item.name}</td>
                    <td valign='middle'>{item.exposureTime} </td>
                    <td valign='middle'>{displayAcquisition(item.startAcquisition, item.timeFormat)} </td>
                    <td valign='middle'>{displayAcquisition(item.endAcquisition, item.timeFormat)} </td>
                    <td width="106px"><button type="button" className="btn btn-light border-btn" onClick={() => toogleOpen(item)}><i className="bi bi-check"></i> Open</button></td>
                    {!item.graficalModel
                      ? <td width="96px"><button type="button" className="btn btn-light border-btn" onClick={() => toggleEdit(item)}><i className="bi bi-pencil"></i> Edit</button></td>
                      : <td width="110px"><button type="button" className="btn btn-light border-btn" onClick={() => setResetLc(item)}><i className="bi bi-backspace"></i> Reset</button></td>
                    }
                    <td width="128px"><button type="button" className="btn btn-light border-btn" onClick={() => deleteLigthCurve(item)}><i className="bi bi-trash"></i> Remove</button></td>
                  </tr>
                )
              })}
              {lightCurveList.length === 0 &&
                <tr key='0'>
                  <td valign='middle' align='center' colSpan={"7"}>No light curve included</td>
                </tr>
              }
            </tbody>
          </Table>
        </div>
      </div>
      {showConfirmModal && (
        <ConfirmModal title="Remove light curve" text={"Do you really want to delete the light curve " + item.name + "?"} yes="yes" confirm={confirmDelete} cancel={cancelDelete} ></ConfirmModal>
      )}

      {showRegister && (
        <RegisterLightCurveModal close={toggleRegister} predictionId={prediction.id} lightCurveList={lightCurveList} />
      )}

      {showEdit && (
        <EditLightCurveModal close={() => toggleEdit()} info={item} lightCurveList={lightCurveList} />
      )}
      {showStarModal && <StarModal star={star} close={closeStarModal} />}
      {resetLc && <ConfirmModal 
        title="Reset Light Curve" 
        text={"Are you sure you want to restart fitting?"} 
        yes="Yes" 
        confirm={resetLightCurve} 
        cancel={() => setResetLc(null)} />
      }
    </>
  );
}