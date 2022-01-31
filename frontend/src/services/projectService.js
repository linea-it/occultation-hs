import axios from 'axios';
import API_URL from './baseService';

export default class ProjectService{

    constructor(){}

    list() {
        const url = `${API_URL}/api/project`;
        return axios.get(url).then(response => response.data);
    }

    getByURL(link){
        const url = `${API_URL}${link}`;
        return axios.get(url).then(response => response.data);
    }

    get(id) {
        const url = `${API_URL}/api/project/${id}`;
        return axios.get(url).then(response => response.data);
    }
    delete(id){
        const url = `${API_URL}/api/project/${id}`;
        return axios.delete(url);
    }
    create(project){
        const url = `${API_URL}/api/project`;
        return axios.post(url,project);
    }
    update(project){
        const url = `${API_URL}/api/project/${project.id}`;
        return axios.put(url,project);
    }
}