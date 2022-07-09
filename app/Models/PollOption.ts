import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, hasOne,  HasOne, belongsTo, BelongsTo} from '@ioc:Adonis/Lucid/Orm'
import VoteOption from './VoteOption'
import User from './User'

export default class PollOption extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  pollId  : number
  
  @column()
  user_id  : number
  
  @column()
  total_vote  : number

  @column()
  text  : string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(()=>VoteOption, {
    onQuery: (q)=>{
      q.preload('user')
    },
    foreignKey: 'optionId',
    // localKey: 'optionId'
  })
  public voteOption : HasMany<typeof VoteOption>

  @hasOne(()=>VoteOption, {
    // onQuery: (q)=>{
    //   q.preload('user')
    // },
    foreignKey: 'optionId',
    // localKey: 'optionId'
  })
  public isVoted : HasOne<typeof VoteOption>

  @belongsTo(()=>User, {
    foreignKey:'user_id',
    onQuery: (query) => {
      query.select('id', 'first_name', 'last_name', 'username', 'profile_pic')
    },
  })
  public user : BelongsTo<typeof User>
}
