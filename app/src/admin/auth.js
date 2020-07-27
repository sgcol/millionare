import {router} from './router'

export default {
    loggedIn() {
        return !!localStorage.admin_logged;
    },
    logout() {
        delete localStorage.admin_logged;
    },
    stdret(cb) {
        return function(err) {
            if (err && err=='access denied') {
                delete localStorage.admin_logged;
                router.push('/login');
            }
            else cb.apply(null, arguments);
        }
    }
}