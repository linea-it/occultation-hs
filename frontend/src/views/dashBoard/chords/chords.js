import './chords.css';
import { useEffect, useState } from 'react';
import { Table, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ChordService from '../../../services/chordService';
import ConfirmModal from '../../../component/confirm-modal';
import ChordModal from './chordModal';
import EllipseModal from './ellipseModal';
import FilterNegativeChordModal from './filterNegativeChordModal';
import EllipseResultsModal from './ellipseResultModal';
import PlotModal from './plotModal';

export default function ChordsPage({prediction, lightCurveList, observerList, onChange, onCosolidate}) {
  const chordService = new ChordService();

  const [chords, setChords] = useState([]);
  const [ellipse, setEllipse] = useState();
  const [item, setItem] = useState();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChordModal, setShowChordModal] = useState(false);
  const [showElipseModal, setShowElipseModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPlotModal, setShowPlotModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (prediction) {
      chordService.listBy(prediction.id).then(response => {
        if (mounted) {
          setChords(response.chords);
          setEllipse(response.ellipse);
        }
      });
    }
    return () => mounted = false;
  }, [prediction]);

  function change(chords) {
    if (onChange) {
      onChange(chords);
    }
  }

  function consolidate() {
    if (onCosolidate) {
      onCosolidate();
    }
  }

  function open(item) {
    setItem(item);
    setShowChordModal(true);
  }

  function plot() {
    chordService.plot(prediction.id).then(() => {
      toast.success("Plot task was successfully created");
      consolidate();
    }).catch(err => {
      toast.error(err);
    })
  }

  function save(change) {
    if (change) {
      let list = [...chords];
      if (!item) {
        list.push(change);
      } else {
        list[item.index] = change;
      }
      setChords(list);
    }
    setItem(undefined);
    setShowChordModal(false);
  }

  function remove(item) {
    setItem(item);
    setShowConfirm(true);
  }

  function confirmRemove() {
    chordService.remove(item.value).then(() => {
      const list = chords.filter((_, i) => i !== item.index)
      setChords(list);
      setItem(undefined);
      toast.success("Chord was successfully deleted");
      change(list);
    }).catch(err => toast.error(err))
  }

  function cancelRemove() {
    setItem(undefined);
    setShowConfirm(false);
  }

  function closeModal(success) {
    setShowElipseModal(false);
    setShowFilterModal(false);
    setShowPlotModal(false);
    if (success) {
      consolidate();
    }
  }

  return (<>
    <div className='row'>
      <div className='col-12 mt-2'>
        <h5><b>Chords</b></h5>
      </div>
    </div>
    <div className='row'>
      <div className='col-12'>
        <Button variant="primary" className='float-sm-end mb-3' onClick={() => open()}>
          <i className="bi bi-plus-lg"></i> New Chord
        </Button>
      </div>
      <div className='col-12'>
        <div className='p-2 mb-3' style={{ backgroundColor: 'white' }}>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Chord Name</th>
                <th>Light Curve</th>
                <th>Observer</th>
                <th>Color</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {chords.map((item, index) => {
                return (
                  <tr key={index}>
                    <td valign='middle'>{item.name}</td>
                    <td valign='middle'>{item.lightCurve_name}</td>
                    <td valign='middle'>{item.observer_name}</td>
                    <td valign='middle'><div style={{ height: "20px", width: "50px", backgroundColor: item.color }}></div></td>
                    <td width="95px"><button type="button" className="btn btn-light border-btn" onClick={() => open({ value: item, index: index })}><i className="bi bi-pencil"></i> Edit</button></td>
                    <td width="130px"><button type="button" className="btn btn-light border-btn" onClick={() => remove({ value: item, index: index })}><i className="bi bi-trash"></i> Remove</button></td>
                  </tr>
                )
              })}
              {chords.length < 1 &&
                <tr key='0'>
                  <td valign='middle' align='center' colSpan={"6"}>No chords included</td>
                </tr>
              }
            </tbody>
          </Table>
        </div>
      </div>
    </div>
    <div className='row'>
      {prediction.graficalOccultation &&
        <div className='col-12 mb-3 position-relative'>
          <OverlayTrigger overlay={<Tooltip>Plot Tool</Tooltip>}>
            <Button className='position-absolute top-0 end-0 plot-tool' variant='outline-secondary' size='sm' onClick={() => setShowPlotModal(true)}>
              <i className="bi bi-aspect-ratio"></i>
            </Button>
          </OverlayTrigger>
          <img src={`data:image/jpeg;base64,${prediction.graficalOccultation}`} style={{ width: '100%' }} alt=""/>
        </div>
      }
      {prediction.ellipseChi2Images &&
        Object.values(prediction.ellipseChi2Images).map((value, index) =>
          <div className='col-12 col-md-6 mb-3' key={index}>
            <img src={`data:image/jpeg;base64,${value}`} style={{ width: '100%' }} alt=""/>
          </div>
        )
      }
    </div>
    <div className='padding-action-bar'></div>
    <div className='col-7 col-md-9 position-fixed bottom-0 end-0 action-bar'>
      <div className='row'>
        <div className='col'>
          <Button variant="primary" className='btn-width' onClick={() => plot()}>
            <i className="bi bi-list-nested"></i> Plot Chords
          </Button>
        </div>
        <div className='col'>
          <Button variant="primary" className='btn-width' onClick={() => setShowElipseModal(true)}>
            <i className="bi bi-filter-circle"></i> Fit Elipse
          </Button>
        </div>
        <div className='col'>
          <Button variant="primary" className='btn-width' disabled={prediction && !prediction.ellipseChi2Images} onClick={() => setShowFilterModal(true)}>
            <i className="bi bi-arrow-bar-up"></i> Filter
          </Button>
        </div>
        <div className='col'>
          <Button variant="primary" className='btn-width' disabled={prediction && !prediction.ellipseChi2Images} onClick={() => setShowResultModal(true)}>
            <i className="bi bi-file-earmark-arrow-down"></i> Results
          </Button>
        </div>
      </div>
    </div>
    {showConfirm &&
      <ConfirmModal title="Remove chord"
        text={"Do you really want to delete the chord " + item.value.name + "?"}
        yes="yes"
        confirm={confirmRemove} cancel={cancelRemove}>
      </ConfirmModal>
    }
    {showChordModal &&
      <ChordModal
        lightCurveList={lightCurveList}
        observerList={observerList}
        predictionId={prediction.id}
        value={item?.value}
        onClose={save}
      />
    }
    {showElipseModal &&
      <EllipseModal predictionId={prediction.id} ellipse={ellipse} onClose={closeModal}></EllipseModal>
    }
    {showFilterModal &&
      <FilterNegativeChordModal predictionId={prediction.id} value={ellipse} chordList={chords} onClose={closeModal} />
    }
    {showResultModal &&
      <EllipseResultsModal predictionId={prediction.id} value={prediction.ellipseResult} onClose={() => setShowResultModal(false)} />
    }
    {showPlotModal &&
      <PlotModal predictionId={prediction.id} value={ellipse} onClose={closeModal} />
    }
  </>)
}