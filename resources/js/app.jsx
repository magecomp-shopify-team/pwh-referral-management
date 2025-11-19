import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import enTranslations from '@shopify/polaris/locales/en.json';
import { AppProvider } from '@shopify/polaris';
import AppRoute from './route';
import '@shopify/polaris/build/esm/styles.css';
import { NavMenu } from '@shopify/app-bridge-react';
import "../css/app.css";

const App = () => (
    <React.StrictMode>
        <BrowserRouter>
            <AppProvider i18n={enTranslations}>
                <AppRoute />
                <NavMenu>
                    <a href="/referrals">Referrals</a>
                </NavMenu>
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>
);
export const shop_data = JSON.parse(document.getElementById("shop_data").innerHTML.trim());

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
