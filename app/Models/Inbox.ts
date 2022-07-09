import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo,hasMany, HasMany, column,HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Chat from './Chat'
import User from './User'
import InboxMember from './InboxMember'

export default class Inbox extends BaseModel {
  public serializeExtras = true

  @column({ isPrimary: true })
  public id: number


  @column()
  public userId : number

  @column()
  public buddy_id : number
  @column()
  public is_deleted? : number
  @column()
  public inbox_key : string
  @column()
  public is_seen? : number
  @column()
  public is_group? : number
  @column()
  public group_name? : string
  @column()
  public group_logo? : string

  @column()
  public member_names : string
  @belongsTo(() => Chat,{
    localKey : 'inbox_key',
    foreignKey : 'inbox_key',
    onQuery: (q) =>{
        q.orderBy('id', 'desc')
    }
  })
  public lastmsg : BelongsTo<typeof Chat>

  @hasMany(() => Chat,{
    localKey : 'inbox_key',
    foreignKey : 'inbox_key',
    onQuery: (q) =>{
       q.select('id')
      //  q.groupBy('id')
      //  q.count('id as total')
    }
  })
  public unreads : HasMany<typeof Chat>
  @belongsTo(() => User,{
    foreignKey : 'buddy_id',
    onQuery: (q) =>{
        q.select('id', 'first_name', 'last_name', 'username', 'profile_pic','is_online')
    }
  })
  public buddy : BelongsTo<typeof User>

  

  @hasMany(() => InboxMember,{
    foreignKey : 'inbox_id',
  })
  public group_members : HasMany<typeof InboxMember>

  @hasOne(() => InboxMember,{
    foreignKey : 'inbox_id',
  })
  public is_group_member : HasOne<typeof InboxMember>



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
