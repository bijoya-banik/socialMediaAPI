import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import VoteOptionService from './VoteOptionService';
import VoteOptionValidator from './VoteOptionValidator';
export default class VoteOptionController {
  private voteoptionService : VoteOptionService
  private voteoptionValidator : VoteOptionValidator
  constructor () {
    this.voteoptionService =  new VoteOptionService()
    this.voteoptionValidator =  new VoteOptionValidator()
  }
  public async addVoteOption(ctx : HttpContextContract) {
    await this.voteoptionValidator.validateVoteOptionSchema(ctx)
    return this.voteoptionService.addVoteOption(ctx)
  }
  public async getVotedPeople(ctx : HttpContextContract) {
     return this.voteoptionService.getVotedPeople(ctx)
  }
   
}
