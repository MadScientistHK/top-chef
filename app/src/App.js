import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import deals from './deals.json'


class App extends Component {
	constructor(){
          super();
		  this.resto = deals;		  
      }
	
	render() {
		
		var res = [];
		var i = 0;
		while(i < deals.length){
			res[i] = <li><a href={this.resto[i].urlFourchette}>{this.resto[i].name}</a></li>;
			i++;
			
		}	
		return (
		  <div className="App">
			<header className="App-header">
			  <img src={logo} className="App-logo" alt="logo" />
			  <h1 className="App-title"> Deals from LaFourchette</h1>
			</header>
				
			<div className="Result">
				<ul>
					{res}
				</ul>
			</div>
			
		  </div>
		);
	  }
}


export default App;
