import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
 

export default class VoteOption extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  userId  : number

  @column()
  optionId  : number

  @column({columnName: 'poll_id', serializeAs: 'poll_id'})
  poll_id  : number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(()=>User, {
    onQuery: (query) => {
      query.select('id', 'first_name', 'last_name', 'username', 'profile_pic')
    },
    // foreignKey: 'id',
    // localKey: 'userId'
  })
  public user : BelongsTo<typeof User>
}
