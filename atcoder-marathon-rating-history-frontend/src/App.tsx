import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Container } from 'reactstrap';
import { SWRConfig } from 'swr';
import { NavigationBar } from './components/NavigationBar';
// import logo from './logo.svg';
import './App.css';
import { RatingPage } from './pages/rating';
import { RankingPage } from './pages/ranking';

const App: React.FC = () => {
  return (
    <div className="App">
      <SWRConfig value={{ revalidateOnFocus: false }}>
        <Router>
          <NavigationBar />
          <Container
            style={{ width: '100%', maxWidth: '90%', marginTop: '80px' }}
          >
            <Switch>
              <Route
                exact
                path="/rating/:user"
                component={RatingPage as React.FC}
              />
              <Route exact path="/rating/" component={RatingPage as React.FC} />
              <Route exact path="/ranking/" component={RankingPage} />
              <Redirect path="/" to="/rating/" />
            </Switch>
          </Container>
          <footer
            className="footer"
            style={{
              marginTop: '30px',
              padding: '30px',
              backgroundColor: '#efefef',
            }}
          >
            <div className="container">
              連絡先:{' '}
              <a
                href="https://twitter.com/iiljj"
                target="_blank"
                rel="noreferrer noopener"
              >
                si (@iiljj) / Twitter
              </a>
              {', '}
              <a
                href="https://github.com/iilj"
                target="_blank"
                rel="noreferrer noopener"
              >
                iilj (iilj) / GitHub
              </a>
            </div>
          </footer>
        </Router>
      </SWRConfig>
    </div>
  );
};

export default App;
