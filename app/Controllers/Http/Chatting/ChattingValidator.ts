import { schema, rules} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
export default class ChattingValidator{
    public async validateChattingSchema(ctx : HttpContextContract){
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
    public async validateUpdateGroupData(ctx :  HttpContextContract){
      const createFeedSchema = schema.create({
        inbox_id:schema.number(),
        group_name: schema.string.optional({escape: true}, [
           rules.maxLength(150)
        ]),
        // file: schema.string.optional(),
        file:  schema.file.optional({
          size: '10mb',
          extnames: ['jpg', 'gif', 'png', 'PNG', 'JPG', 'JPEG', 'GIF'],
        }),
      })
      const msg =  {
        'inbox_id.required': 'Something went wrong',
        'inbox_id.number': 'Something went wrong',
        'group_name.maxLength': 'You can add maximum of 150 characters',
        // 'file.required': 'Upload a picture',
        'file.size': 'You can upload maximum of 5mb',
        'file.extnames': 'Please upload image file',
      }
      return await ctx.request.validate({ schema: createFeedSchema, messages : msg })
    }
    public async groupmemberValidation(ctx :  HttpContextContract){
      const createFeedSchema = schema.create({
        inbox_id:schema.number(),
        buddy_id:schema.number(),
      })
      const msg =  {
        'inbox_id.required': 'Something went wrong',
        'inbox_id.number': 'Something went wrong',
        'buddy_id.required': 'Something went wrong',
        'buddy_id.number': 'Something went wrong',
      }
      return await ctx.request.validate({ schema: createFeedSchema, messages : msg })
    }
}
