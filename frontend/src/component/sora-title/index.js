import SoraVersionComponent from "../sora-version";
import logo from '../../assets/logo_occultation_interface.svg';

export default function SoraTitleComponent() {
    return (<div className="text-center py-5"><img className="col-6" alt="logo" src={logo} /><SoraVersionComponent/></div>);
}