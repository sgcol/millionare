<template>
	<b-modal :title="$t('Verify your phone')" hide-footer>
		<b-form>				
			<b-form-group	id="login-phone">
				<b-form-input
					v-model="mobile"
					type="tel"
					required
					:placeholder="$t('Phone number')"
				></b-form-input>
			</b-form-group>
					<b-form-group>
						<b-input-group>
							<b-form-input
								v-model="otp"
								type="text"
								required
								:placeholder="$t('Enter OTP')"
							></b-form-input>
							<b-input-group-append>
								<b-button variant="outline-info">{{$t('Send OTP')}}</b-button>
							</b-input-group-append>
						</b-input-group>
					</b-form-group>
			<b-form-group>
				<b-button block v-b-modal.modal-reset variant="primary">{{$t('Next')}}</b-button>
				<b-modal id="modal-reset" :title="$t('Reset password')" hide-footer>
					<b-form>
						<b-form-group>
							<b-form-input v-model="$v.password.$model" type="password" required :placeholder="$t('Password')" :state="validateState('password')" aria-describedby="input-password-live-feedback"></b-form-input>
							<b-form-invalid-feedback id="input-password-live-feedback">{{$t('Must be at least 6 characters')}}</b-form-invalid-feedback>
						</b-form-group>
						<b-form-group>
							<b-form-input v-model="$v.repeat_password.$model" type="password" required :placeholder="$t('Repeat password')" :state="validateState('password')" aria-describedby="input-password-live-feedback"></b-form-input>
							<b-form-invalid-feedback id="input-repeat-password-live-feedback">{{$t('Must be same as password')}}</b-form-invalid-feedback>
						</b-form-group>
						<b-form-group>
							<b-button block variant="primary">{{$t('Reset')}}</b-button>
						</b-form-group>
					</b-form>
				</b-modal>
			</b-form-group>
		</b-form>
	</b-modal>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required, minLength, sameAs } from "vuelidate/lib/validators";

export default {
	name:'forgot',
	mixins: [validationMixin],
	data() {
		return {
			mobile:null,
			otp:null,
			password:null,
			repeat_password:null
		}
	},
	methods:{
		validateState(name) {
			const { $dirty, $error } = this.$v[name];
		return $dirty ? !$error : null;
		},
		show() {
			this.$children[0].show();
		},
		hide() {
			this.$children[0].hide();
		}

	},
	validations:{
		password:{
			required,
			minLength:minLength(6)
		},
		repeat_password:{
			required,
			same:sameAs('password')
		}
	}
}
</script>