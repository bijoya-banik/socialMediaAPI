import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Commentlike extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public userId: number
  @column()
  public commentId: number
  @column()
  public total_likes: number
  @column()
  public reaction_type: string
  @belongsTo(() => User,{
    onQuery: (query) => {
      query.select('id', 'username', 'profile_pic', 'first_name', 'last_name')
    }
  })
  public user : BelongsTo<typeof User>
}
