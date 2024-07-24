import api from './baseService';

export default class JobsService {
    list(idProjeto) {
        return api.get(`project/jobs/` + idProjeto).then(response => response.data);
    }

    deleteJob(idProjeto, status) {
        return api.delete(`project/jobs/` + idProjeto, { data: { status } }).then(response => response.data);
    }

    consolidaJob(id) {
        return api.post(`consolida-job`, { projectId: id }).then(response => response);
    }

    cancelJob(idJob) {
        return api.put(`job/cancel/` + idJob, {}).then(response => response.data);
    }

    viewJob(idJob) {
        return api.get(`job/result/` + idJob);
    }

    restartJob(idJob) {
        return api.put(`job/enqueue/` + idJob, {}).then(response => response.data);
    }

    removeJob(idJob) {
        return api.delete(`job/` + idJob).then(response => response.data);
    }
}