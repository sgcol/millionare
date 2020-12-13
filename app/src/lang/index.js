import Vue from 'vue'
import VueI18n from 'vue-i18n'
import conf from '../conf'

Vue.use(VueI18n);

const en=new Proxy ({
    recharged: 'Recharged {0}',
    whatsup:'Add this whatsup {0} to get reward',
    term:'Agree {0}',
    rule0: '3 minutes 1 issue, 2 minutes and 30 seconds to order, 30 seconds to show the lottery result. It opens all day. The total number of trade is 480 issues.',
    rule1: 'If you spend {amount} rupiah to trade, after deducting {fee} rupiah service fee, your contract amount is {bet} rupiah:',
    rule2: '"1. JOIN GREEN: if the result shows 1,3,7,9, you will get ({bet}*2) {double_bet} rupiah;"',
    rule3: '"If the result shows 5, you will get ({bet}*1.5) {onehalf_bet} rupiah."',
    rule4: '"2. JOIN RED: if the result shows 2,4,6,8, you will get ({bet}*2) {double_bet} rupiah; If the result shows 0, you will get ({bet}*1.5) {onehalf_bet} rupiah."',
    rule5: '3. JOIN VIOLET: if the result shows 0 or 5, you will get ({bet}*4.5) {fourhalf_bet} rupiah.',
    rule6: '4. SELECT NUMBER: if the result is the same as the number you selected, you will get ({bet}*9) {nineth_bet} rupiah.',
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