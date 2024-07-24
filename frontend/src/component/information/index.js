import linea from '../../assets/logo_LIneA.jpg'
import eUniverso from '../../assets/logo_e-universo.png'
import sora from '../../assets/logo_SORA.png'
import hsf from '../../assets/logo_HSF.png'

const Information = () => {
  return (
    <>
      <div className='row'>
        <div className='col-12'>
          <main style={{ textAlign: 'justify', textIndent: '40px' }}>
            <p>OccultIn (Occultation Interface) is a system that provides easy access to (i) predicting stellar occultations by small Solar System bodies, (ii) analyzing occultation light curves, and (iii) determining the projected shapes of the occulting bodies from occultation data. The system uses the SORA (Stellar Occultation Reduction Analysis) library to run all scientific backend routines.</p>
            <p>This work was supported by the Preparing for Astrophysics with LSST Program, funded by the Heising Simons Foundation through grant 2021-2975, and administered by Las Cumbres Observatory.</p>
            <p>This project was enabled by members of the Rio Group and LIneA, and developed by <a href='http://www.11tech.com.br' target="_blank">11Tech</a> company.</p>
            <p>To learn more about this project, please check our documentation.</p>
          </main>
        </div>
      </div>
      <h4 className='text-center my-3'>Supporters</h4>
      <div className='row'>
        <div className='col-3'><img alt="LIneA" src={linea} style={{ width: '100%' }} /></div>
        <div className='col-3'><img alt="INCT do e-universo" src={eUniverso} style={{ width: '100%' }} /></div>
        <div className='col-3'><img alt="SORA" src={sora} style={{ width: '100%' }} /></div>
        <div className='col-3'><img alt="Heising Simons" src={hsf} style={{ width: '100%' }} /></div>
      </div>
    </>
  )
}
export default Information