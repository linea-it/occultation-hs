import { Card, Col, ListGroup, Row } from "react-bootstrap";
import Moment from "react-moment";
import './projectDetail.css'

export default function ProjectDetail(props) {
  const project = props.project;
  const bodies = props.bodies;
  
  return (
    <>
      <Row>
        <Col className="mb-3" xxl={4} lg={12}>
          <Card className="fillRow">
            <Card.Body>
              <Card.Title>Project {project.name}</Card.Title>
              {project.description && <Card.Subtitle className="text-muted">Description</Card.Subtitle>}
              <Card.Text>{project.description}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-3" xxl={4} lg={6}>
          <Card className="fillRow">
            <Card.Body>
              <Card.Title>Solar System Bodies</Card.Title>
              <ListGroup variant="flush">
                {bodies.map(body => 
                  <ListGroup.Item key={body.id}>
                    { `${body.bodyName} - radius: ${body.radius} Km - Ephem: ${body.ephemerisBSPzipFile ? 'user BSP' : 'Horizons/JPL'}` }
                  </ListGroup.Item>)}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-3" xxl={4} lg={6}>
          <Card className="fillRow">
            <Card.Body>
              <Card.Title>Prediction Parameters</Card.Title>
                <Row>
                  <Col>
                    <span>Initial date: </span>
                    <strong><Moment format="YYYY-MM-DD HH:mm">{project.initialDateTime}</Moment></strong>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span>Final date: </span>
                    <strong><Moment format="YYYY-MM-DD HH:mm">{project.finalDateTime}</Moment></strong>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span>Star Magnitude Limit: </span>
                    <strong>{project.limitingMagnitude}</strong>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span>Catalogue: </span>
                    <strong>{project.catalog}</strong>
                  </Col>
                </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-3" xxl={4} lg={6}>
          <Card className="fillRow">
            <Card.Body>
              <Card.Title>Other Information</Card.Title>
              <Row>
                  <Col>
                    <span>Search Step (s): </span>
                    <strong>{project.searchStep}</strong>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span>Segment (divs): </span>
                    <strong>{project.segments}</strong>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span>Off-Earth Sigma: </span>
                    <strong>{project.offEarthSigma}</strong>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <span>Reference Center: </span>
                    <strong>{project.referenceCenter}</strong>
                  </Col>
                </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}