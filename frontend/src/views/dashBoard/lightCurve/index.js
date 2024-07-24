/* eslint-disable no-unused-vars */

import PageLoader from '../../../component/page-loader';
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import LoadLigthCurveModal from './loadLigthCurve';
import NormalizeModal from './normalize';
import { useState, useEffect } from 'react';
import LightCurveService from '../../../services/lightCurveService';
import { toast } from 'react-toastify';
import EditLightCurveModal from '../lightCurveList/editLightCurve';
import './ligthCurve.css';
import FitLigthCurveModal from './fit';
import ResultsModal from './results';
import ConfirmModal from '../../../component/confirm-modal';

export default function LightCurvePage({ value, projectId, onChange, lightCurveList }) {
  const lightCurveService = new LightCurveService();
  const [loader, showLoader, hideLoader] = PageLoader();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNormalizeModal, setShowNormalizeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFitModal, setShowFitModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lightCurve, setLightCurve] = useState();

  useEffect(() => {
    if (value) {
      setLightCurve(value);
    }
  }, [value]);

  function change(lc) {
    if (onChange) {
      onChange(lc);
    }
  }

  function saveSettings(lc) {
    showLoader()
    lightCurveService.lightCurveSettings(lc).then(() => {
      hideLoader();
      toast.success("Light Curve Settings was successfully updated");
      setShowSettingsModal(false);
      change(lc);
    }).catch(() => hideLoader());
  }

  function saveNormalize() {
    change(value);
  }

  function toggleEdit(item) {
    if (item) {
      change(item)
    }
    setShowEditModal(!showEditModal);
  }

  function resetLightCurve() {
    showLoader();
    lightCurveService.reset(lightCurve).then((lc) => {
      hideLoader();
      change(lc);
    }).catch(() => hideLoader())
  }

  return (
    <>
      <div className='row'>
        <div className='col-12 text-center'>
          <h3>
            Light Curve - {lightCurve ? lightCurve.name : ""}
            <OverlayTrigger placement="top" overlay={<Tooltip>If no plots are shown, check job status and columns in light curve.</Tooltip>}>
              <i className="bi bi-question-circle mx-2"></i>
            </OverlayTrigger>
          </h3>
          <hr />
        </div>
      </div>
      {lightCurve &&
        <div className='row'>
          {lightCurve.graficalFlux &&
            <div className='col-xs-12 col-md-6 text-center mb-3'>
              <img alt="" src={`data:image/jpeg;base64,${lightCurve.graficalFlux}`} style={{ width: '100%' }} />
            </div>
          }
          {lightCurve.graficalOpacity &&
            <div className='col-xs-12 col-md-6 text-center mb-3'>
              <img alt="" src={`data:image/jpeg;base64,${lightCurve.graficalOpacity}`} style={{ width: '100%' }} />
            </div>
          }
          {lightCurve.graficalImmersion &&
            <div className='col-xs-12 col-md-6 text-center mb-3'>
              <img alt="" src={`data:image/jpeg;base64,${lightCurve.graficalImmersion}`} style={{ width: '100%' }} />
            </div>
          }
          {lightCurve.graficalEmersion &&
            <div className='col-xs-12 col-md-6 text-center mb-3'>
              <img alt="" src={`data:image/jpeg;base64,${lightCurve.graficalEmersion}`} style={{ width: '100%' }} />
            </div>
          }
          {lightCurve.graficalModelImmersion &&
            <div className='col-xs-12 col-md-6 text-center mb-3'>
              <img alt="" src={`data:image/jpeg;base64,${lightCurve.graficalModelImmersion}`} style={{ width: '100%' }} />
            </div>
          }
          {lightCurve.graficalModelEmersion &&
            <div className='col-xs-12 col-md-6 text-center mb-3'>
              <img alt="" src={`data:image/jpeg;base64,${lightCurve.graficalModelEmersion}`} style={{ width: '100%' }} />
            </div>
          }
          {lightCurve.graficalModel &&
            <div className='col-xs-12 col-md-6 text-center mb-3'>
              <img alt="" src={`data:image/jpeg;base64,${lightCurve.graficalModel}`} style={{ width: '100%' }} />
            </div>
          }
        </div>
      }
      <div className='row'>
        <div className='col-12 text-center'>
          <hr />
        </div>
      </div>
      <div className='row fixable'>
        {lightCurve && !lightCurve.graficalModel && <>
          <div className='col-md text-center campo'>
            <Button variant="primary" className='btn-width' onClick={() => setShowEditModal(true)}>
              <i className="bi bi-pencil"></i> Edit
            </Button>
          </div>
          <div className='col-md text-center campo'>
            <Button variant="primary" className='btn-width' onClick={() => setShowNormalizeModal(true)}>
              <i className="bi bi-binoculars"></i> Normalize
            </Button>
          </div>
          <div className='col-md text-center campo'>
            <Button variant="primary" className='btn-width' onClick={() => setShowSettingsModal(true)}>
              <i className="bi bi-gear"></i> Auto Detect
            </Button>
          </div>
        </>}
        {lightCurve && lightCurve.graficalModel &&
          <div className='col-md text-center campo'>
            <Button variant="primary" className='btn-width' onClick={() => setShowResetConfirm(true)}>
              <i className="bi bi-backspace"></i> Reset
            </Button>
          </div>
        }
        <div className='col-md text-center campo'>
          <Button variant="primary" className='btn-width' onClick={() => setShowFitModal(true)}>
            <i className="bi bi-align-center"></i> LC Fit
          </Button>
        </div>
        <div className='col-md text-center campo'>
          <Button variant="primary" className='btn-width' disabled={lightCurve && !(lightCurve.graficalImmersion)} onClick={() => setShowResultsModal(true)}>
            <i className="bi bi-file-earmark-arrow-down"></i> Results
          </Button>
        </div>
      </div>
      {showSettingsModal && <LoadLigthCurveModal item={lightCurve} save={saveSettings} close={() => setShowSettingsModal(false)} />}
      {showNormalizeModal && <NormalizeModal item={lightCurve} save={saveNormalize} close={() => setShowNormalizeModal(false)} />}
      {showEditModal && <EditLightCurveModal info={lightCurve} close={toggleEdit} lightCurveList={lightCurveList} />}
      {showFitModal && <FitLigthCurveModal item={lightCurve} consolidaJob={change} close={() => setShowFitModal(false)} />}
      {showResultsModal && <ResultsModal item={lightCurve} projectId={projectId} close={() => setShowResultsModal(false)} />}
      {showResetConfirm && <ConfirmModal 
        title="Reset Light Curve" 
        text={"Are you sure you want to restart fitting?"} 
        yes="Yes" 
        confirm={resetLightCurve} 
        cancel={() => setShowResetConfirm(false)} />
      }
      {loader}
    </>
  );
}