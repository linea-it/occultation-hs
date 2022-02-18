import { useContext } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
export default function RouteWrapper({
  component: Component,
  isPrivate,
  path,
  ...rest
}) {
  const { signed, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div></div>
    )
  } 

  if (!signed && isPrivate) {
    return <Redirect to="/login" />
  }

  if (signed && path === '/login') {  
    return <Redirect to="/select-project" />
  }

  return (
    <Route
      {...rest}
      render={props => (
        <Component {...props} />
      )}
    />
  )
}

RouteWrapper.propTypes = {
  isPrivate: PropTypes.bool,
  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    .isRequired,
};

RouteWrapper.defaultProps = {
  isPrivate: false,
};