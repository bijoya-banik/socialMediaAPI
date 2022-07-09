import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PolicyPage extends BaseModel {
  // static findOrCreate(arg: { ad_id: any; user_id: any; ad_type: any; activity_type: any }) {
  //   throw new Error('Method not implemented.')
  // }
  @column({ isPrimary: true })
  public id: number
  @column()
  public name: string
  @column()
  public route_name: string
  @column()
  public data: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

