import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
import AuthProvider from './contexts/auth';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter basename="/gui">
                <Routes />
            </BrowserRouter>
            <ToastContainer autoClose={3000} />
        </AuthProvider>
    );
}