import api from './baseService';

export default class ChordService {
  static list = [];
  save(chord, predictionId) {
    return api.post('chord', { ...chord, predictionId }).then(response => response.data);
  }

  remove(observer) {
    return api.delete(`chord`, { data: { id: observer.id } });
  }

  listBy(predictionId) {
    return api.get('chord', { params: { predictionId } }).then(response => response.data);
  }

  get(id) {
    return api.get('chord', { params: { id } }).then(response => response.data);
  }

  plot(predictionId) {
    return api.post('plot-chords', { predictionId }).catch(err => { throw err.response.data });
  }

  fitEllipse(ellipse, predictionId) {
    return api.post('fit-ellipse', { ...ellipse, predictionId }).catch(err => { throw err.response.data });
  }

  filterNegative({ negativeChord, step, sigma }, predictionId) {
    return api.put('filter-negative-chord', { negativeChord, step, sigma, predictionId }).catch(err => { throw err.response.data });
  }

  getEllipseResults(predictionId) {
    return api.get('ellipse-result', { params: { predictionId } }).then(response => response.data).catch(err => { throw err.response.data });
  }

  adjustePlot({ minX, maxX, minY, maxY, legendLocation }, predictionId) {
    return api.put('occultation-plot', { predictionId, minX, maxX, minY, maxY, legendLocation }).then(response => response.data).catch(err => { throw err.response.data });
  }
}