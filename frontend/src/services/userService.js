import axios from 'axios';
import API_URL from './baseService';

export default class UserService{

    //constructor(){}

    list() {
        const url = `${API_URL}/api/user`;
        return axios.get(url).then(response => response.data);
    }

    getByURL(link){
        const url = `${API_URL}/api/user${link}`;
        return axios.get(url).then(response => response.data);
    }

    get(id) {
        const url = `${API_URL}/api/user/${id}`;
        return axios.get(url).then(response => response.data);
    }
    delete(id){
        const url = `${API_URL}/api/user/${id}`;
        return axios.delete(url);
    }
    create(user){
        const url = `${API_URL}/api/user`;
        return axios.post(url,user);
    }
    update(user){
        const url = `${API_URL}/api/user/${user.id}`;
        return axios.put(url,user);
    }
    changePassword(oldPassword, newPassword, confirmNewPassword){
        const url = `${API_URL}/api/user/change-password`;
        return axios.put(url,{"old_password":oldPassword, "new_password":newPassword, "confirm_new_password":confirmNewPassword});
    }
    passwordReset(email){
        const url = `${API_URL}/api/user/password-reset`;
        return axios.put(url,{"email":email});
    }
    login(email, password){
        const url = `${API_URL}/api/login`;
        return axios.post(url,{"email":email, "password":password});
    }
    logout(){
        const url = `${API_URL}/api/logout`;
        return axios.post(url);
    }

}