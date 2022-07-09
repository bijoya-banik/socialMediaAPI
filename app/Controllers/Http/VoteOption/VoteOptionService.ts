import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VoteOptionQuery from './VoteOptionQuery';
export default class VoteOptionService {
    private voteoptionQuery : VoteOptionQuery
    constructor(){
      this.voteoptionQuery = new VoteOptionQuery
    }
    public async getVotedPeople(ctx : HttpContextContract){
      const data = ctx.request.all()
      let poll_id :number= data.poll_id
      let option_id :number= data.option_id
      let userId:any = ctx.auth.user?.id 
      if(!poll_id || !option_id ||  !userId )return  ctx.response.status(401).send({message:"You are not authorised"})
      return this.voteoptionQuery.getVotedPeople(poll_id, option_id)
    }
    public async addVoteOption(ctx : HttpContextContract){
      const data = ctx.request.all()
      let userId:any = ctx.auth.user?.id 
       
      let poll = await this.voteoptionQuery.getPoll(data.poll_id)
      if(!poll) return  ctx.response.status(401).send({msg: 'Poll has been closed.'})
      
      const isHaveVote:any = await this.voteoptionQuery.isHaveVote(userId,  data.option_id)
      const votedList = await this.voteoptionQuery.votedList(userId, data.poll_id)

      // return{ votedList:votedList, isHaveVote:isHaveVote}
      if(isHaveVote ){
        await this.voteoptionQuery.deleteVote(userId, isHaveVote.optionId )
        await this.voteoptionQuery.decreaseTotalVote( isHaveVote.optionId )
        return this.voteoptionQuery.optionVotes(data.poll_id, data.option_id)
      }else if( poll.is_multiple_selected == 0 && votedList.length > 0  ){
        for(let i of votedList){
          await this.voteoptionQuery.deleteVote(userId, i.optionId )
          await this.voteoptionQuery.decreaseTotalVote( i.optionId )
        }
      }

      // console.log(isHaveVote,"prior")
      // if(!isHaveVote || (isHaveVote && isHaveVote.optionId != data.option_id)){
        await this.voteoptionQuery.addVoteOption({ 
          user_id:userId, 
          option_id:data.option_id,
          poll_id:data.poll_id 
         })
        await this.voteoptionQuery.increaseTotalVote( data.option_id )
      // }
      
      return this.voteoptionQuery.optionVotes(data.poll_id, data.option_id)
   }
   
};
