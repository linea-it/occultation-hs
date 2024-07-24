import api from './baseService';

export default class lightCurveService {

    insertLightCurve(ligthCurve){
        return api.post(`light-curve/${ligthCurve.predictionId}`, ligthCurve).then(response => response);
    }

    getLightCurves(predictionId){
        return api.get(`light-curves/${predictionId}`).then(response => response.data);
    }

    getLightCurvesByProject(projectId){
        return api.get(`light-curves-project/${projectId}`).then(response => response.data);
    }

    getLightCurve(lightCurveId){
        return api.get(`get-light-curve/${lightCurveId}`).then(response => response.data);
    }

    getLightCurveResults(lightCurveId){
        return api.get(`get-light-curve-results/${lightCurveId}`).then(response => response.data);
    }

    editLightCurve(ligthCurve){
        return api.put(`update-light-curve/${ligthCurve.id}`, ligthCurve).then(response => response);
    }

    deleteLightCurve(ligthCurve){
        return api.delete(`delete-light-curve/${ligthCurve.id}`).then(response => response);
    }

    lightCurveSettings(ligthCurve){
        return api.put(`light-curve-settings/${ligthCurve.id}`, ligthCurve).then(response => response);
    }

    detectSettings(lightCurve, params){
        return api.post(`light-curve-detect/${lightCurve.id}`, params).then(response => response.data);
    }

    ligthCurveFit(lightCurve){
        return api.post(`light-curve-fit/${lightCurve.id}`, lightCurve).then(response => response.data);
    }

    ligthCurveModel(lightCurve){
        return api.get(`light-curve-model/${lightCurve.id}`).then(response => response.data);
    }

    ligthCurveResults(lightCurve){
        return api.get(`light-curve-results/${lightCurve.id}`).then(response => response.data);
    }

    getStar(predictionId){
        return api.get(`get-star/${predictionId}`).then(response => response.data);
    }
    
    putStar(star){
        return api.put(`put-star`, star).then(response => response.data);
    }

    starCalculateDiameter(star){
        return api.post(`star-calculate-diameter`, star).then(response => response.data);
    }

    starMagnitudes(star){
        return api.post(`star-magnitudes`, star).then(response => response.data);
    }

    normalize(lightCurve, data){
        return api.post(`light-curve-normalize/${lightCurve.id}`, data).then(response => response.data);
    }

    reset(lightCurve) {
        return api.put('light-curve-reset', {id: lightCurve.id}).then(response => response.data);
    }

    negate(lightCurve) {
        return api.put('light-curve-negate', {id: lightCurve.id}).then(response => response.data);
    }
}