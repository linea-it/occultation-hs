/* eslint-disable no-unused-vars */
import { toast } from 'react-toastify';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLoader from '../../component/page-loader';
import { AuthContext } from '../../contexts/auth';
import { useHistory } from 'react-router-dom';
import FloatCard from '../../component/float-card';
import { Form, Button } from 'react-bootstrap';

export default function EmailValidationPage() {
  const history = useHistory();
  const { verifyEmail, signOut } = useContext(AuthContext);
  const [loader, showLoader, hideLoader] = PageLoader();
  const [code, setCode] = useState("");
  const [error, setError] = useState({});

  function handleSubmit() {
    if (validate()) {
      showLoader();
      verifyEmail(
        code
      ).then(() => {
        hideLoader();
        toast.success("email successfully validated!");
        history.push('/select-project');
      }).catch((err) => {
        hideLoader();
        toast.error(err);
      });
    }
  }

  function validate() {
    const error = {};
    if (!code) {
      error.code = 'Required field';
    }
    setError(error);
    return Object.entries(error).length === 0;
  }

  return (
    <>
      <Form>
        <FloatCard title='Email validation'>
          <FloatCard.Body>
            <Form.Group className='mb-3'>
              <Form.Text>
                <p>
                  This email has not yet been validated<br />
                  To proceed, is necessary insert the code sent by email.
                </p>
              </Form.Text>
              <Form.Label>Code<span className='require'>*</span></Form.Label>
              <Form.Control type="text" value={code} onChange={(e) => setCode(e.target.value)}></Form.Control>
              {error.code && <span className="error">{error.code}</span>}
            </Form.Group>
          </FloatCard.Body>
          <FloatCard.Footer className="p-3">
            <Button className="me-2" variant="success" onClick={handleSubmit}><i className="bi bi-send"></i> Submit</Button>
            <Link to="/select-project">
              <Button><i className="bi bi-arrow-left"></i> Back</Button>
            </Link>
            <hr></hr>
            <div>
              <label className='cursor' onClick={() => signOut()}><i className="bi bi-box-arrow-left"></i> Sign Out</label>
            </div>
          </FloatCard.Footer>
        </FloatCard>
      </Form>
      {loader}
    </>
  );
}
