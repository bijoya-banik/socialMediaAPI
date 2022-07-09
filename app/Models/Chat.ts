import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo ,column , hasOne, HasOne} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Inbox from './Inbox'

export default class Chat extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  userId : number
  @column()
  msg : string
  @column()
  inbox_key : string
  @column()
  meta_data ?: string
  @column()
  is_deleted : number
  @column()
  files : string
  @column()
  reply_files ?: string
  @column()
  reply_id : number
  @column()
  reply_msg : string
  @column()
  is_seen : boolean


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User,{
    foreignKey : 'userId',
    onQuery: (q) =>{
        q.select('id', 'first_name', 'last_name', 'username', 'profile_pic','is_online')
    }
  })
  public user : BelongsTo<typeof User>

  @hasOne(() => Inbox,{
    foreignKey : 'inbox_key',
    localKey :'inbox_key'
  })
  public conversation : HasOne<typeof Inbox>

}
