import api from './baseService';

export default class ObserverService {
  static list = [];
  save(observer, predictionId) {
    return api.post('observer', {...observer, predictionId}).then(response => response.data);
  }

  remove(observer) {
    return api.delete(`observer`, { data: {id: observer.id} });
  }

  listBy(projectId) {
    return api.get('observer', { params: {projectId} }).then(response => response.data)
  }

  get(id) {
    return api.get('observer', { params: {id} }).then(response => response.data)
  }
}