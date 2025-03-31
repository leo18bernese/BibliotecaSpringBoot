// src/App.js
import React from 'react';
import './App.css';
import NavBar from "./components/navbar/NavBar";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import SearchBooks from "./components/libri/search/SearchBooks";
import BookInfo from "./components/libri/details/BookInfo";

function App() {
    return (
        <Router>
            <NavBar/>
            <Routes>
                <Route path="/" element={

                    <div className="App">
                        <header className="App-header">
                            <h1>Libri List</h1>
                        </header>
                    </div>
                }/>

                <Route path="/search" element={<SearchBooks/>}/>

                <Route path="/libri/:id" element={<BookInfo/>}/>
            </Routes>


        </Router>
    );
}

export default App;