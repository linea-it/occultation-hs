import api from './baseService';

export default class ProjectService {

    list() {
        return api.get(`project`).then(response => response.data);
    }

    getByURL(link) {
        return api.get(`${link}`).then(response => response.data);
    }

    get(id) {
        return api.get(`project/${id}`).then(response => response.data);
    }

    delete(id) {
        return api.delete(`project/${id}`);
    }

    create(project) {
        return api.post(`project`, JSON.stringify(project));
    }

    update(project) {
        return api.put(`project/${project.id}`, project);
    }

    validateBody(bodyname, elementar, typeElementar) {
        console.log("passei");

        let info = {
            "bodyname": bodyname,
            "ephemcontent": elementar
        }

        if (typeElementar === "Name") {
            info = {
                "bodyname": bodyname,
                "ephemname": elementar
            }
        }

        return api.post(`validate-body`, info);
    }
}