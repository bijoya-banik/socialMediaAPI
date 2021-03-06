import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
export default class GroupValidator{
    public async validateGroupSchema(ctx : HttpContextContract){
      const limitUserSchema = schema.create({
        limit: schema.number(),

      })
      const msg =  {
        'limit.required': 'Limit is required',
        'limit.number': 'Limit must be a number'
      }
      try {
        const payload = await ctx.request.validate({ schema: limitUserSchema, messages : msg })
        return payload
      } catch (error) {
         return ctx.response.status(422).send(error.messages)
      }

    }
    public async validateGroupDataSchema(ctx : HttpContextContract){
      const limitUserSchema = schema.create({
        group_name: schema.string(),
        group_privacy: schema.string(),
        // category_name: schema.string(),
        about: schema.string({}, [
          rules.maxLength(1000)
        ])

      })
      const msg =  {
        'group_name.required': 'group_name is required',
        'group_name.string': 'group_name must be a string',
        'group_privacy.required': 'group_privacy is required',
        'group_privacy.string': 'group_privacy must be a string',
        // 'category_name.required': 'category_name is required',
        // 'category_name.string': 'category_name must be a string',
        'about.required': 'Description is required',
        'about.text': 'about must be in text type',
      }
      try {
        const payload = await ctx.request.validate({ schema: limitUserSchema, messages : msg })
        return payload
      } catch (error) {
         return ctx.response.status(422).send(error.messages)
      }
    }
    public async validateAddMemberData(ctx: HttpContextContract){
      const validateAddMemberData = schema.create({
        group_id: schema.number(),
        user_id: schema.number(),
        })
        const msg =  {
          'group_id.required': 'Invalid data sent',
          'user_id.required': 'Invalid data sent',
        }
        try {
          const payload = await ctx.request.validate({ schema: validateAddMemberData, messages : msg })
          return payload
        } catch (error) {
          return ctx.response.status(422).send(error.messages)
        }
    }
    public async validateNotiData(ctx: HttpContextContract){
      const validateNotiData = schema.create({
        noti_id: schema.number(),
        slug: schema.string(),
        })
        const msg =  {
          'noti_id.required': 'Invalid data sent',
          'slug.string': 'slug must be a string',
        }
        try {
          const payload = await ctx.request.validate({ schema: validateNotiData, messages : msg })
          return payload
        } catch (error) {
          return ctx.response.status(422).send(error.messages)
        }
    }
    public async validateDeleteGroupSchema(ctx: HttpContextContract){
      const validateDeleteGroupSchema = schema.create({
        group_id: schema.number(),
        })
        const msg =  {
          'group_id.required': 'Invalid data sent',
        }
        return ctx.request.validate({ schema: validateDeleteGroupSchema, messages : msg })

    }
}
