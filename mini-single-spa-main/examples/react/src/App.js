import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import { Divider } from 'antd';

import 'antd/dist/antd.min.css';
import './App.css';

import LibVersion from './components/LibVersion';
import HelloModal from './components/HelloModal';

import Home from './pages/Home';
const About = lazy(() => import('./pages/About'));

function getBasePath() {
  if (window.__IS_SINGLE_SPA__) {
    if (window.location.pathname.indexOf('/react') === 0) {
      return '/react'
    } 

    return '/multiple'
  }

  return '/'
}

const RouteExample = () => {
  return (
    <Router basename={ getBasePath() }>
      <nav>
        <Link to="/">Home</Link>
        <Divider type="vertical" />
        <Link to="/about">About</Link>
      </nav>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
        </Switch>
      </Suspense>
    </Router>
  );
};

export default function App() {
  return (
    <div className="app-main">
      <LibVersion />
      <HelloModal />

      <Divider />

      <RouteExample />
    </div>
  );
}
