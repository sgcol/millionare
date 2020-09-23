import Vue from 'vue'
import VueI18n from 'vue-i18n'
import conf from '../conf'

Vue.use(VueI18n);

const en=new Proxy ({
    term:'Agree {0}',
    "Select amount:(₹500-₹50000)":"Select amount:(Rp500k-Rp50000k)",
    "The amount must be between 500 and 50,000 and be divisible by 100":'The amount must be between 500k and 50,000k and be divisible by 100k',
    'The cash withdrawal amout must be at least ₹500.':'The cash withdrawal amout must be at least Rp500k.',
    'Daily cash withdrawal limit of ₹50000.':'Daily cash withdrawal limit of Rp50000k.',
    'The amount entered must be an integral multiple of ₹100.':'The amount entered must be an integral multiple of Rp100k.',
    'The service charge shall be deducetd by payment channel :5%.':'The service charge shall be deducetd by payment channel :5%+Rp7k.',
    '../assets/paytm.png':'../assets/ovo.png',
    '+ Add Paytm ID':'+ Add OVO',
    'Add Paytm ID':'Add OVO ID',
}, {
    get(target, prop) {
        if (typeof prop!=='string') return undefined;
        if (target[prop]) return target[prop];
        return prop
    }
}),
revert =new Proxy({
    term:'eergA {0}',
    currency:{
        style:'currency', currency:'IDR'
    }
}, {
    get(target, prop) {
        if (typeof prop!=='string') return undefined;
        if (target[prop]) return target[prop];
        var reversed=prop.split('').reduce((reversed, character) => character + reversed, '');
        target[prop]=reversed;
        return reversed;
    }
});

const i18n=new VueI18n(
	{
		locale:conf.lang,
		fallbackLocale:'logit',
		messages:{
            en, revert, 
            logit: new Proxy({}, {
                get(target, prop) {
                    if (!window.collected) window.collected={};
                    if (typeof prop==='string') window.collected[prop]=1;
                    return en[prop];
                }
            }),
			idn:require('./idn.js')
		}
	}
)

window.i18n=i18n;

export default i18n;