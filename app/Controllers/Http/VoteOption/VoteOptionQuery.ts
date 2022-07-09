import VoteOption from 'App/Models/VoteOption'
import PollOption from 'App/Models/PollOption'
import Poll from 'App/Models/Poll'

export default class VoteOptionQuery{
    public async getVotedPeople(poll_id, option_id){
        return await VoteOption.query()
        .where('poll_id', poll_id)
        .where('option_id',  option_id)
        .preload('user')
    }
    public async getPoll(id){
        return Poll.query().where('id', id).first()
    }
    public async isHaveVote(user_id, option_id){
        return await VoteOption.query()
        .where('user_id', user_id)
        .where('option_id',  option_id)
        .first();
    }
    public async votedList(user_id, poll_id){
        return await VoteOption.query()
        .where('user_id', user_id)
        .where('poll_id',  poll_id)
         
    }
    public async deleteVote(user_id, option_id){
        return await VoteOption.query()
        .where('user_id', user_id)
        .where('option_id',  option_id)
        .delete();
    }
    public async decreaseTotalVote(option_id){
        console.log('option_id',option_id)
        return await PollOption.query().where('id', option_id).decrement('total_vote', 1)
    }
    public async increaseTotalVote(option_id){
        return await PollOption.query().where('id', option_id).increment('total_vote', 1)
    }
    public async addVoteOption(data) {
        return VoteOption.firstOrCreate(data)
    }
    public async optionVotes(poll_id, option_id){
        return VoteOption.query().where('poll_id', poll_id).where('option_id', option_id).preload('user')
    }
}
