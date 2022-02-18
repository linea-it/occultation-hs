import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
import AuthProvider from './contexts/auth';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function App() {
    return (        
        <AuthProvider>
            <div  className="container-fluid">
                <div  className="page content">
                    <header>
                        <h1>Sora - 1.0</h1>
                    </header>  
                    <main>
                        <BrowserRouter>
                            <Routes />
                        </BrowserRouter>
                    </main>
                </div>
            </div>
            <ToastContainer autoClose={3000} />
        </AuthProvider>
    );
}