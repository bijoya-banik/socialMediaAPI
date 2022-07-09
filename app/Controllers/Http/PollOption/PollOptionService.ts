import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PollOptionQuery from './PollOptionQuery';
export default class PollOptionService {
    private polloptionQuery : PollOptionQuery
    constructor(){
      this.polloptionQuery = new PollOptionQuery
    }
    public async addPollOption(ctx : HttpContextContract){
      const data = ctx.request.all()
      let userId:any = ctx.auth.user?.id
      let create_option = await this.polloptionQuery.addPollOption({
        user_id:userId,
        total_vote:0,
        pollId:data.poll_id,
        text:data.text,
      })
      return this.polloptionQuery.getSingleOption(create_option.id, userId)
   }
    public async closeOption(ctx : HttpContextContract){
      const data = ctx.request.all()
      let userId:any = ctx.auth.user?.id
      if(!userId) return ctx.response.status(401).send({msg: 'User is not available.'})

      let poll_id:number = data.poll_id
      let option_id:number = data.option_id
      let checkAdmin:any = await this.polloptionQuery.checkPollAdmin( poll_id)
      let checkOptionAdmin:any = await this.polloptionQuery.checkOptionAdmin( option_id)
      if(!checkAdmin && !checkOptionAdmin) return ctx.response.status(422).send({msg: 'Option closed.'})
      // return {checkAdmin:checkAdmin  ,checkOptionAdmin: checkOptionAdmin , userId:userId}
      // console.log("checkAdmin.user_id", checkAdmin.userId, "checkOptionAdmin.user_id", checkOptionAdmin.user_id)
      if(( checkAdmin && checkAdmin.userId != userId  ) && (checkOptionAdmin && checkOptionAdmin.user_id != userId )) return ctx.response.status(422).send({msg: 'You are not authorised.'})
      return this.polloptionQuery.closeOption( poll_id, option_id)
   }
};
