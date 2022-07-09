import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Status extends BaseModel {
  @column({ isPrimary: true })
  public id: number


  @column()
  public userId: number
  @column()
  public order_id: number
  @column()
  public blog_category_id: number
  @column()
  public meta: any
  @column()
  public data: any
  @column()
  public activity_text: string

  @column()
  public shortDescription: string

  @column()
  public activity_type: string
  @column()
  public description: string
  @column()
  public privacy: string
  @column()
  public views: number

  @column()
  public isPublished: string
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime


  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User,{
    onQuery: (query) => {
      query.select('id', 'first_name', 'last_name', 'username', 'profile_pic')
    }
  })
  public feedUser : BelongsTo<typeof User>
}
