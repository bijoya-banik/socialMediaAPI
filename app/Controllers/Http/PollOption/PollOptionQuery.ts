import PollOption from 'App/Models/PollOption'
 import Feed from 'App/Models/Feed'

export default class PollOptionQuery{
    public async addPollOption(data) {
        return PollOption.create(data)
    }
    public async getSingleOption(option_id, user_id){
        return PollOption.query().where('id', option_id).preload('user')
        .preload('isVoted' , (q)=>{
            q.where('user_id', user_id)
        })
        .preload('voteOption').first()
    }
    public async checkPollAdmin(  poll_id){
        return await Feed.query().where('poll_id', poll_id).first()
    }
    public async checkOptionAdmin(  option_id){
        return await PollOption.query().where('id', option_id).first()
    }
    public async closeOption( poll_id, option_id){
        return await PollOption.query().where('poll_id', poll_id).where('id', option_id).delete();
    }
}
