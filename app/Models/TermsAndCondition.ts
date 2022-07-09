import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class TermsAndCondition extends BaseModel {
  // static findOrCreate(arg: { ad_id: any; user_id: any; ad_type: any; activity_type: any }) {
  //   throw new Error('Method not implemented.')
  // }
  @column({ isPrimary: true })
  public id: number
  @column()
  public details: string


  @column.dateTime({ autoCreate: true })
public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
