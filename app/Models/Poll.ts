import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany , hasOne, HasOne} from '@ioc:Adonis/Lucid/Orm'
import PollOption from './PollOption'
import VoteOption from 'App/Models/VoteOption'
 
export default class Poll extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  voteByAnyOne  : string

  @column()
  is_multiple_selected  : number

  @column()
  allow_user_add_option  : number
  
  @column()
  user_id  : number
  
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
 

  @hasOne(() => VoteOption,{
    foreignKey: 'poll_id',
    localKey: 'id'
  })
  public isVotedOne : HasOne<typeof VoteOption>

  @hasMany(() => VoteOption,{
    foreignKey: 'poll_id',
    localKey: 'id'
  })
  public isVotedAnyOne : HasMany<typeof VoteOption>

  @hasMany(()=>PollOption, {
    foreignKey: 'pollId',
    localKey: 'id',
    onQuery: (query) =>{
      query.orderBy('total_vote', 'desc')
    }
    
  })
  public pollOptions : HasMany<typeof PollOption>
}
