import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';

export default function JobsPage() {
    const [jobList, setJobList] = useState([]);

    useEffect(() => {

    });

    function verify(item) {

    }

    return (
        <>
            <div className='row'>
                <div className='col-12 text-center'>
                    Jobs
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
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
                                    <td width="80px">{index + 1}</td>
                                    <td valign='middle'>{item.datetime}</td>
                                    <td valign='middle'>{item.description}</td>
                                    <td valign='middle'>{item.status}</td>
                                    <td width="130px"><button type="button" className="btn btn-light border-btn" onClick={() => verify(item)}><i className="bi bi-trash3"></i> {item.nome}</button></td>
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
