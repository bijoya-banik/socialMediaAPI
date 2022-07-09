// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail';
import AuthQuery from './AuthQuery';
import User from '../../../Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Env from '@ioc:Adonis/Core/Env'
export default class AuthService {
    private authQuery : AuthQuery
    constructor(){
      this.authQuery = new AuthQuery
    }
    public async createUser(userData, ctx){
        let number = Math.floor(Math.random() * 899999 + 100000)
        delete userData.agree
        delete userData.password_confirmation
        let username = userData.first_name +'_'+userData.last_name
        let totalUsers : any[] = await this.authQuery.searchUsername(username)
        let numberOfUsers : number = totalUsers[0].total
        let newCount = ''
        if(numberOfUsers >0 ){
         let lastUser:any  =  await this.authQuery.fetchLatestUserName(username)
          newCount = lastUser.id
        }
        username = numberOfUsers > 0 ? `${username}_${newCount}` : username
        userData.username = username
        userData.forgot_code= number
        let data = ctx.request.all()
        userData.facebookHandle = data.facebookHandle?data.facebookHandle:''

        userData.code_expired= new Date(),
        userData.is_banned='unverified'
        let user = await this.authQuery.createUser(userData)
        // if(user){
        //   let obj ={
        //     username: user?.first_name +' '+user?.last_name,
        //     token:user?.forgot_code
        //   }
        //   this.sendEmail(obj, user.email)
        // }
        return ctx.response.status(200).send({ msg: 'Account created successfully!' })

    }
    async updateCode(uid, number){
      let ob = {
        forgot_code: number,
        code_expired: new Date()
      }
      // console.log(ob, "object", uid)
      await this.authQuery.updateUser( 'id', uid, ob )
    }
    sendEmail(obj, email){
        let is_carevan = Env.get('IS_CAREVAN')? Env.get('IS_CAREVAN'): 'no';
        let file ='emails/verification_emai';
        let msgOb = {
          fromEmail:'preranadas97@gmail.com',
          fromTitle:'Divine 9',
          subject:'Please confirm your email address',
        }
        if(is_carevan == 'yes'){
          file ='carevan/verification_emai';
          msgOb = {
            fromEmail:'no-reply@joincarevan.com',
            fromTitle:'Carevan',
            subject:'Carevan | Please activate your account',
          }
        }
        Mail.send((message) => {
        message
            .from(msgOb.fromEmail,msgOb.fromTitle )
            .to(email)
            .subject(msgOb.subject)
            .htmlView(file,  obj)
      })
    }
    sendResetToken(obj, email){
        let is_carevan = Env.get('IS_CAREVAN')? Env.get('IS_CAREVAN'): 'no';
        let file ='emails/password_reset';
        let msgOb = {
          fromEmail:'preranadas97@gmail.com',
          fromTitle:'Divine 9',
          subject:'Please reset your password',
        }
        if(is_carevan == 'yes'){
          file ='carevan/password_reset';
          msgOb = {
            fromEmail:'no-reply@joincarevan.com',
            fromTitle:'Carevan',
            subject:'Carevan | Please reset your password',
          }
        }
        Mail.send((message) => {
        message
            .from(msgOb.fromEmail,msgOb.fromTitle )
            .to(email)
            .subject(msgOb.subject)
            .htmlView(file,  obj)
      }).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        // console.log('sendgrid error------------------------')
        console.log(error.response.body)
        // console.log(error.response.body.errors[0].message)
    })
    }
    async deleteAccount(user_id){
      let fetch_user:any = await this.authQuery.fetch_user_data(user_id)
      await this.authQuery.deleteAccount(user_id)

      if(fetch_user && fetch_user.isGroupMember && fetch_user.isGroupMember.length ){
         for (let groups of fetch_user.isGroupMember) {
          if( groups.is_admin != 'super admin'){
             await this.authQuery.decrementGroupMember(groups.group_id, '-1')
         }
        }
      }
      if(fetch_user && fetch_user?.isPageFollower && fetch_user?.isPageFollower.length ){
        for (let page of fetch_user.isPageFollower) {
          if( page.page && page.page.user_id != user_id){
            await this.authQuery.decrementPageLike(page.page.id, '-1')
          }
         }
       }
       return fetch_user

    }
    async webLogin(ctx){
      let data = ctx.request.all();
      let user :any = await this.authQuery.getSingleUserInfo('email', data.email)
      if(!user){
        return ctx.response.status(401).send({ msg: 'Invalid email or password. Please try again.' })
      }
      if(!await Hash.verify(user.password, data.password)){
        return ctx.response.status(401).send({ msg: 'Invalid email or password. Please try again.' })
      }


      if (user.is_banned == "unverified") {
        return ctx.response.status(401).send({ msg: 'Your account is not verified !',
         unverified:true ,email:user.email })
      }
       // const hashedPassword = await Hash.make(data.password)
       try{
        let user = await ctx.auth.use("web").attempt(data.email, data.password)
        await User.query().where('id',user.id).update({is_online:'online'})
        return user
      }catch (error) {
        return ctx.response.status(401).send({ msg: 'Invalid email or password. Please try again.' })
      }


    }
    async appLogin(data, ctx){
      try {
        let user = await this.authQuery.getSingleUserInfo('email',data.email)
          if(!user){
            return ctx.response.status(401).send({msg : 'No account found with this email!'})
          }
          // if (user.is_banned == "unverified") {
          //   return ctx.response.status(401).send({ msg: 'Your account is not verified !', unverified:true ,email:user.email })
          // }
          let appToken = ctx.request.all().appToken
          let login = await ctx.auth.use("api").attempt(data.email, data.password)
          if(login && appToken){
           await this.authQuery.updateUser('id', user.id, {
             appToken: appToken
            })
            let last_active =Math.round(Date.now() / 1000)
            await User.query().where('id',user.id).update({is_online:'online',last_active:last_active})
            return login
          }

        return login

      } catch (error) {
        return ctx.response.status(401).send({ msg: 'Invalid email or password. Please try again.' })
      }

    }
    public async sendResetTokenPrior(ctx,data){
      const userInfo :any = await User.findBy('email', data.email)
      if (!userInfo) {
        return ctx.response.status(401).send({ msg: 'Invalid credential!' })
      }

      // generating number
      let number = Math.floor(Math.random() * 899999 + 100000)

       await this.authQuery.updateUser('id', userInfo.id, {
        forgot_code: number,
        code_expired: new Date()
      })

      let userInfo2 :any = await User.findBy('email', data.email)
      let obj ={
        username: userInfo2?.first_name +' '+userInfo2?.last_name,
        token:userInfo2?.forgot_code
      }
      await Mail.send((message) => {
        message
          .from('preranadas97@gmail.com','Divine 9')
          .to(data.email)
          .subject('Please confirm your email address')
          .htmlView('emails/password_reset', obj)
      })

      return ctx.response.status(200).send({ msg: 'Verification code sent successfully!' })

    }

    public async verifyEmail(ctx) {
      let data = ctx.request.all()


      const user :any = await User.query().where('email', data.email).where('forgot_code', data.verificationCode).first();
      if (!user) {
        return ctx.response.status(401).send({ msg: 'Invalid Request or Token is invalid!' })
      }
       await this.authQuery.updateUser('id', user.id, {
        forgot_code: null,
        code_expired: null,
        is_banned: 'no',
      })

      return ctx.response.status(200).send({ msg: 'Account verified successfully!' })

    }

    public async verifyCode(ctx,data) {
      const user :any = await this.authQuery.singleUserToken('email', data.email, data.verificationCode)
      if (user && user.forgot_code == data.verificationCode) {
        return ctx.response.status(200).send({ msg: 'Succeed! Enter to a new password.' })
      } else {
        return ctx.response.status(401).send({ msg: 'Invalid Code!' })
      }
    }


    public async passwordReset(ctx,data) {
      // let data = ctx.request.all();
      const userInfo :any = await this.authQuery.getSingleUserInfo('email', data.email)
      if (!userInfo){
        return ctx.response.status(401).send({ msg: 'Invalid Credential!' })
      }
       await this.authQuery.updateUser('id', userInfo.id, {
        password: await Hash.make(data.password),
        forgot_code: null,
        code_expired: null
      })

      return ctx.response.status(200).send({ msg: 'Password updated successfully!' })
      // return ctx.auth.use("web").attempt(data.email, data.password)
    }

    async updateOnline(user, isOnline){
       return this.authQuery.updateOnline(user.id, isOnline)
    }
    async fetchUSer(user){
       return this.authQuery.fetchUSer(user.id)
    }
    async onlineStatusAndLogout(user, isOnline){
      return this.authQuery.onlineStatusAndLogout(user.id, isOnline)
    }



};
