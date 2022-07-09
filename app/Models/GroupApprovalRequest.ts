import { DateTime } from 'luxon'
import { BaseModel, column ,  belongsTo,  BelongsTo,} from '@ioc:Adonis/Lucid/Orm'
import User from './User';

export default class GroupApprovalRequest extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public admin_id: number

  @column()
  public group_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'user_id',
    onQuery: (q) =>{
      q.select('id', 'first_name', 'last_name', 'profile_pic', 'username')
   }
  })
  public user : BelongsTo<typeof User>
}
