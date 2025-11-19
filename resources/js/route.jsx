import { Routes, Route } from 'react-router-dom';
import Referrals from './pages/Referrals';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import Dashboard from './components/Dashboard/index';

const AppRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/referrals" element={<Referrals />} />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default AppRoute;
