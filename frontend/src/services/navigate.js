export default class NavigateService {
    navigate(path) {
        let url = window.location.href;
        let pos = url.lastIndexOf('/');
        url = url.substr(0, pos) + path;
        document.location.assign(url);
    }
}