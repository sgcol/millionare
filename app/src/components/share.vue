<template>
	<b-modal size="xl" :title="$t('Invite your friends')" hide-footer>
    <p style="font-size:18px;font-weight:bold">Dapatkan undangan uang tunai seumur</p>
    <b-list-group horizontal>
        <b-list-group-item variant="secondary" class="text-center">
            <p>jumlah undangan</p>
            <p>{{items.length}}</p>
        </b-list-group-item>
        <b-list-group-item variant="secondary"  class="text-center">
            <p>Untung</p>
            <p>{{formatedMoney(items.reduce((a, v)=>a+(v.reward||0), 0))}}</p>
        </b-list-group-item>
        <b-list-group-item variant="secondary" class="text-center">
            <p>Total isi ulang dari</p>
            <p>{{formatedMoney(items.reduce((a, v)=>a+(v.amount||0), 0))}}</p>
        </b-list-group-item>
    </b-list-group>
    <p class="text-center">{{$t('Share your invitation')}}</p>
    <div id="share-network-list">
        <ShareNetwork
            network="facebook"
            :url="invitationUrl"
            :title="$t('Free Rp4000 for you')"
            :quote="'Free Rp4000 for you\n'
                +'100 % Bernar\n'
                +'Omayden menerima cash back Rp23K!\n'
                +'TaniaDedi menerima cash back Rp37K!\n'
                +'Rikky menerima cash back Rp125K!\n'
                +'Install Millionare Free Rp4000 for you \n'
                +invitationUrl"
            hashtags="millionare"
            style="background-color:#1877f2"
        >
            <font-awesome-icon class="fah fa-lg" :icon="['fab', 'facebook-f']" /> Post
        </ShareNetwork>
        <ShareNetwork
            network="whatsapp"
            :url="invitationUrl"
            :title="$t('Free Rp4000 for you')"
            :description="'💖Free Rp4000 for you 💖\n'
                +'💯100 % Bernar💯\n'
                +'💎 Omayden menerima cash back Rp23K!\n'
                +'💎 TaniaDedi menerima cash back Rp37K!\n'
                +'💎 Rikky menerima cash back Rp125K!\n'
                +'👇Install Millionare Free Rp4000 for you 👇\n'
                +invitationUrl"
            style="background-color:#25d366"
        >
            <font-awesome-icon class="fah fa-lg" :icon="['fab', 'whatsapp']" /> Whatsapp
        </ShareNetwork>
    </div>
    <p class="text-center">{{$t('Or, copy the link')}}</p>
    <b-input-group size="sm" style="margin:auto; width:80%">
        <template #prepend>
            <b-input-group-text ><b-icon-link45deg /></b-input-group-text>
        </template>
        <b-form-input :value="invitationUrl"/>
        <template #append>
            <b-button size="sm" variant="secondary" @click="copyUrl()"><font-awesome-icon :icon="['far', 'copy']" /></b-button>
        </template>
    </b-input-group>
    <ul>
        <li><b-icon-check-circle-fill variant="success"/>Bagikan link eksklusif dengan teman atau grup Anda </li>
        <li><b-icon-check-circle-fill variant="success"/>Teman mengklik link eksklusif untuk mengunduh dan menginstal </li>
        <li><b-icon-check-circle-fill variant="success"/>Temen masuk ke game, selesai pertama kami akan mendapatkan 4000 rupiah hadiah, yang lain semuanya top up ada 5% hadiah nya</li>
    </ul>
    <p style="border-bottom:1px solid #dee2e6;"/>
    <b-form-group :label="$t('Invited friends')" label-size="">
        <b-table striped hover :items="items" :fields="cols">
            <template v-slot:cell(name)="row">
                <span>{{nameIt(row.item)}}</span>
            </template>
            <template v-slot:cell(amount)="row">
                <span v-if="!row.item.amount">{{$t('Joined Game')}}</span>
                <i18n path="recharged" tag="span" for="amount" v-else>
                    {{formatedMoney(row.item.amount)}}
                </i18n>
<!-- 
                    {{$t('Recharged ')+row.item.amount}} -->
            </template>
        </b-table>
    </b-form-group>
	</b-modal>		
</template>

<script>
import Vue from 'vue'
import {BIconCheckCircleFill, BIconLink45deg} from 'bootstrap-vue'
import VueSocialSharing from 'vue-social-sharing'
import { mapState } from 'vuex'
import {openLink, eventBus} from '../client'
import {get} from 'object-path'
import conf from '../conf'

Vue.use(VueSocialSharing);

const sock=openLink();

export default {
    name:'Share',
    components:{
        BIconCheckCircleFill,BIconLink45deg,
    },
    computed: {
        ...mapState({
            me: state => state.me,
        }),
        invitationUrl() {
            return location.origin+'/s?'+this.inviteCode();
        }
    },
	methods:{
        formatedMoney(money) {
			if (conf.locale==='in_ID') {
				if (money>1000) return Math.floor(money/1000)+'k';
			}
			return money;
		},
        nameIt(item) {
            return get(item, 'userData.0.name', item._id)
        },
		show() {
			this.$children[0].show();
		},
		hide() {
			this.$children[0].hide()
        },
        inviteCode() {
            if (!this.me._id) return 'wait';
            const _map='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
            var result='';
            for (var i=0; i<this.me._id.length; i+=3) {
                var n=parseInt(this.me._id.slice(i, i+3), 16), _h=n>>6, _l=n&63;
                result+=_map[_h]+_map[_l];
            }
            return result;
        },
        decode(str) {
            var ret='', a='a'.charCodeAt(), z='z'.charCodeAt(), Z='Z'.charCodeAt(), A='A'.charCodeAt(), char0='0'.charCodeAt(), char9='9'.charCodeAt(); 
            function toNum(c) {
                if (c<=z && c>=a) return c-a;
                if (c<=Z && c>=A) return 26+c-A;
                if (c>=char0 && c<=char9) return 52+c-char0;
                if (c=='-'.charCodeAt()) return 62;
                if (c=='_'.charCodeAt()) return 63;
                return NaN; 
            }
            for (var i=0; i<str.length; i+=2) {
                var _h=str.charCodeAt(i), _l=str.charCodeAt(i+1);
                var x=toNum(_h)*64+toNum(_l);
                ret+=x.toString(16);
            }
            return ret;
        },
        copyUrl() {
            var self=this;
            if (!navigator.clipboard) {
                return self.$bvModal.msgBoxOk(self.$i18n.t('Failed to copy content. You may copy the url manually'), {
                    title:self.$i18n.t('Error')
                });
            }
            navigator.clipboard.writeText(this.invitationUrl).then(()=>{
                self.$bvModal.msgBoxOk(self.$i18n.t('The url has been copied to your clipboard'), {
                    title:self.$i18n.t('Success')
                });
            }).catch(()=>{
                self.$bvModal.msgBoxOk(self.$i18n.t('Failed to copy content. You may copy the url manually'), {
                    title:self.$i18n.t('Error')
                });
            })
        }
    },
    data() {
        return {
            items:[],
            cols:[
                {key:'name', label:this.$i18n.t('Name')},
                {key:'amount', label:this.$i18n.t('Status')},
                {key:'reward', label:this.$i18n.t('Reward'), formatter:this.formatedMoney},
            ]
        }
    },
    mounted() {
        var self=this;
        eventBus.$on('logined', ()=>{
            sock.emit('invitee/list', (err, list)=>{
                self.items=list;
            })
        })
    }
}
</script>

<style scoped>
h4 {
	margin: 20px;
	font-size: 20px;
}
p {
	margin: 10px 0 5px 0;
}
ul {
    margin: 10px;
    list-style: none;
    display: grid;
    grid-gap: 0.3rem;
}
#share-network-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1000px;
    margin: auto;
}
a[class^="share-network-"] {
    flex: none;
    color: #FFFFFF;
    background-color: #333;
    border-radius: 3px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    cursor: pointer;
    margin: 0 10px 10px 0;
    padding:0 10px 0 0;
}
.fah {
    margin: 8px;
}
</style>