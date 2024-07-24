import CardFloat from '../../component/float-card';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Information from '../../component/information';
import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import './splash.css';


export default function SplashPage() {
  const history = useHistory();
  const { loading } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(1);
  }, [loading]);

  useEffect(() => {
    if (progress === 100) {
      history.push('/select-project');
    } else {
      setTimeout(() => {
        setProgress(progress + 1);
      }, 5 * 10);
    }
  }, [progress])

  return (
    <CardFloat>
      <CardFloat.Body>
        <Information />
      </CardFloat.Body>
      <CardFloat.Footer>
        <div className='row'>
          <div className='col-12 mt-3'>
            <progress value={progress} max="100" data-label={`${progress}%`}></progress>
          </div>
        </div>
      </CardFloat.Footer>
    </CardFloat>
  );
}