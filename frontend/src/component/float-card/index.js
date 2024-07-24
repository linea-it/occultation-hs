import { Card } from "react-bootstrap";
import SoraTitleComponent from '../sora-title';

const FloatCard = ({ title, children, ...rest }) => {
  return (
    <div className='container'>
      <Card {...rest}>
        <Card.Body>
          <SoraTitleComponent />
          <h4 className='text-center mb-2 fw-bold'>{title}</h4>
          <Card>
            {children}
          </Card>
        </Card.Body>
      </Card>
    </div>
  )
};

FloatCard.Body = ({ children, ...rest }) => <Card.Body {...rest}>{children}</Card.Body>
FloatCard.Footer = ({ children, ...rest }) => <Card.Footer {...rest}>{children}</Card.Footer>

export default FloatCard