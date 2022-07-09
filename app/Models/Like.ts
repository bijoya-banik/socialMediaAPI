import { DateTime } from 'luxon'
import { BaseModel, column ,belongsTo, BelongsTo, HasMany, hasMany} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
export default class Like extends BaseModel {
  public serializeExtras = true
  @column({ isPrimary: true })
  public id: number
  @column()
  public feedId: number
  @column()
  public userId: number

  @column()
  public reaction_type: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User,{
    onQuery: (query) => {
      query.select('id', 'username', 'profile_pic', 'first_name', 'last_name')
    }
  })
  public user : BelongsTo<typeof User>

  @hasMany(() => Like,{
    foreignKey: 'reaction_type',
    localKey: 'reaction_type',
  })
  public likeTypeCountation : HasMany<typeof Like>
}
