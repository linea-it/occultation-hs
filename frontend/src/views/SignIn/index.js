import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth'
import PageLoader from '../../component/page-loader';
import { toast } from 'react-toastify';
import Form from 'react-bootstrap/Form';
import FloatCard from '../../component/float-card';
import { Button } from 'react-bootstrap';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);
  const [loader, showLoader, hideLoader] = PageLoader();
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState({});

  function validate() {
    const error = {};
    if (!email) {
      error.email = 'Required field';
    }
    if (!password) {
      error.password = 'Required field';
    }
    setError(error);
    return Object.entries(error).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      showLoader();
      signIn(
        email, password, remember
      ).then(success => {
        if (!success) {
          hideLoader();
          toast.error('Signin failed!');
        }
      })
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FloatCard title='Sign In'>
          <FloatCard.Body>
            <Form.Group className='mb-3'>
              <Form.Label>Login</Form.Label>
              <Form.Control type='text' value={email} onChange={(e) => setEmail(e.target.value)} autoFocus></Form.Control>
              {error.email && <span className="error">{error.email}</span>}
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
              {error.password && <span className="error">{error.password}</span>}
              <Link to="/forgot-password"><div className='samll'>Forgot Password</div></Link>
            </Form.Group>
            <Form.Check type="checkbox" id="remember" label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          </FloatCard.Body>
          <FloatCard.Footer>
            <Button className='me-2' type="submit" ><i className='bi bi-box-arrow-in-right'></i> Sign in</Button>
            <Link to="/signup">
              <Button variant="success"><i className="bi bi-pencil-square"></i> Sign up</Button>
            </Link>
          </FloatCard.Footer>
        </FloatCard>
      </Form>
      {loader}
    </>
  );
}
