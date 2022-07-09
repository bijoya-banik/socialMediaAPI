import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Inbox from './Inbox'

export default class InboxMember extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public inbox_id : number

  @column()
  public user_id : number

  @column()
  public ignore_msg : boolean

  @column()
  public mute_noti : number

  @column()
  public is_seen : boolean

  @column()
  public is_deleted? : number

  @column()
  public is_left? : number

  @column()
  public role : string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User,{
    foreignKey : 'user_id',
    onQuery: (q) =>{
        q.select('id', 'first_name', 'last_name', 'username', 'profile_pic','is_online')
    }
  })
  public user : BelongsTo<typeof User>
  
  @belongsTo(() => Inbox,{
    foreignKey : 'inbox_id',
  })
  public inbox : BelongsTo<typeof Inbox>
}
