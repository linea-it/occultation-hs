import { Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import CardFloat from '../../component/float-card';
import Information from '../../component/information';

export default function AboutPage() {

  const history = useHistory();

  function goBack() {
    history.goBack();
  }

  return (
    <CardFloat title='About'>
      <CardFloat.Body>
        <Information />
      </CardFloat.Body>
      <CardFloat.Footer>
        <Button onClick={goBack}><i className="bi bi-arrow-left"></i> Back</Button>
      </CardFloat.Footer>
    </CardFloat>
  );
}