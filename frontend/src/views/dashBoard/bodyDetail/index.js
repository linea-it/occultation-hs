import './bodyDetail.css'
import Table from 'react-bootstrap/Table';
import { useState, useEffect } from 'react';

export default function BodyDetail(props) {
    const [body, setBody] = useState();
    const [eventList, setEventList] = useState();

    useEffect(() => {
        setBody(props.body);
        setEventList(props.eventList);
    }, [props.eventList, props.body]);

    return (
        <>
        <div className='row'>
            <div className='col-12 text-center'>
                <h3>Solar System body: {body ? body.bodyName : ""}</h3>
                <hr />
            </div>
        </div>
        <div className='row m-2'>
            <div className='col-12 format-table-event'>
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
                        {eventList?.map((item, index) => {
                            return (
                                <tr key={index} >
                                    <td valign='middle'>{item.name}</td>
                                    <td valign='middle'>{item.epoch}</td>
                                    <td valign='middle'>{item.vel}</td>
                                    <td valign='middle'>{item.dist}</td>
                                    <td valign='middle'>{item.g}</td>
                                    <td valign='middle'>
                                        <button type="button" className="btn btn-light border-btn" onClick={() => props.abrirPredicao(item)}><i className="bi bi-eye"></i> Event</button></td>
                                    <td valign='middle'>
                                        <button type="button" className="btn btn-light border-btn" onClick={() => props.deletePredicao(item)}><i className="bi bi-trash"></i> Delete</button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        </div>
        </>
    );
}