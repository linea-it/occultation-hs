import { useEffect, useState } from 'react';
import { Table, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ObserverService from '../../../services/observerService';
import ConfirmModal from '../../../component/confirm-modal';
import ObserverModal from './observerModal';

export default function ObserverList(props) {
  const observerService = new ObserverService();

  const [observers, setObservers] = useState(props.observers || []);
  const [item, setItem] = useState();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showObserver, setShowObserver] = useState(false);

  useEffect(() => {
    if (props.observers) {
      setObservers(props.observers);
    }
  }, [props.observers]);

  function open(item) {
    setItem(item);
    setShowObserver(true);
  }

  function save(change) {
    if (change) {
      let list = [...observers];
      if (!item) {
        list.push(change);
      } else {
        list[item.index] = change;
      }
      setObservers(list);
      if (props.onChange) {
        props.onChange(list);
      }
    }
    setItem(undefined);
    setShowObserver(false);
  }

  function remove(item) {
    setItem(item);
    setShowConfirm(true);
  }

  function confirmRemove() {
    observerService.remove(item.value).then(() => {
      const list = observers.filter((_, i) => i !== item.index)
      setObservers(list);
      setItem(undefined);
      toast.success("Observer was successfully deleted");
      if (props.onChange) {
        props.onChange(list);
      }
    }).catch(err => toast.error(err))
  }

  function cancelRemove() {
    setItem(undefined);
    setShowConfirm(false);
  }

  return (<>
    <div className='row'>
      <div className='col-12 mt-2'>
        <h5><b>Observers - Sites</b></h5>
      </div>
    </div>
    <div className='row m-2'>
      <div className='col-12'>
        <Button variant="primary" className='float-sm-end mb-3' onClick={() => open()}>
          <i className="bi bi-plus-lg"></i> New Observer
        </Button>
      </div>
      <div className='col-12 format-table-job'>
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Site Name</th>
              <th>
                Latitude
                <OverlayTrigger placement="top" overlay={<Tooltip>Positive to North</Tooltip>}>
                  <i className="bi bi-question-circle mx-2"></i>
                </OverlayTrigger>
              </th>
              <th>
                Longitude
                <OverlayTrigger placement="top" overlay={<Tooltip>Positive to East</Tooltip>}>
                  <i className="bi bi-question-circle mx-2"></i>
                </OverlayTrigger>
              </th>
              <th>Altitude (m)</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {observers.map((item, index) => {
              return (
                <tr key={index}>
                  <td valign='middle'>{item.name}</td>
                  <td valign='middle'>{item.latitude}</td>
                  <td valign='middle'>{item.longitude}</td>
                  <td valign='middle'>{item.altitude}</td>
                  <td width="95px"><button type="button" className="btn btn-light border-btn" onClick={() => open({ value: item, index: index })}><i className="bi bi-pencil"></i> Edit</button></td>
                  <td width="130px"><button type="button" className="btn btn-light border-btn" onClick={() => remove({ value: item, index: index })}><i className="bi bi-trash"></i> Remove</button></td>
                </tr>
              )
            })}
            {observers.length < 1 &&
              <tr key='0'>
                <td valign='middle' align='center' colSpan={"6"}>No observation site included</td>
              </tr>
            }
          </tbody>
        </Table>
      </div>
    </div>
    {showConfirm &&
      <ConfirmModal title="Remove observer"
        text={"Do you really want to delete the observer " + item.value.name + "?"}
        yes="yes"
        confirm={confirmRemove} cancel={cancelRemove}>
      </ConfirmModal>
    }
    {showObserver && 
      <ObserverModal observer={item?.value} predictionId={props.predictionId} onClose={save}></ObserverModal>
    }
  </>)
}