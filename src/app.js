import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Home } from './components';

import './index.less';

class App extends Component {
	state = {}

	change = (key) => (value) => this.setState({ [key]: value })

	render () {
	  return (
			<div className='app'>
				<Home />
		 	</div>
	  );
	}
}

ReactDOM.render(<App/>, document.getElementById('app'));
