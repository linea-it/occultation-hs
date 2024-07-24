
import { useState, useEffect } from 'react';
import UserService from '../../services/userService';
import { useParams, useHistory, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form } from 'react-bootstrap';
import PageLoader from '../../component/page-loader';
import FloatCard from '../../component/float-card';

const userService = new UserService();

export default function SignUpPage() {
  const history = useHistory();
  const { id } = useParams();
  const [loader, showLoader, hideLoader] = PageLoader();


  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState({});

  useEffect(() => {
    if (id && parseInt(id)) {
      userService.get(id).then((data) => {
        setUserName(data.username);
        setEmail(data.email);
      })
    }
  }, [id]);

  function handleCreate() {
    showLoader();
    userService.create({
      "username": userName,
      "email": email,
      "password": password,
      "confirm_password": confirmPassword
    }).then(() => {
      hideLoader();
      toast.success("The user was created!");
      history.push('/signin');
    }).catch((error) => {
      hideLoader();
      const resp = error.response.data;
      for (const x in resp)
        toast.error(resp[x].join(',').replace("This field", x));
    });
  }

  function validate() {
    const error = {};
    if (!isChangePassword()) {
      if (!email) {
        error.email = 'Required field';
      } else if (!validateEmail()) {
        error.email = 'Invalid e-mail';
      }

      if (!userName) {
        error.userName = 'Required field'
      }
      if (!isUpdate()) {
        if (!password) {
          error.password = 'Required field';
        }

        if (!confirmPassword) {
          error.confirmPassword = 'Required field';
        }
      } else {
        if (!oldPassword) {
          error.oldPassword = 'Required field';
        }
        if (!newPassword) {
          error.newPassword = 'Required field';
        }
        if (!confirmNewPassword) {
          error.confirmNewPassword = 'Required field';
        }
      }
    }
    setError(error);
    return Object.entries(error).length === 0;
  }

  function handleUpdate(id) {
    showLoader();
    userService.update({
      "id": id,
      "username": userName,
      "email": email,
    }).then(() => {
      hideLoader();
      toast.success("The user was updated!");
    }).catch(() => {
      hideLoader();
      toast.error('There was an error! Please re-check your form.');
    });
  }

  function validateEmail() {
    var re = /\S+@\S+\.\S+/;
    if (!re.test(email)) {
      return false;
    }
    return true;
  }

  function handleUpdatePassword(id) {
    showLoader();
    userService.changePassword(
      oldPassword, newPassword, confirmNewPassword
    ).then(() => {
      hideLoader();
      toast.success("The Password was updated!");
    }).catch(() => {
      hideLoader();
      toast.error('There was an error! Please re-check your form.');
    });
  }

  function isUpdate() {
    return id && parseInt(id);
  }

  function isChangePassword() {
    return id && id === 'change-password';
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (validate()) {
      if (isUpdate()) {
        handleUpdate(id);
      } else if (isChangePassword()) {
        handleUpdatePassword();
      } else {
        handleCreate();
      }
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FloatCard title='Sign Up'>
          <FloatCard.Body>
            {!isChangePassword() && <>
              <Form.Group className='mb-3'>
                <Form.Label>User Name<span className='require'>*</span></Form.Label>
                <Form.Control type='text' value={userName} onChange={(e) => setUserName(e.target.value)} autoFocus></Form.Control>
                {error.userName && <span className="error">{error.userName}</span>}
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>e-Mail<span className='require'>*</span></Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)}></Form.Control>
                {error.email && <span className="error">{error.email}</span>}
              </Form.Group>
              {!isUpdate() && <>
                <Form.Group className='mb-3'>
                  <Form.Label>Password<span className='require'>*</span></Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                  {error.password && <span className="error">{error.password}</span>}
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Confirm Password<span className='require'>*</span></Form.Label>
                  <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
                  {error.confirmPassword && <span className="error">{error.confirmPassword}</span>}
                </Form.Group>
              </>}
            </>}
            {isChangePassword() && <>
              <Form.Group className='mb-3'>
                <Form.Label>Password<span className='require'>*</span></Form.Label>
                <Form.Control type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}></Form.Control>
                {error.oldPassword && <span className="error">{error.oldPassword}</span>}
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
          </FloatCard.Body>
          <FloatCard.Footer>
            <Button className='me-2' variant="success" type='submit'><i className="bi bi-send"></i> Submit</Button>
            <Link to="/signin">
              <Button className="me-2"><i className="bi bi-arrow-left"></i> Back</Button>
            </Link>
          </FloatCard.Footer>
        </FloatCard>
      </Form>
      {loader}
    </>
  );
}