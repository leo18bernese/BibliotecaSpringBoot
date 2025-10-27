// src/App.js
import React from 'react';
import './App.css';
import {BrowserRouter as Router} from "react-router-dom";
import './components/user/Auth.css';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import 'antd/dist/reset.css'
import Layout from "./Layout";

const queryClient = new QueryClient();


function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Layout/>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
