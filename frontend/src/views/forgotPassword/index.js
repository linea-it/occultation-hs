import UserService from '../../services/userService';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import FloatCard from '../../component/float-card';

export default function ForgotPasswordPage() {
  const userService = new UserService();
  const history = useHistory();
  const [hasCode, setHasCode] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      if (!hasCode) {
        userService.passwordReset(
          email
        ).then(() => {
          setHasCode(true);
          toast.success("The code was send by email!");
        }).catch((err) => {
          if (err && err.response && err.response.data && err.response.data.email) {
            setError({ email: err.response.data.email });
          } else {
            toast.error('There was an error! Please re-check your form.');
          }
        });
      } else {
        userService.passwordResetConfirm(
          code, newPassword
        ).then(() => {
          toast.success("Password sucessfully changed!");
          history.push('/signin')
        }).catch((err) => {
          if (err && err.response && err.response.data && err.response.data.password) {
            setError({
              newPassword: err.response.data.password.map((item, index) => <div key={index}>{item}</div>)
            })
          }
          toast.error('There was an error! Please re-check your form.');
        });
      }
    }
  }

  function validate() {
    const error = {};
    if (!hasCode) {
      if (!email) {
        error.email = 'Required field';
      } else if (!validateEmail()) {
        error.email = 'Invalid e-mail';
      }
    } else {
      if (!code) {
        error.code = 'Required field';
      }
      if (!newPassword) {
        error.newPassword = 'Required field';
      }
      if (!confirmNewPassword) {
        error.confirmNewPassword = 'Required field';
      } else if (newPassword && newPassword !== confirmNewPassword) {
        error.confirmNewPassword = "Password and confirmation doesn't match!";
      }
    }
    setError(error);
    return Object.entries(error).length === 0;
  }

  function validateEmail() {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FloatCard title='Remember Password'>
          <FloatCard.Body>
            {hasCode && <>
              <Form.Group className='mb-3'>
                <Form.Label>Code<span className='require'>*</span></Form.Label>
                <Form.Control type="text" value={code} onChange={(e) => setCode(e.target.value)}></Form.Control>
                {error.code && <span className="error">{error.code}</span>}
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>New Password<span className='require'>*</span></Form.Label>
                <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}></Form.Control>
                {error.newPassword && <span className="error">{error.newPassword}</span>}
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Confirm New Password<span className='require'>*</span></Form.Label>
                <Form.Control type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}></Form.Control>
                {error.confirmNewPassword && <span className="error">{error.confirmNewPassword}</span>}
              </Form.Group>
            </>}
            {!hasCode && <>
              <Form.Group className='mb-3'>
                <Form.Label>e-Mail<span className='require'>*</span></Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)}></Form.Control>
                {error.email && <span className="error">{error.email}</span>}
              </Form.Group>
            </>}
          </FloatCard.Body>
          <FloatCard.Footer>
            <Button className="me-2" variant="success" type="submit"><i className="bi bi-send"></i> Submit</Button>
            <Link to="/signin">
              <Button><i className="bi bi-arrow-left"></i> Back</Button>
            </Link>
          </FloatCard.Footer>
        </FloatCard>
      </Form>
    </>
  );
}

