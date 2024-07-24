import api from './baseService';

export default class UserService {

    //constructor(){}

    list() {
        return api.get('user').then(response => response.data);
    }

    getByURL(link) {
        return api.get(`user${link}`).then(response => response.data);
    }

    get(id) {
        return api.get(`user/${id}`).then(response => response.data);
    }

    delete(id) {
        return api.delete(`user/${id}`);
    }

    create(user) {
        return api.post(`user`, user);
    }

    update(user) {
        return api.put(`user/${user.id}`, user);
    }

    changePassword(oldPassword, newPassword, confirmNewPassword) {
        return api.put(`user/change-password`, { "old_password": oldPassword, "new_password": newPassword, "confirm_new_password": confirmNewPassword });
    }

    passwordReset(email) {
        return api.post(`user/password-reset/`, { "email": email });
    }

    passwordResetConfirm(token, newPassword) {
        return api.post(`user/password-reset/confirm/`, { "token": token, "password": newPassword });
    }

    validateEmail(token){
        return api.post(`user/verify_email`, { "token": token });
    }

    login(email, password) {
        return api.post(`login`, { "email": email, "password": password });
    }

    userVerify(email) {
        return api.post(`user-verify`, { "email": email });
    }

    logout() {
        return api.post(`logout`);
    }
}