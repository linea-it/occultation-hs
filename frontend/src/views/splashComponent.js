import React, { Component } from 'react';

const WithRouterAction = (Children) => {
    return(props)=>{
        return <Children {...props}/>
    }
}

class SplashComponent extends Component {
    constructor(props) {
        super(props);
      }

      componentDidMount(){
        setTimeout(this.carregamento,0,this);
      }

      carregamento(self){
        let delay = document.getElementById("delay");
		const valor = delay.value;
		if (valor === 100)
            self.proximo();
		else
		{
			delay.value=valor+1;
			setTimeout(self.carregamento,5*10,self);
		}
	  }
	
      proximo()
      {
        let url = window.location.href;
        let pos = url.lastIndexOf('/');
        url = url.substr(0,pos)+'/login';
        console.log(url);
        document.location.assign(url);
      }

      render() {
        return (
          <div className='dialog'>
          <main>
            <p>Sistema para mediacao de micro-astros atraves de ocultacoes</p>
            <p>Sistema é dividido em 3 etapas:</p>
            <ul><li>Predicao: para a previdao de quando vao acontecer as ocultacoes</li>
            <li>Curva de Luz: ajuste e seleção da curvas de luz a serem utilizadas</li>
            <li>Cordas: Ajustes e seleção das cordas a seram utilizadas</li></ul>
            <h2>Créditos:</h2>
            <a href="mailto:'autor1@gmail.com.br'"><label>Autor1</label></a>
            <a href="mailto:'autor2@gmail.com.br'"><label>Autor2</label></a>
            <a href="mailto:'autor3@gmail.com.br'"><label>Autor3</label></a>
            <h2>Apoio:</h2>
            <a href="'https://www.hsfoundation.org/'"><label>Heising-Simons Fundation</label></a>
            <a href="'https://linea.gov.br/'"><label>LineA</label></a>
            <a href="www.11tech.com.br"><label>11 Tech</label></a>              
          </main>
          <footer>
            <label for="delay">Carregando:</label>
            <progress id="delay" value="0" max="100">0%</progress>
          </footer>
          </div>  
        );
      }
}

export default WithRouterAction(SplashComponent)