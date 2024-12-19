import React from 'react';
import ReactDOM from 'react-dom/client';
import Model from './model/model';

const App = () => (
    <React.Fragment>
        <Model />
    </React.Fragment>
);

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
} else {
    console.error('Root container not found');
}