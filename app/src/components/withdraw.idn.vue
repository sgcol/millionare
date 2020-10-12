<template>
	<b-form id="withdrawInIdr">
		<b-form-group :label="$t('Withdrawable')">
			<p style="font-size:24px; margin-top:5px">Rp {{me?Number(me.balance).toFixed(2): '-'}}</p>
		</b-form-group>

		<b-form-group :label="$t('Amount')" :invalid-feedback="amountInvalid" :state="amountState">
			<b-form-input type="number" v-model="amount" :state="amountState"></b-form-input>
		</b-form-group>
		<b-form-group :label="$t('Account Name')" :invalid-feedback="$t('Please enter account name.')" :state="ownerState">
			<b-form-input v-model="accountName" :state="ownerState"></b-form-input>
		</b-form-group>
		<b-form-group :label="$t('Phone')" :invalid-feedback="$t('Please enter your phone number')" :state="phoneState">
			<b-form-input type="tel" v-model="phone" :state="phoneState"></b-form-input>
		</b-form-group>
		<b-form-group :label="$t('Bank Name')" :state="!!bank" :invalid-feedback="$t('Please select a bank')">
			<vue-bootstrap-typeahead v-model="bank" :data="banklist"></vue-bootstrap-typeahead>
		</b-form-group>
		<b-form-group :label="$t('Account No.')" :state="accountNoState" :invalid-feedback="$t('Please enter your account number')">
			<b-form-input v-model="accountNo" :data="banklist" :state="accountNoState"></b-form-input>
		</b-form-group>
		<p>{{$t('The denomination should exceed Rp 500,000')}}</p>
		<p>{{$t('The maximum withdrawal amount per day is Rp 6,000,000')}}</p>
		<p>{{$t('Input must be a multiple of Rp 10.000')}}</p>
		<b-button type="submit" variant="primary" block @click="idr_withdraw">{{$t('Withdraw')}}</b-button>
	</b-form>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead'
import {openLink} from '../client'
import AsyncComputed from 'vue-async-computed'

Vue.use(AsyncComputed)

// Global registration
Vue.component('vue-bootstrap-typeahead', VueBootstrapTypeahead)

function currentTimezone() {
	var tz=new Date().getTimezoneOffset(), hh=Math.floor(tz/60), mm=tz-hh*60;
	if (hh>=0) return '-'+('00'+hh).slice(-2)+':'+('00'+mm).slice(-2);
	else return '+'+('00'+(-hh)).slice(-2)+':'+('00'+mm).slice(-2);
}

export default {
	name:'WithdrawIdr',
	components:{
		VueBootstrapTypeahead,
	},
	asyncComputed :{
		amountState() {
			var self=this;
			var sock=openLink();
			if (this.amount>this.me.balance) {
				this.amountErr='Not enough balance';
				return false;
			}
			if (this.amount<500000) {
				this.amountErr='The amount must be exceeded 500000';
				return false;
			}
			if (Math.floor(this.amount/10000)*10000!=this.amount) {
				this.amountErr=('The amount must be divisible by 10000');
				return false;
			}
			var dailylimit=new Promise((resolve, reject)=>{
				var preChk=self.amount<=self.me.balance && self.amount>=500000 && Math.floor(self.amount/10000)*10000==self.amount;
				if (!preChk) return resolve(preChk);
				sock.emit('dailywithdraw', currentTimezone(), (err, total)=>{
					if (err) return reject(err);
					if ((Number(self.amount)+total)<=6000000) return resolve(true);
					self.amountErr='The maximum withdrawal amount per day is Rp 6,000,000';
					return resolve(false);
				})
			}),
			qualified=new Promise((resolve, reject)=>{
				sock.emit('idr_withdrawqualified', (err, q)=>{
					if (err) return reject(err);
					if (!q) self.amountErr='The bet amount MUST be greater than the top-up amount to withdraw cash';
					resolve(q);
				})
			});
			return Promise.all([dailylimit, qualified]).then(results=>(results[0]&&results[1]), ()=>(null));
		},
	},
	computed:{
		// amountInvalid() {
		// 	if (this.amount>this.me.balance) return this.$i18n.t('Not enough balance');
		// 	if (this.amount<500000) return this.$i18n.t('The amount must be exceeded 500000');
		// 	if (Math.floor(this.amount/10000)*10000!=this.amount) return this.$i18n.t('The amount must be divisible by 10000');
		// 	return this.$i18n.t('The maximum withdrawal amount per day is Rp 6,000,000');
		// },
		amountInvalid() {
			if (!this.amountErr) return null;
			return this.$i18n.t(this.amountErr);
		},
		ownerState() {
			return this.accountName.length>0;
		},
		phoneState() {
			return typeof this.phone=='string' && this.phone.length>0;
		},
		accountNoState() {
			return typeof this.accountNo=='string' && this.accountNo.length>0;
		},
		...mapState({
			status: state=>state.status,
			me: state => state.me,
			fb: state=>state.fb,
		}),
	},
	methods:{
		idr_withdraw(e) {
			e.preventDefault();
			var self=this;
			if (!this.amountState || !this.ownerState || !this.accountNoState ||!this.phoneState || !this.bank) return;
			var order={amount:this.amount, accountName:this.accountName, accountNo:this.accountNo, phone:this.phone, bankCode:toBankCode[this.bank], bankName:this.bank};
			console.log(order);
			openLink(sock=>{
				sock.emit('idr_withdraw', order, (err)=>{
					if (err) return alert(err);
					alert(self.$i18n.t('Success'));
				})
			})
		}
	},
	mounted() {
		var self=this;
		openLink(sock=>{
			sock.emit('idr_bankinfo', (err, bi)=>{
				if (err) return alert(self.$i18n.t(err));
				for (var key in bi) {
					if (key=='amount') continue;
					if (key=='bankCode') self.bank=toBankName[bi.bankCode];
					else self[key]=bi[key];
				}
			})
		});
	},
	data() {
		return {
			amount:500000,
			accountName:'',
			bank:'',
			phone:null,
			accountNo:null,
			banklist:banklist.map(v=>v.text),
			amountErr:null,
		}
	}
}

const banklist=[
			{code:'ABAMIDD1', text:'BANK ABN AMRO'},
			{code:'ABNAIDJA', text:'Royal Bank of Scotland (RBS)'},
			{code:'AGNIIDD1', text:'BANK AGRO NIAGA'},
			{code:'AGSSIDJA', text:'Bank Agris'},
			{code:'AGTBIDJA', text:'Bank BRI Agroniaga'},
			{code:'AKITIDD1', text:'BANK AKITA'},
			{code:'ALTOIDD1', text:'ALTOPAY'},
			{code:'AMEXIDD1', text:'AMERICAN EXPRESS BANK LTD'},
			{code:'ANINIDD1', text:'ANGLOMAS INTERNASIONAL BANK'},
			{code:'ANTAIDD1', text:'BANK ANTARDAERAH'},
			{code:'PDWGIDJ1', text:'BPD SULAWESI TENGAH'},
			{code:'PDIJIDJ1', text:'BPD PAPUA'},
			{code:'BSDRIDJA', text:'BANK SAUDARA'},
			{code:'ANZBIDJX', text:'ANZ PANIN BANK'},
			{code:'ARFAIDJ1', text:'Bank Panin Syariah'},
			{code:'ARNKIDJ1', text:'BANK ARTA NIAGA KENCANA'},
			{code:'ARTGIDJ1', text:'BANK ARTHA GRAHA INTERNASIONAL'},
			{code:'ARTGIDJA', text:'BANK ARTHA GRAHA'},
			{code:'ATOSIDJ1', text:'BANK ARTOS IND'},
			{code:'ATPLIDD1', text:'ATMB PLUS'},
			{code:'AWANIDJA', text:'BANK QNB KESAWAN'},
			{code:'BBAIIDJA', text:'BANK BUMI ARTA'},
			{code:'PDBKIDJ1', text:'BPD BENGKULU'},
			{code:'BBBAIDJA', text:'PERMATA BANK'},
			{code:'BBIJIDJA', text:'BANK UOB INDONESIA'},
			{code:'PDMLIDJ1', text:'BPD MALUKU'},
			{code:'BBUKIDJA', text:'BANK BUKOPIN'},
			{code:'BCIAIDJA', text:'BANK CAPITAL INDONESIA'},
			{code:'BDINIDJA', text:'BANK DANAMON INDONESIA'},
			{code:'BDIPIDJ1', text:'Bank Sahabat Sampoerna'},
			{code:'VICTIDJ1', text:'BANK VICTORIA INTERNASIONAL'},
			{code:'BDKIIDJA', text:'BANK DKI'},
			{code:'BENGIDD1', text:'BANK BENGKULU'},
			{code:'BHAGIDS1', text:'BANK HAGAKITA'},
			{code:'BICNIDJA', text:'BANK COMMONWEALTH'},
			{code:'BIDXIDJA', text:'BANK INDEX SELINDO'},
			{code:'BIFIIDD1', text:'BANK IFI'},
			{code:'BINGIDD1', text:'ING INDONESIA BANK'},
			{code:'BKCHIDJA', text:'BANK OF CHINA LIMITED'},
			{code:'BKIDIDJA', text:'Bank of India Indonesia'},
			{code:'BKKBIDJA', text:'THE BANGKOK BANK COMP. LTD'},
			{code:'BMRIIDJA', text:'BANK MANDIRI'},
			{code:'BMSEIDJA', text:'BANK MULTI ARTA SENTOSA'},
			{code:'BNIAIDJA', text:'BANK CIMB NIAGA'},
			{code:'BNINIDJA', text:'BANK BNI'},
			{code:'BNPAIDJA', text:'BANK BNP PARIBAS INDONESIA'},
			{code:'BOFAID2X', text:'BANK OF AMERICA, N.A'},
			{code:'BOTKIDJX', text:'THE BANK OF TOKYO MITSUBISHI UFJ LTD'},
			{code:'BPEKIDD1', text:'BPR EKA'},
			{code:'BPIAIDJA', text:'BANK RESONA PERDANIA'},
			{code:'BPKSIDD1', text:'BPR KS'},
			{code:'BPLSIDD1', text:'BPR/LSB'},
			{code:'BRINIDJA', text:'BANK BRI'},
			{code:'SYNIIDJ1', text:'BANK BNI SYARIAH'},
			{code:'BSSPIDSP', text:'BANK SUMSEL'},
			{code:'BTANIDJA', text:'BANK TABUNGAN NEGARA (BTN)'},
			{code:'BUINIDD1', text:'BANK BUANA IND'},
			{code:'BUMIIDJA', text:'BANK MNC/BANK BUMIPUTERA'},
			{code:'BUSTIDJ1', text:'BANK BISNIS INTERNASIONAL'},
			{code:'BUTGIDJ1', text:'BANK SYARIAH MEGA'},
			{code:'BVICIDJA', text:'BANK VICTORIA INTERNATIONAL'},
			{code:'BWKIIDJA', text:'Bank Windu Kencana'},
			{code:'CENAIDJA', text:'BANK BCA'},
			{code:'CHASIDJX', text:'JP. MORGAN CHASE BANK, N.A.'},
			{code:'CICTIDJA', text:'Bank Mutiara'},
			{code:'PDJGIDJ1', text:'BPD JAWA TENGAH'},
			{code:'CIMBIDD1', text:'BANK CIMB NIAGA SYARIAH'},
			{code:'CITIIDD1', text:'CITIBANK N.A.'},
			{code:'CITIIDJX', text:'CITIBANK'},
			{code:'UOBBIDJA', text:'UOB Indonesia'},
			{code:'CNBAIDJ1', text:'CENTRATAMA NASIONAL BANK'},
			{code:'CRAGIDD1', text:'BANK CREDIT AGRICOLE INDOSUEZ'},
			{code:'CTCBIDJA', text:'BANK CHINA TRUST INDONESIA'},
			{code:'MASPIDJA', text:'BANK MASPION INDONESIA'},
			{code:'DBSBIDJA', text:'BANK DBS INDONESIA'},
			{code:'DEUTIDJA', text:'DEUTSCHE BANK AG.'},
			{code:'DIINIDD1', text:'BANK DIPO INTERNATIONAL'},
			{code:'DJARIDJ1', text:'BANK BRI SYARIAH'},
			{code:'DOKUIDD1', text:'DOKU'},
			{code:'EKONIDD1', text:'BANK EKONOMI'},
			{code:'EKSEIDD1', text:'BANK EKSEKUTIF'},
			{code:'EKSPIDD1', text:'BANK EKSPOR INDONESIA'},
			{code:'FAMAIDJ1', text:'BANK FAMA INTERNASIONAL'},
			{code:'FINCIDD1', text:'BANK FINCONESIA'},
			{code:'GNESIDJA', text:'BANK GANESHA'},
			{code:'HAGAIDD1', text:'BANK HAGA'},
			{code:'HAINIDD1', text:'BANK HARMONI INTERNATIONAL'},
			{code:'HAINIDJ1', text:'HALIM INDONESIA BANK'},
			{code:'HARFIDD1', text:'BANK HARFA'},
			{code:'HNBNIDJA', text:'BANK HANA'},
			{code:'HRDAIDJ1', text:'BANK HARDA'},
			{code:'HSBCIDD1', text:'HSBC Indonesia (formerly Bank Ekonomi Raharja)'},
			{code:'HSBCIDJA', text:'THE HONGKONG & SHANGHAI B.C. (BANK HSBC)'},
			{code:'HVBKIDD1', text:'Bank Woori Saudara Indonesia 1906 (formerly Bank Himpunan Saudara and Bank Woori Indonesia)'},
			{code:'HVBKIDJ1', text:'BANK WOORI INDONESIA'},
			{code:'HVBKIDJA', text:'BANK HIMPUNAN SAUDARA 1906'},
			{code:'IBBKIDJA', text:'BANK BII MAYBANK'},
			{code:'PDRIIDJ1', text:'BPD RIAU'},
			{code:'ICBKIDJA', text:'Bank ICBC Indonesia'},
			{code:'IDMOIDJ1', text:'Bank SBI Indonesia'},
			{code:'IDSTIDD1', text:'INDOSAT (DOMPETKU)'},
			{code:'IFISIDD1', text:'BANK IFI SYARIAH'},
			{code:'INDOIDD1', text:'BANK INDOMONEX'},
			{code:'INDOIDJA', text:'BANK INDONESIA'},
			{code:'INPBIDJ1', text:'Bank Ina Perdania'},
			{code:'INPEIDD1', text:'BANK INA PERDANA'},
			{code:'JAJAIDD1', text:'BANK JASA JAKARTA'},
			{code:'JAJSIDJ1', text:'BANK JASA JAKARTA'},
			{code:'JAMBIDD1', text:'BPD JAMBI'},
			{code:'JBDBIDD1', text:'PT. BPD JAWA BARAT DAN BANTEN, Tbk'},
			{code:'JENIIDD1', text:'JENIUS'},
			{code:'KALTIDD1', text:'BPD KALTENG'},
			{code:'KETAIDD1', text:'BANK KEPPEL TATLEE BUANA'},
			{code:'KOEXIDD1', text:'KOREA EXCHANGE BANK DANAMON'},
			{code:'KSEBIDJ1', text:'BANK KESEJAHTERAAN EKONOMI'},
			{code:'LIINIDD1', text:'LIMAN INTERNATIONAL BANK'},
			{code:'LIPPIDD1', text:'BANK LIPPO'},
			{code:'LMANIDJ1', text:'Bank Dinar Indonesia'},
			{code:'LOMAIDJ1', text:'Bank Amar Indonesia (formerly Anglomas International Bank)'},
			{code:'LOMAIDJ2', text:'Anglomas International Bank'},
			{code:'LPEIIDJ1', text:'Indonesia Eximbank (formerly Bank Ekspor Indonesia)'},
			{code:'MAECIDD1', text:'Mandiri E-Cash'},
			{code:'MAINIDD1', text:'BANK MAYBANK INDOCORP'},
			{code:'MALUIDD1', text:'BANK MALUKU'},
			{code:'MASDIDJS', text:'BANK MASPION'},
			{code:'MAYAIDJA', text:'BANK MAYAPADA INTERNATIONAL'},
			{code:'BDKIIDJ1', text:'BPD DKI JAKARTA'},
			{code:'MAYOIDJA', text:'BANK MAYORA'},
			{code:'MBBEIDJA', text:'MAYBANK INDONESIA SYARIAH'},
			{code:'PDSBIDJ1', text:'BPD SUMATERA BARAT/BANK NAGARI'},
			{code:'MEDHIDS1', text:'BANK MESTIKA'},
			{code:'MEEKIDJ1', text:'BANK METRO EXPRESS'},
			{code:'MEGAIDJA', text:'BANK MEGA'},
			{code:'899', text:'DOKU'},
			{code:'MERIIDD1', text:'BANK MERINCORP'},
			{code:'MGABIDJ1', text:'BANK MITRANIAGA'},
			{code:'MHCCIDJA', text:'BANK MIZUHO INDONESIA'},
			{code:'MUABIDJA', text:'BANK MUAMALAT'},
			{code:'NISPIDJA', text:'BANK OCBC NISP'},
			{code:'NOBUIDJA', text:'Bank National Nobu'},
			{code:'NUPAIDJ6', text:'BANK NUSANTARA PARAHYANGAN'},
			{code:'OCINIDD1', text:'BANK OCBC – INDONESIA'},
			{code:'PAPUIDD1', text:'BPD PAPUA'},
			{code:'PDACIDJ1', text:'BPD ACEH'},
			{code:'PDSUIDJ1', text:'BPD SUMATERA UTARA'},
			{code:'PDBAIDJ1', text:'BPD BALI'},
			{code:'PDBBIDJ1', text:'BPD Banten (formerly Bank Pundi Indonesia)'},
			{code:'PDJBIDJA', text:'Bank BJB'},
			{code:'PDJGIDJA', text:'BANK JATENG'},
			{code:'PDJTIDJ1', text:'BANK JATIM'},
			{code:'PDJMIDJ1', text:'BPD JAMBI'},
			{code:'PDKBIDJ1', text:'BPD KALIMANTAN BARAT'},
			{code:'PDKTIDJ1', text:'BPD KALIMANTAN TIMUR'},
			{code:'PDKGIDJ1', text:'BPD Kalimantan Tengah'},
			{code:'PDKSIDJ1', text:'BPD KALSEL'},
			{code:'PDKTIDJA', text:'BPD KALTIM'},
			{code:'PDLPIDJ1', text:'BANK LAMPUNG'},
			{code:'PDNBIDJ1', text:'BPD NTB'},
			{code:'PDNTIDJ1', text:'BANK NTT'},
			{code:'PDRIIDJA', text:'BANK RIAU'},
			{code:'PDSBIDSP', text:'BANK NAGARI'},
			{code:'PDSUIDSA', text:'BANK SUMUT'},
			{code:'PDWRIDJ1', text:'BPD Sulawesi Tenggara'},
			{code:'PDWSIDJ1', text:'BPD SULAWESI SELATAN'},
			{code:'LFIBIDJ1', text:'BANK NATIONAL NOBU'},
			{code:'PDWUIDJ1', text:'BANK SULUT'},
			{code:'PDYKIDJ1', text:'BPD YOGYAKARTA'},
			{code:'PDYSIDJ1', text:'BPD DIY SYARIAH'},
			{code:'PERSIDD1', text:'BANK PERSYARIKATAN INDONESIA'},
			{code:'PINBIDJA', text:'BANK PANIN'},
			{code:'PMASIDJ1', text:'PRIMA MASTER BANK'},
			{code:'PUBAIDJ1', text:'BTPN Syariah (formerly BTPN UUS and Bank Sahabat Purba Danarta)'},
			{code:'PUDAIDD1', text:'BANK PURBA DANARTA'},
			{code:'RABOIDJA', text:'RABOBANK INTERNASIONAL INDONESIA'},
			{code:'RAKYIDD1', text:'PT BANK RAKYAT INDONESIA AGRONIAGA, TBK.'},
			{code:'RIPAIDJ1', text:'Bank Andara'},
			{code:'RIPAIDJ2', text:'Bank Oke Indonesia (formerly Bank Andara)'},
			{code:'ROYBIDJ1', text:'BANK ROYAL INDONESIA'},
			{code:'SBJKIDJA', text:'BANK SINARMAS'},
			{code:'SCBLIDJX', text:'STANDARD CHARTERED BANK'},
			{code:'SDOBIDJ1', text:'Bank Syariah Bukopin'},
			{code:'SGODIDD1', text:'SGODPAY'},
			{code:'SIHBIDJ1', text:'BANK SINAR HARAPAN BALI'},
			{code:'SIPAIDB1', text:'BANK SRI PARTHA'},
			{code:'SUNIIDJA', text:'BANK SUMITOMO MITSUI INDONESIA'},
			{code:'SUTEIDD1', text:'BPD SULAWESI TENGAH'},
			{code:'SUTRIDD1', text:'BANK SULTRA'},
			{code:'SWABIDJ1', text:'BANK SWAGUNA'},
			{code:'SWADIDD1', text:'BANK SWADESI'},
			{code:'SWAGIDJ1', text:'Bank Victoria Syariah'},
			{code:'SYACIDJ1', text:'BPD Aceh UUS'},
			{code:'SYBBIDJ1', text:'Bank Permata UUS'},
			{code:'SYBDIDJ1', text:'Bank Danamon UUS'},
			{code:'SYBKIDJ1', text:'BANK BII SYARIAH'},
			{code:'SYBRIDJ1', text:'BANK BRI SYARIAH'},
			{code:'SYBTIDJ1', text:'Bank Tabungan Negara (BTN) UUS'},
			{code:'SYCAIDJ1', text:'BANK BCA SYARIAH'},
			{code:'SYDKIDJ1', text:'Bank DKI UUS'},
			{code:'SYHSIDJ1', text:'HONGKONG SYARIAH'},
			{code:'SYJBIDJ1', text:'BANK JABAR BANTEN SYARIAH'},
			{code:'ANTDIDJD', text:"BANK ANTAR DAERAH"},
			{code:'SYJGIDJ1', text:'BPD Jawa Tengah UUS'},
			{code:'SYJMIDJ1', text:'BPD Jambi UUS'},
			{code:'SYJTIDJ1', text:'BPD Jawa Timur UUS'},
			{code:'SYKBIDJ1', text:'BPD Kalimantan Barat UUS'},
			{code:'SYKSIDJ1', text:'BPD Kalimantan Selatan UUS'},
			{code:'SYKTIDJ1', text:'BPD Kalimantan Timur UUS'},
			{code:'SYMDIDJ1', text:'BANK SYARIAH MANDIRI'},
			{code:'SYNBIDJ1', text:'BPD Nusa Tenggara Barat UUS'},
			{code:'SYNIIDJA', text:'BANK BNI SYARIAH'},
			{code:'SYONIDJ1', text:'Bank OCBC NISP UUS'},
			{code:'SYRIIDJ1', text:'BPD Riau Dan Kepri UUS'},
			{code:'SYSBIDJ1', text:'BPD Sumatera Barat UUS'},
			{code:'SYSSIDJ1', text:'BPD Sumsel Dan Babel UUS'},
			{code:'SYSUIDJ1', text:'BPD Sumut UUS'},
			{code:'SYTBIDJ1', text:'Bank Sinarmas UUS'},
			{code:'SYWSIDJ1', text:'BPD Sulselbar UUS'},
			{code:'SYYKIDJ1', text:'BPD Daerah Istimewa Yogyakarta (DIY) UUS'},
			{code:'TAPEIDJ1', text:'BANK TABUNGAN PENSIUNAN NASIONAL (BTPN)'},
			{code:'TCAHIDD1', text:'TCASH'},
			{code:'TELKIDD1', text:'TELKOMSEL (TCASH)'},
			{code:'UOBINDJA', text:'BANK UOB BUANA INDONESIA'},
			{code:'WGOPIDD1', text:'GoPay'},
			{code:'WIKEIDJ1', text:'BANK WINDU KENTJANA'},
			{code:'WOVOIDD1', text:'OVO'},
			{code:'YUDBIDJ1', text:'BANK Y'},
		]
var toBankCode=(()=>{
	var map={};
	banklist.forEach((value)=>{
		map[value.text]=value.code
	})
	return map;
})(),
toBankName=(()=>{
	var map={};
	banklist.forEach(v=>{
		map[v.code]=v.text;
	})
	return map;
})()
</script>